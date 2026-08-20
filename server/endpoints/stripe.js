const Stripe = require("stripe");
const { supabaseAuth } = require("../middleware/supabaseAuth");

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

async function getOrCreateCustomer(stripe, supabaseUser, cortexUser) {
  const email = supabaseUser.email || undefined;
  if (email) {
    const existing = await stripe.customers.list({ email, limit: 100 });
    const owned = existing.data.find(
      (customer) => customer.metadata?.supabase_user_id === supabaseUser.id
    );
    if (owned) return owned;
  }

  return stripe.customers.create({
    email,
    name:
      supabaseUser.user_metadata?.full_name ||
      supabaseUser.user_metadata?.name ||
      undefined,
    metadata: {
      supabase_user_id: supabaseUser.id,
      cortex_user_id: String(cortexUser.id),
    },
  });
}

function stripeEndpoints(apiRouter) {
  const stripe = getStripe();
  if (!stripe) {
    apiRouter.all("/billing/*", (_req, res) =>
      res.status(503).json({ error: "Stripe billing is not configured." })
    );
    return;
  }

  apiRouter.post("/billing/checkout", supabaseAuth, async (req, res) => {
    try {
      const priceId = req.body?.priceId || process.env.STRIPE_DEFAULT_PRICE_ID;
      if (!priceId) return res.status(400).json({ error: "A Stripe price is required." });

      const frontendUrl = (
        process.env.CORTEX_FRONTEND_URL ||
        process.env.CORTEX_PUBLIC_URL ||
        "http://localhost:3000"
      ).replace(/\/$/, "");
      const customer = await getOrCreateCustomer(stripe, req.supabaseUser, req.cortexUser);

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        customer: customer.id,
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${frontendUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${frontendUrl}/billing/cancelled`,
        client_reference_id: req.supabaseUser.id,
        metadata: {
          supabase_user_id: req.supabaseUser.id,
          cortex_user_id: String(req.cortexUser.id),
          stripe_customer_id: customer.id,
        },
        subscription_data: {
          metadata: {
            supabase_user_id: req.supabaseUser.id,
            cortex_user_id: String(req.cortexUser.id),
            stripe_customer_id: customer.id,
          },
        },
      });

      return res.json({ id: session.id, url: session.url, customerId: customer.id });
    } catch (error) {
      console.error("Stripe checkout creation failed:", error);
      return res.status(500).json({ error: "Unable to create Stripe checkout session." });
    }
  });

  apiRouter.post("/billing/portal", supabaseAuth, async (req, res) => {
    try {
      const customerId = String(req.body?.customerId || "").trim();
      if (!customerId) return res.status(400).json({ error: "A Stripe customer is required." });

      const customer = await stripe.customers.retrieve(customerId);
      if (customer.deleted) return res.status(404).json({ error: "Stripe customer not found." });
      if (customer.metadata?.supabase_user_id !== req.supabaseUser.id) {
        return res.status(403).json({ error: "Stripe customer does not belong to this account." });
      }

      const portal = await stripe.billingPortal.sessions.create({
        customer: customer.id,
        return_url:
          process.env.CORTEX_FRONTEND_URL ||
          process.env.CORTEX_PUBLIC_URL ||
          "http://localhost:3000",
      });
      return res.json({ url: portal.url });
    } catch (error) {
      console.error("Stripe portal creation failed:", error);
      return res.status(500).json({ error: "Unable to create Stripe customer portal session." });
    }
  });

  apiRouter.post("/billing/webhook", async (req, res) => {
    const signature = req.headers["stripe-signature"];
    if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
      return res.status(400).json({ error: "Stripe webhook is not configured." });
    }

    try {
      const event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
      switch (event.type) {
        case "checkout.session.completed":
        case "customer.subscription.created":
        case "customer.subscription.updated":
        case "customer.subscription.deleted":
        case "invoice.paid":
        case "invoice.payment_failed":
          console.log(`Stripe event received: ${event.type}`);
          break;
        default:
          break;
      }
      return res.json({ received: true });
    } catch (error) {
      console.error("Stripe webhook signature verification failed:", error.message);
      return res.status(400).json({ error: "Invalid Stripe webhook signature." });
    }
  });
}

module.exports = { stripeEndpoints };
