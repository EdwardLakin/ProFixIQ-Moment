import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { getAppUrl, getStripeConfig } from "@/lib/env";
import { MomentPlan } from "@/lib/plans";

type StripeSessionResponse = { id: string; url: string | null };

export async function POST(request: Request) {
  const { user } = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { plan } = (await request.json()) as { plan?: MomentPlan };
  if (plan !== "plus" && plan !== "pro") {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const { secretKey, plusPriceId, proPriceId } = getStripeConfig();
  const appUrl = getAppUrl();
  const priceId = plan === "plus" ? plusPriceId : proPriceId;

  const payload = new URLSearchParams({
    mode: "subscription",
    "line_items[0][price]": priceId,
    "line_items[0][quantity]": "1",
    success_url: `${appUrl}/settings?tab=billing&checkout=success`,
    cancel_url: `${appUrl}/settings?tab=billing&checkout=cancelled`,
    "metadata[user_id]": user.id,
    "subscription_data[metadata][user_id]": user.id,
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
    return NextResponse.json({ error: "Stripe session creation failed", detail: text.slice(0, 200) }, { status: 502 });
  }

  const session = (await stripeResponse.json()) as StripeSessionResponse;
  return NextResponse.json({ url: session.url });
}
