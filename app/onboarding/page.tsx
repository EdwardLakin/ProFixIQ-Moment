import { redirect } from "next/navigation";
import { MomentCard } from "@/components/moment/MomentCard";
import { MomentPageHeader } from "@/components/moment/MomentPageHeader";
import { MomentShell } from "@/components/moment/MomentShell";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAuthenticatedUser } from "@/lib/auth";
import { OnboardingForm } from "./OnboardingForm";

async function completeOnboarding(_: { error: string | null }, formData: FormData) {
  "use server";
  const user = await requireAuthenticatedUser("/onboarding");
  const supabase = await createSupabaseServerClient();
  const displayName = String(formData.get("display_name") ?? "").trim();
  const ageRange = String(formData.get("age_range") ?? "18_plus");
  const guardianEmail = String(formData.get("guardian_email") ?? "").trim();
  const supportGoals = formData.getAll("support_goals").map(String);

  const { error: profileError } = await supabase.from("moment_profiles").upsert({
    user_id: user.id,
    display_name: displayName,
    age_range: ageRange,
    focus_areas: supportGoals,
    support_goals: supportGoals,
    onboarding_complete: true,
  }, { onConflict: "user_id" });

  if (profileError) return { error: `Could not save onboarding profile: ${profileError.message}` };

  if (guardianEmail) {
    const { error: guardianError } = await supabase.from("moment_guardian_links").upsert({
      student_user_id: user.id,
      guardian_email: guardianEmail,
      status: "pending",
      summary_access: true,
      raw_session_access: false,
    }, { onConflict: "student_user_id,guardian_email" });

    if (guardianError) return { error: `Could not save guardian invite: ${guardianError.message}` };
  }

  redirect("/dashboard");
}

export default async function OnboardingPage() {
  await requireAuthenticatedUser("/onboarding");
  return (
    <MomentShell>
      <section className="mx-auto max-w-3xl">
        <MomentPageHeader eyebrow="Your first Moment" title="Tell Moment a little about you" subtitle="You don’t need perfect answers. This helps Moment greet you gently and route support in a way that feels useful." />
        <MomentCard className="border-white/20 bg-[#1a2438]">
          <OnboardingForm action={completeOnboarding} />
        </MomentCard>
      </section>
    </MomentShell>
  );
}
