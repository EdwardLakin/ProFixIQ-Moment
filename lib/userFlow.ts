import { isPaidMomentPlan, type MomentPlan } from "@/lib/plans";

export type UserFlowState = {
  onboardingComplete: boolean;
  plan: MomentPlan;
};

export function getPostSignupPath(state: UserFlowState): string {
  if (!isPaidMomentPlan(state.plan)) {
    return "/pricing";
  }

  if (!state.onboardingComplete) {
    return "/onboarding";
  }

  return "/dashboard";
}
