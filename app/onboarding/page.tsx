import { redirect } from "next/navigation";
import { MomentButton } from "@/components/moment/MomentButton";
import { MomentCard } from "@/components/moment/MomentCard";
import { MomentPageHeader } from "@/components/moment/MomentPageHeader";
import { MomentShell } from "@/components/moment/MomentShell";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAuthenticatedUser } from "@/lib/auth";

async function completeOnboarding(formData: FormData) {
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
    throw new Error(`Could not save onboarding profile: ${profileError.message}`);
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
      throw new Error(`Could not save guardian invite: ${guardianError.message}`);
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
          <form action={completeOnboarding} className="space-y-5">
            <input name="display_name" required placeholder="Display name" className="w-full rounded-xl border border-white/15 bg-[#202a40] p-3 text-[#f8f1e7] placeholder:text-[#b9bad0] outline-none focus:border-[#d2c5ff] focus:ring-2 focus:ring-[#d2c5ff]/40" />
            <select name="age_range" className="w-full rounded-xl border border-white/15 bg-[#202a40] p-3 text-[#f8f1e7] outline-none focus:border-[#d2c5ff] focus:ring-2 focus:ring-[#d2c5ff]/40"><option value="under_13">Under 13</option><option value="13_15">13-15</option><option value="16_17">16-17</option><option value="18_plus">18+</option></select>

            <fieldset>
              <p className="mb-3 text-sm font-medium text-slate-100">What tends to feel heavy?</p>
              <div className="grid gap-3 sm:grid-cols-2">{[["school_overwhelm", "School overwhelm"], ["social_pressure", "Social pressure"], ["task_start", "Starting tasks"], ["math_stress", "Math stress"]].map(([value, label]) => <label key={value} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3 text-sm text-slate-100"><input type="checkbox" name="focus_areas" value={value} className="h-4 w-4" />{label}</label>)}</div>
            </fieldset>

            <fieldset>
              <p className="mb-3 text-sm font-medium text-slate-100">What would help most?</p>
              <div className="grid gap-3 sm:grid-cols-2">{[["calmer_restarts", "Calmer restarts"], ["finish_small_tasks", "Finish small tasks"], ["protect_boundaries", "Protect boundaries"]].map(([value, label]) => <label key={value} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3 text-sm text-slate-100"><input type="checkbox" name="support_goals" value={value} className="h-4 w-4" />{label}</label>)}</div>
            </fieldset>

            <fieldset>
              <p className="mb-2 text-sm font-medium text-slate-100">Birthday, if you want Moment to remember it</p>
              <p className="mb-3 text-xs text-[#c5c7dc]">Optional — Moment can remember your birthday and make the day feel a little warmer.</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <input name="birthday_month" type="number" min={1} max={12} placeholder="Month" className="w-full rounded-xl border border-white/15 bg-[#202a40] p-3 text-[#f8f1e7] placeholder:text-[#b9bad0] outline-none focus:border-[#d2c5ff] focus:ring-2 focus:ring-[#d2c5ff]/40" />
                <input name="birthday_day" type="number" min={1} max={31} placeholder="Day" className="w-full rounded-xl border border-white/15 bg-[#202a40] p-3 text-[#f8f1e7] placeholder:text-[#b9bad0] outline-none focus:border-[#d2c5ff] focus:ring-2 focus:ring-[#d2c5ff]/40" />
              </div>
            </fieldset>

            <input name="guardian_email" type="email" placeholder="Guardian email (optional)" className="w-full rounded-xl border border-white/15 bg-[#202a40] p-3 text-[#f8f1e7] placeholder:text-[#b9bad0] outline-none focus:border-[#d2c5ff] focus:ring-2 focus:ring-[#d2c5ff]/40" />

            <MomentButton type="submit" className="mt-2 w-full sm:w-auto">Save and continue</MomentButton>
          </form>
        </MomentCard>
      </section>
    </MomentShell>
  );
}
