const { validApiKey } = require("../../../utils/middleware/validApiKey");
const { supabaseAuth } = require("../../../middleware/supabaseAuth");

function apiAuthEndpoints(app) {
  if (!app) return;

  app.get("/v1/auth", [validApiKey], (_, response) => {
    response.status(200).json({ authenticated: true });
  });

  app.get("/v1/auth/supabase", [supabaseAuth], (request, response) => {
    const user = request.supabaseUser;
    response.status(200).json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        aud: user.aud,
        created_at: user.created_at,
        user_metadata: user.user_metadata || {},
        app_metadata: user.app_metadata || {},
      },
    });
  });
}

module.exports = { apiAuthEndpoints };
