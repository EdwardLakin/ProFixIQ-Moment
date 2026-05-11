import type { MomentPlan } from "./plans.ts";

export const CHECKOUT_PLAN_KEYS = ["plus", "pro"] as const;
export type CheckoutPlanKey = (typeof CHECKOUT_PLAN_KEYS)[number];

export function isCheckoutPlanKey(value: unknown): value is CheckoutPlanKey {
  return value === "plus" || value === "pro";
}

export function resolveStripePriceId(plan: CheckoutPlanKey, prices: { plusPriceId?: string; proPriceId?: string }) {
  const priceId = plan === "plus" ? prices.plusPriceId : prices.proPriceId;
  if (!priceId || !/^price_[A-Za-z0-9]+$/.test(priceId)) {
    return { ok: false as const, error: `Missing or invalid Stripe price id for ${plan} plan` };
  }

  return { ok: true as const, priceId };
}

export function getCheckoutPlanFromPayload(payload: { plan?: MomentPlan | string | null | undefined }) {
  return isCheckoutPlanKey(payload.plan) ? payload.plan : null;
}

