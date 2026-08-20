const { createClient } = require("@supabase/supabase-js");

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

    request.supabaseUser = data.user;
    request.supabaseAccessToken = match[1];
    return next();
  } catch (error) {
    console.error("Supabase JWT verification failed:", error);
    return response.status(401).json({ error: "Invalid authentication token." });
  }
}

module.exports = { supabaseAuth };
