import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { getStripeConfig } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { parseMomentPlan } from "@/lib/plans";

function verifyStripeSignature(payload: string, signature: string, secret: string): boolean {
  const pairs = signature.split(",");
  const timestamp = pairs.find((part) => part.startsWith("t="))?.slice(2);
  const signed = pairs.find((part) => part.startsWith("v1="))?.slice(3);
  if (!timestamp || !signed) return false;
  const expected = createHmac("sha256", secret).update(`${timestamp}.${payload}`).digest("hex");
  return timingSafeEqual(Buffer.from(expected), Buffer.from(signed));
}

function planFromPriceId(priceId: string | null, plusPriceId: string, proPriceId: string) {
  if (priceId === plusPriceId) return "plus";
  if (priceId === proPriceId) return "pro";
  return "free";
}

export async function POST(request: Request) {
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");
  const { webhookSecret, plusPriceId, proPriceId } = getStripeConfig();
  if (!signature || !verifyStripeSignature(payload, signature, webhookSecret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(payload) as { type: string; data: { object: Record<string, unknown> } };
  const supabase = createSupabaseAdminClient();
  const object = event.data.object;

  try {
    if (event.type === "checkout.session.completed") {
      const userId = String((object.metadata as Record<string, string> | undefined)?.user_id ?? "");
      const customerId = String(object.customer ?? "");
      if (userId) await supabase.from("moment_subscriptions").upsert({ user_id: userId, stripe_customer_id: customerId }, { onConflict: "user_id" });
    }

    if (event.type.startsWith("customer.subscription") || event.type.startsWith("invoice.payment_")) {
      const userId = String((object.metadata as Record<string, string> | undefined)?.user_id ?? "");
      const priceId = String(((object.items as { data?: Array<{ price?: { id?: string } }> } | undefined)?.data?.[0]?.price?.id) ?? ((object.lines as { data?: Array<{ price?: { id?: string } }> } | undefined)?.data?.[0]?.price?.id) ?? "");
      const plan = parseMomentPlan(planFromPriceId(priceId || null, plusPriceId, proPriceId));
      const subscriptionId = String(object.id ?? "");
      const customerId = String(object.customer ?? "");
      const status = String(object.status ?? (event.type === "invoice.payment_failed" ? "past_due" : "active"));
      const periodEndUnix = Number(object.current_period_end ?? 0);
      const periodEnd = Number.isFinite(periodEndUnix) && periodEndUnix > 0 ? new Date(periodEndUnix * 1000).toISOString() : null;
      const cancelAtPeriodEnd = Boolean(object.cancel_at_period_end ?? false);

      if (userId || customerId) {
        const base = { stripe_customer_id: customerId || null, stripe_subscription_id: subscriptionId || null, stripe_price_id: priceId || null, plan, status, current_period_end: periodEnd, cancel_at_period_end: cancelAtPeriodEnd };
        if (userId) {
          await supabase.from("moment_subscriptions").upsert({ user_id: userId, ...base }, { onConflict: "user_id" });
        } else if (customerId) {
          await supabase.from("moment_subscriptions").update(base).eq("stripe_customer_id", customerId);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
