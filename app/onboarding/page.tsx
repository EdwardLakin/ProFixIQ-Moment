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
  const focusAreas = formData.getAll("focus_areas").map(String);
  const supportGoals = formData.getAll("support_goals").map(String);
  const birthdayMonthRaw = String(formData.get("birthday_month") ?? "").trim();
  const birthdayDayRaw = String(formData.get("birthday_day") ?? "").trim();
  const birthdayMonth = birthdayMonthRaw ? Number.parseInt(birthdayMonthRaw, 10) : null;
  const birthdayDay = birthdayDayRaw ? Number.parseInt(birthdayDayRaw, 10) : null;

  const { error: profileError } = await supabase.from("moment_profiles").upsert(
    {
      user_id: user.id,
      display_name: displayName,
      age_range: ageRange,
      focus_areas: focusAreas,
      support_goals: supportGoals,
      birthday_month: Number.isInteger(birthdayMonth) ? birthdayMonth : null,
      birthday_day: Number.isInteger(birthdayDay) ? birthdayDay : null,
      onboarding_complete: true,
    },
    { onConflict: "user_id" }
  );

  if (profileError) {
    return { error: `Could not save onboarding profile: ${profileError.message}` };
  }

  if (guardianEmail) {
    const { error: guardianError } = await supabase
      .from("moment_guardian_links")
      .upsert(
        {
          student_user_id: user.id,
          guardian_email: guardianEmail,
          status: "pending",
          summary_access: true,
          raw_session_access: false,
        },
        { onConflict: "student_user_id,guardian_email" }
      );

    if (guardianError) {
      return { error: `Could not save guardian invite: ${guardianError.message}` };
    }
  }

  redirect("/dashboard");
}

export default async function OnboardingPage() {
  await requireAuthenticatedUser("/onboarding");

  return (
    <MomentShell>
      <section className="mx-auto max-w-3xl">
        <MomentPageHeader
          eyebrow="Your Moment"
          title="Let’s make Moment feel like yours"
          subtitle="A few small details help Moment greet you gently and route support in a way that fits."
        />

        <MomentCard className="border-white/20 bg-[#1a2438]">
          <OnboardingForm action={completeOnboarding} />
        </MomentCard>
      </section>
    </MomentShell>
  );
}
