export const MOMENT_PLANS = ["free", "plus", "pro"] as const;

export type MomentPlan = (typeof MOMENT_PLANS)[number];

export type MomentSubscriptionStatus =
  | "inactive"
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "unpaid";

export function isPaidMomentPlan(plan: MomentPlan): boolean {
  return plan === "plus" || plan === "pro";
}

export function parseMomentPlan(value: string | null | undefined): MomentPlan {
  if (value === "plus" || value === "pro") return value;
  return "free";
}
