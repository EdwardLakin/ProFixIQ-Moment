import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentMomentPlan } from "@/lib/subscriptions";
import { getPostSignupPath } from "@/lib/userFlow";

export async function getAuthenticatedUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabase, user };
}

export async function getOrCreateMomentProfile(userId: string) {
  const supabase = await createSupabaseServerClient();
  const { data: existingProfile } = await supabase
    .from("moment_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (existingProfile) {
    return existingProfile;
  }

  const { data: createdProfile, error } = await supabase
    .from("moment_profiles")
    .insert({ user_id: userId, onboarding_complete: false })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return createdProfile;
}

export function getOnboardingRedirectPath(profile: { onboarding_complete?: boolean } | null) {
  if (!profile || !profile.onboarding_complete) {
    return "/onboarding";
  }

  return "/dashboard";
}

export async function requireAuthenticatedUser(next: string) {
  const { user } = await getAuthenticatedUser();
  if (!user) {
    redirect(`/sign-in?next=${encodeURIComponent(next)}`);
  }
  return user;
}


export async function getCanonicalAppPath(userId: string, profile: { onboarding_complete?: boolean } | null) {
  const subscription = await getCurrentMomentPlan(userId);
  return getPostSignupPath({ onboardingComplete: Boolean(profile?.onboarding_complete), plan: subscription.plan });
}
