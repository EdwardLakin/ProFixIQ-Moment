const requiredKeys = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
};

export function getSupabaseEnv() {
  const missing = Object.entries(requiredKeys)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(`Missing required env vars: ${missing.join(", ")}`);
  }

  return {
    url: requiredKeys.NEXT_PUBLIC_SUPABASE_URL as string,
    anonKey: requiredKeys.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
  };
}

export function getOpenAIKey() {
  return process.env.OPENAI_API_KEY;
}


export function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export function getStripeConfig() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const plusPriceId = process.env.STRIPE_PLUS_PRICE_ID;
  const proPriceId = process.env.STRIPE_PRO_PRICE_ID;

  if (!secretKey || !webhookSecret || !plusPriceId || !proPriceId) {
    throw new Error("Missing Stripe env vars: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PLUS_PRICE_ID, STRIPE_PRO_PRICE_ID");
  }

  return { secretKey, webhookSecret, plusPriceId, proPriceId };
}
