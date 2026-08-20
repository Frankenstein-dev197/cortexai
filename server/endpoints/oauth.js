const crypto = require("crypto");
const { User } = require("../models/user");
const { EventLogs } = require("../models/eventLogs");
const { makeJWT } = require("../utils/http");
const { SystemSettings } = require("../models/systemSettings");

const PROVIDERS = {
  google: {
    clientId: () => process.env.GOOGLE_CLIENT_ID,
    clientSecret: () => process.env.GOOGLE_CLIENT_SECRET,
    authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
  },
  github: {
    clientId: () => process.env.GITHUB_CLIENT_ID,
    clientSecret: () => process.env.GITHUB_CLIENT_SECRET,
    authorizeUrl: "https://github.com/login/oauth/authorize",
    tokenUrl: "https://github.com/login/oauth/access_token",
  },
};

function base64url(value) {
  return Buffer.from(value).toString("base64url");
}

function createState(provider) {
  const payload = base64url(
    JSON.stringify({
      provider,
      nonce: crypto.randomBytes(24).toString("hex"),
      iat: Date.now(),
      exp: Date.now() + 10 * 60 * 1000,
    })
  );
  const signature = crypto
    .createHmac("sha256", process.env.JWT_SECRET || "")
    .update(payload)
    .digest("base64url");
  return `${payload}.${signature}`;
}

function verifyState(state, provider) {
  try {
    const [payload, signature] = String(state || "").split(".");
    if (!payload || !signature || !process.env.JWT_SECRET) return false;

    const expected = crypto
      .createHmac("sha256", process.env.JWT_SECRET)
      .update(payload)
      .digest("base64url");
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;

    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return (
      data.provider === provider &&
      Number.isFinite(data.exp) &&
      data.exp > Date.now()
    );
  } catch {
    return false;
  }
}

function publicBaseUrl(request) {
  return (
    process.env.CORTEX_PUBLIC_URL?.replace(/\/$/, "") ||
    `${request.protocol}://${request.get("host")}`
  );
}

function redirectUri(request, provider) {
  const envKey = `${provider.toUpperCase()}_OAUTH_REDIRECT_URI`;
  return process.env[envKey] || `${publicBaseUrl(request)}/api/auth/${provider}/callback`;
}

function frontendLoginUrl(request, fragment) {
  const frontend = (
    process.env.CORTEX_FRONTEND_URL || publicBaseUrl(request)
  ).replace(/\/$/, "");
  return `${frontend}/login${fragment ? `#${fragment}` : ""}`;
}

function randomPassword() {
  return `${crypto.randomBytes(48).toString("base64url")}Aa1!`;
}

async function exchangeCode(provider, code, request) {
  const config = PROVIDERS[provider];
  const body = new URLSearchParams({
    client_id: config.clientId(),
    client_secret: config.clientSecret(),
    code,
    redirect_uri: redirectUri(request, provider),
  });

  if (provider === "google") body.set("grant_type", "authorization_code");

  const response = await fetch(config.tokenUrl, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  const data = await response.json();
  if (!response.ok || !data.access_token) {
    throw new Error(data.error_description || data.error || "OAuth token exchange failed");
  }
  return data.access_token;
}

async function fetchIdentity(provider, accessToken) {
  if (provider === "google") {
    const response = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await response.json();
    if (!response.ok || !data.email || data.email_verified === false) {
      throw new Error("Google did not return a verified email address.");
    }
    return {
      email: String(data.email).trim().toLowerCase(),
      name: data.name || data.email,
      picture: data.picture || null,
    };
  }

  const profileResponse = await fetch("https://api.github.com/user", {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${accessToken}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  const profile = await profileResponse.json();
  if (!profileResponse.ok) throw new Error("GitHub profile lookup failed.");

  let email = profile.email;
  if (!email) {
    const emailsResponse = await fetch("https://api.github.com/user/emails", {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${accessToken}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
    const emails = await emailsResponse.json();
    if (!emailsResponse.ok) throw new Error("GitHub email lookup failed.");
    email = emails.find((item) => item.primary && item.verified)?.email;
  }

  if (!email) throw new Error("GitHub did not return a verified email address.");
  return {
    email: String(email).trim().toLowerCase(),
    name: profile.name || profile.login || email,
    picture: profile.avatar_url || null,
  };
}

async function findOrCreateUser(identity) {
  let user = await User._get({ username: identity.email });
  if (user) return user;

  const created = await User.create({
    username: identity.email,
    password: randomPassword(),
    role: "default",
    bio: identity.name || "",
  });
  if (!created.user) throw new Error(created.error || "Could not create OAuth user.");
  user = await User._get({ username: identity.email });
  if (!user) throw new Error("OAuth user could not be loaded after creation.");
  return user;
}

function oauthEndpoints(app) {
  if (!app) return;

  app.get("/auth/:provider", async (request, response) => {
    try {
      const { provider } = request.params;
      const config = PROVIDERS[provider];
      if (!config) return response.status(404).json({ error: "Unsupported OAuth provider." });
      if (!(await SystemSettings.isMultiUserMode())) {
        return response.status(400).json({ error: "OAuth login requires multi-user mode." });
      }
      if (!process.env.JWT_SECRET || !config.clientId() || !config.clientSecret()) {
        return response.status(503).json({ error: `${provider} OAuth is not configured.` });
      }

      const params = new URLSearchParams({
        client_id: config.clientId(),
        redirect_uri: redirectUri(request, provider),
        response_type: "code",
        state: createState(provider),
      });

      if (provider === "google") {
        params.set("scope", "openid email profile");
        params.set("access_type", "offline");
        params.set("prompt", "select_account");
      } else {
        params.set("scope", "read:user user:email");
      }

      return response.redirect(`${config.authorizeUrl}?${params.toString()}`);
    } catch (error) {
      console.error("OAuth start failed:", error);
      return response.status(500).json({ error: "Unable to start OAuth login." });
    }
  });

  app.get("/auth/:provider/callback", async (request, response) => {
    const { provider, code, state, error } = request.query;
    try {
      if (!PROVIDERS[provider]) throw new Error("Unsupported OAuth provider.");
      if (error) throw new Error(`OAuth provider returned: ${error}`);
      if (!code || !verifyState(state, provider)) throw new Error("Invalid or expired OAuth state.");
      if (!(await SystemSettings.isMultiUserMode())) throw new Error("OAuth login requires multi-user mode.");

      const accessToken = await exchangeCode(provider, code, request);
      const identity = await fetchIdentity(provider, accessToken);
      const user = await findOrCreateUser(identity);
      if (user.suspended) throw new Error("Account suspended by admin.");

      const sessionToken = makeJWT(
        { id: user.id, username: user.username },
        process.env.JWT_EXPIRY
      );

      await EventLogs.logEvent(
        "oauth_login_event",
        { provider, ip: request.ip || "Unknown IP", username: user.username },
        user.id
      );

      // A URL fragment is never sent back to the server, so the short-lived
      // session token is not placed in the query string or HTTP Referer.
      return response.redirect(
        frontendLoginUrl(request, `oauth_token=${encodeURIComponent(sessionToken)}`)
      );
    } catch (oauthError) {
      console.error("OAuth callback failed:", oauthError);
      const message = encodeURIComponent(oauthError.message || "OAuth login failed.");
      return response.redirect(frontendLoginUrl(request, `oauth_error=${message}`));
    }
  });
}

module.exports = { oauthEndpoints };
