import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { getStripeConfig } from "@/lib/env";
import { upsertSubscriptionFromStripeObject } from "@/lib/stripeBilling";

export async function POST() {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { secretKey, plusPriceId, proPriceId } = getStripeConfig();
  const { data: billing } = await supabase
    .from("moment_subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  const customerId = billing?.stripe_customer_id;
  if (!customerId) return NextResponse.json({ synced: false, reason: "no_customer" });

  const subResponse = await fetch(`https://api.stripe.com/v1/subscriptions?customer=${encodeURIComponent(customerId)}&status=all&limit=3`, {
    headers: { Authorization: `Bearer ${secretKey}` },
    cache: "no-store",
  });

  if (!subResponse.ok) return NextResponse.json({ error: "Stripe sync failed" }, { status: 502 });
  const subData = (await subResponse.json()) as { data?: Array<Record<string, unknown>> };
  const latest = subData.data?.[0];

  if (latest) {
    const priceId = String(((latest.items as { data?: Array<{ price?: { id?: string } }> } | undefined)?.data?.[0]?.price?.id) ?? "");
    await upsertSubscriptionFromStripeObject({
      userId: user.id,
      customerId,
      subscriptionId: String(latest.id ?? ""),
      priceId,
      status: String(latest.status ?? "inactive"),
      currentPeriodEndUnix: Number(latest.current_period_end ?? 0),
      cancelAtPeriodEnd: Boolean(latest.cancel_at_period_end ?? false),
      plusPriceId,
      proPriceId,
    });
    return NextResponse.json({ synced: true });
  }

  await upsertSubscriptionFromStripeObject({ userId: user.id, customerId, status: "inactive", plusPriceId, proPriceId });
  return NextResponse.json({ synced: true, cleared: true });
}
