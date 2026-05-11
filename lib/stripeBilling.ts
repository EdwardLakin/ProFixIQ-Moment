import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { parseMomentPlan } from "@/lib/plans";

type StripeSubscriptionStatus = "trialing" | "active" | "past_due" | "canceled" | "unpaid" | "incomplete" | "incomplete_expired";

function mapPlanFromPriceId(priceId: string | null, plusPriceId: string, proPriceId: string) {
  if (priceId === plusPriceId) return "plus";
  if (priceId === proPriceId) return "pro";
  return "free";
}

function isActiveLikeStatus(status: string | null | undefined) {
  return status === "trialing" || status === "active" || status === "past_due";
}

export async function upsertSubscriptionFromStripeObject(params: {
  userId?: string | null;
  customerId?: string | null;
  subscriptionId?: string | null;
  priceId?: string | null;
  status?: string | null;
  currentPeriodEndUnix?: number | null;
  cancelAtPeriodEnd?: boolean | null;
  plusPriceId: string;
  proPriceId: string;
}) {
  const supabase = createSupabaseAdminClient();
  const plan = parseMomentPlan(mapPlanFromPriceId(params.priceId ?? null, params.plusPriceId, params.proPriceId));
  const status = (params.status ?? "inactive") as StripeSubscriptionStatus | "inactive";
  const periodEnd = params.currentPeriodEndUnix && params.currentPeriodEndUnix > 0 ? new Date(params.currentPeriodEndUnix * 1000).toISOString() : null;

  const base = {
    stripe_customer_id: params.customerId ?? null,
    stripe_subscription_id: params.subscriptionId ?? null,
    stripe_price_id: params.priceId ?? null,
    plan: isActiveLikeStatus(status) ? plan : "free",
    status,
    current_period_end: periodEnd,
    cancel_at_period_end: Boolean(params.cancelAtPeriodEnd ?? false),
  };

  if (params.userId) {
    await supabase.from("moment_subscriptions").upsert({ user_id: params.userId, ...base }, { onConflict: "user_id" });
    return;
  }

  if (params.customerId) {
    await supabase.from("moment_subscriptions").update(base).eq("stripe_customer_id", params.customerId);
  }
}

