const { supabaseAuth } = require("../../middleware/supabaseAuth");
const { User } = require("../../models/user");
const {
  createCheckoutSession,
  createPortalSession,
  constructWebhookEvent,
} = require("../../utils/stripe");

function billingEndpoints(app) {
  if (!app) return;

  app.post("/billing/checkout", [supabaseAuth], async (request, response) => {
    try {
      const { priceId } = request.body || {};
      const email = request.supabaseUser.email;
      if (!email) return response.status(400).json({ error: "Authenticated email is required." });

      let user = await User._get({ username: email.toLowerCase() });
      if (!user) {
        const created = await User.create({
          username: email.toLowerCase(),
          password: `${require("crypto").randomBytes(48).toString("hex")}Aa1!`,
          bio: request.supabaseUser.user_metadata?.full_name || "",
        });
        if (!created.user) return response.status(500).json({ error: created.error });
        user = await User._get({ username: email.toLowerCase() });
      }

      const session = await createCheckoutSession({
        request,
        user: {
          ...user,
          email,
          supabaseUserId: request.supabaseUser.id,
        },
        priceId,
      });

      return response.status(200).json({ url: session.url, sessionId: session.id });
    } catch (error) {
      console.error("Stripe checkout failed:", error);
      return response.status(500).json({ error: error.message });
    }
  });

  app.post("/billing/portal", [supabaseAuth], async (request, response) => {
    try {
      const stripeCustomerId = request.body?.customerId;
      if (!stripeCustomerId) return response.status(400).json({ error: "Stripe customer ID is required." });
      const session = await createPortalSession({ request, customerId: stripeCustomerId });
      return response.status(200).json({ url: session.url });
    } catch (error) {
      console.error("Stripe portal failed:", error);
      return response.status(500).json({ error: error.message });
    }
  });

  app.post("/billing/webhook", async (request, response) => {
    try {
      const signature = request.headers["stripe-signature"];
      if (!signature) return response.status(400).send("Missing Stripe signature");
      const event = constructWebhookEvent(request.body, signature);
      console.log(`Stripe webhook received: ${event.type}`);
      return response.status(200).json({ received: true });
    } catch (error) {
      console.error("Stripe webhook failed:", error);
      return response.status(400).send("Webhook signature verification failed");
    }
  });
}

module.exports = { billingEndpoints };
