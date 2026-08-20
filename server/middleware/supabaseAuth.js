const { createClient } = require("@supabase/supabase-js");
const crypto = require("crypto");
const { User } = require("../models/user");

let client = null;

function getSupabaseClient() {
  if (client) return client;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}

async function getOrCreateCortexUser(supabaseUser) {
  const email = String(supabaseUser.email || "").trim().toLowerCase();
  if (!email) throw new Error("Authenticated Supabase user has no email address.");

  // Cortex historically identifies users by username. Keep that identifier stable
  // while Supabase remains the authoritative identity/session provider.
  let user = await User._get({ username: email });
  if (user) return user;

  const password = `${crypto.randomBytes(48).toString("base64url")}Aa1!`;
  const created = await User.create({
    username: email,
    password,
    role: "default",
    bio: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || "",
  });

  if (!created.user) {
    // Another request may have created the user concurrently.
    user = await User._get({ username: email });
    if (user) return user;
    throw new Error(created.error || "Unable to provision Cortex user.");
  }

  user = await User._get({ username: email });
  if (!user) throw new Error("Cortex user provisioning completed but user could not be loaded.");
  return user;
}

async function supabaseAuth(request, response, next) {
  const authorization = request.headers.authorization || "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (!match) return response.status(401).json({ error: "Authentication required." });

  const supabase = getSupabaseClient();
  if (!supabase) {
    console.error("Supabase authentication is not configured on the server.");
    return response.status(503).json({ error: "Authentication service is not configured." });
  }

  try {
    const { data, error } = await supabase.auth.getUser(match[1]);
    if (error || !data?.user) {
      return response.status(401).json({ error: "Invalid or expired authentication token." });
    }

    const cortexUser = await getOrCreateCortexUser(data.user);
    if (cortexUser.suspended) {
      return response.status(403).json({ error: "Account suspended by administrator." });
    }

    request.supabaseUser = data.user;
    request.supabaseAccessToken = match[1];
    request.cortexUser = cortexUser;
    request.user = cortexUser;
    return next();
  } catch (error) {
    console.error("Supabase authentication/provisioning failed:", error);
    return response.status(401).json({ error: "Unable to authenticate this account." });
  }
}

module.exports = { supabaseAuth, getSupabaseClient };
