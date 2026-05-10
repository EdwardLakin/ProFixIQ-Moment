import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { MomentPlan, parseMomentPlan, isPaidMomentPlan } from "@/lib/plans";

export type MomentSubscription = {
  plan: MomentPlan;
  status: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
};

export async function getCurrentMomentPlan(userId: string): Promise<MomentSubscription> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("moment_subscriptions")
    .select("plan,status,current_period_end,cancel_at_period_end")
    .eq("user_id", userId)
    .maybeSingle();

  return {
    plan: parseMomentPlan(data?.plan),
    status: data?.status ?? "inactive",
    currentPeriodEnd: data?.current_period_end ?? null,
    cancelAtPeriodEnd: data?.cancel_at_period_end ?? false,
  };
}

export async function requireMomentPlan(userId: string, requiredPlan: Exclude<MomentPlan, "free">) {
  const subscription = await getCurrentMomentPlan(userId);
  if (requiredPlan === "plus" && subscription.plan === "pro") return subscription;
  if (subscription.plan !== requiredPlan) {
    redirect("/settings?tab=billing");
  }
  return subscription;
}

export { isPaidMomentPlan };
