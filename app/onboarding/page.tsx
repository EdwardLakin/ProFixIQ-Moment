import { redirect } from "next/navigation";
import { MomentButton } from "@/components/moment/MomentButton";
import { MomentCard } from "@/components/moment/MomentCard";
import { MomentInput } from "@/components/moment/MomentInput";
import { MomentPageHeader } from "@/components/moment/MomentPageHeader";
import { MomentShell } from "@/components/moment/MomentShell";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function completeOnboarding(formData: FormData) {
  "use server";
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const display_name = String(formData.get("display_name") ?? "");
  const age_range = String(formData.get("age_range") ?? "18_plus");
  const guardian_email = String(formData.get("guardian_email") ?? "");
  const focus_areas = formData.getAll("focus_areas").map(String);
  const support_goals = formData.getAll("support_goals").map(String);

  await supabase.from("moment_profiles").upsert({ user_id: user.id, display_name, age_range, focus_areas, support_goals, onboarding_complete: true }, { onConflict: "user_id" });
  if (guardian_email) {
    await supabase.from("moment_guardian_links").upsert({ student_user_id: user.id, guardian_email }, { onConflict: "student_user_id,guardian_email" });
  }
  redirect("/dashboard");
}

export default async function OnboardingPage() { return <MomentShell><section className="mx-auto max-w-2xl"><MomentPageHeader eyebrow="Onboarding" title="Set up your profile" subtitle="Moment is a support tool, not therapy or crisis care." /><MomentCard><form action={completeOnboarding} className="space-y-3"><MomentInput name="display_name" placeholder="Display name" required /><MomentInput name="age_range" placeholder="under_13 | 13_15 | 16_17 | 18_plus" required /><MomentInput name="focus_areas" placeholder="focus area (submit multiple by repeating field not supported in this draft)" /><MomentInput name="support_goals" placeholder="support goal" /><MomentInput name="guardian_email" type="email" placeholder="Guardian email (optional)" /><MomentButton type="submit">Finish onboarding</MomentButton></form></MomentCard></section></MomentShell>; }
