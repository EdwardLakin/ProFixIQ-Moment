import { isPaidMomentPlan, type MomentPlan } from "@/lib/plans";

export type UserFlowState = {
  onboardingComplete: boolean;
  plan: MomentPlan;
};

export function getPostSignupPath(state: UserFlowState): string {
  if (!state.onboardingComplete) {
    return "/onboarding";
  }

  return "/dashboard";
}

export function getPostCheckoutPath(state: UserFlowState): string {
  if (!isPaidMomentPlan(state.plan)) {
    return state.onboardingComplete ? "/dashboard" : "/onboarding";
  }

  return state.onboardingComplete ? "/dashboard" : "/onboarding";
}
