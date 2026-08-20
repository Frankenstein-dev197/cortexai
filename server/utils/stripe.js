const Stripe = require("stripe");

let stripeClient = null;

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }
  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripeClient;
}

function getPublicUrl(request) {
  return (
    process.env.CORTEX_PUBLIC_URL?.replace(/\/$/, "") ||
    `${request.protocol}://${request.get("host")}`
  );
}

async function createCheckoutSession({ request, user, priceId }) {
  if (!priceId) throw new Error("A Stripe price ID is required.");
  const stripe = getStripe();
  const email = user.email || user.username;
  const customers = await stripe.customers.list({ email, limit: 1 });
  const customer =
    customers.data[0] ||
    (await stripe.customers.create({
      email,
      metadata: {
        cortex_user_id: String(user.id),
        supabase_user_id: String(user.supabaseUserId || ""),
      },
    }));

  return stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customer.id,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${getPublicUrl(request)}/settings/billing?checkout=success`,
    cancel_url: `${getPublicUrl(request)}/settings/billing?checkout=cancelled`,
    allow_promotion_codes: true,
    metadata: {
      cortex_user_id: String(user.id),
      supabase_user_id: String(user.supabaseUserId || ""),
    },
    subscription_data: {
      metadata: {
        cortex_user_id: String(user.id),
        supabase_user_id: String(user.supabaseUserId || ""),
      },
    },
  });
}

async function createPortalSession({ request, customerId }) {
  const stripe = getStripe();
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${getPublicUrl(request)}/settings/billing`,
  });
}

function constructWebhookEvent(payload, signature) {
  const stripe = getStripe();
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not configured.");
  }
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  );
}

module.exports = {
  getStripe,
  createCheckoutSession,
  createPortalSession,
  constructWebhookEvent,
};
