import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { getAppUrl, getStripeConfig } from "@/lib/env";
import { getOrCreateMomentProfile } from "@/lib/auth";
import { getCheckoutPlanFromPayload, resolveStripePriceId } from "@/lib/stripeCheckout";

type StripeSessionResponse = { id: string; url: string | null };

export async function POST(request: Request) {
  const { user } = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { plan?: string };
  const plan = getCheckoutPlanFromPayload(body);
  if (!plan) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  let stripeConfig: ReturnType<typeof getStripeConfig>;
  try {
    stripeConfig = getStripeConfig();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Missing Stripe configuration";
    console.error("[stripe_checkout] missing Stripe configuration", { message });
    return NextResponse.json({ error: `Billing configuration error: ${message}` }, { status: 503 });
  }

  const { secretKey, plusPriceId, proPriceId } = stripeConfig;
  const appUrl = getAppUrl();
  const resolvedPriceId = resolveStripePriceId(plan, { plusPriceId, proPriceId });
  if (!resolvedPriceId.ok) {
    console.error("[stripe_checkout] invalid Stripe price id", { plan, plusPriceId, proPriceId });
    return NextResponse.json({ error: `Billing configuration error: ${resolvedPriceId.error}` }, { status: 503 });
  }

  const profile = await getOrCreateMomentProfile(user.id);
  const successPath = profile.onboarding_complete ? "/dashboard?checkout=success" : "/onboarding?checkout=success";
  const successUrl = new URL(successPath, appUrl).toString();
  const cancelUrl = new URL("/pricing?checkout=cancelled", appUrl).toString();

  const payload = new URLSearchParams({
    mode: "subscription",
    "line_items[0][price]": resolvedPriceId.priceId,
    "line_items[0][quantity]": "1",
    success_url: successUrl,
    cancel_url: cancelUrl,
    "metadata[user_id]": user.id,
    "subscription_data[metadata][user_id]": user.id,
    allow_promotion_codes: "true",
  });

  const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: payload,
  });

  if (!stripeResponse.ok) {
    const text = await stripeResponse.text();
    console.error("[stripe_checkout] Stripe session creation failed", { status: stripeResponse.status, detail: text.slice(0, 400) });
    return NextResponse.json({ error: "Unable to start checkout right now. Please try again." }, { status: 502 });
  }

  const session = (await stripeResponse.json()) as StripeSessionResponse;
  return NextResponse.json({ url: session.url });
}
