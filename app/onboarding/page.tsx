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

  const { error: profileError } = await supabase
    .from("moment_profiles")
    .upsert(
      {
        user_id: user.id,
        display_name: displayName,
        age_range: ageRange,
        focus_areas: focusAreas,
        support_goals: supportGoals,
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
          eyebrow="Onboarding"
          title="Build your Moment baseline"
          subtitle="Private support for school stress, social pressure, and restart friction."
        />

        <MomentCard>
          <form action={completeOnboarding} className="space-y-4">
            <input
              name="display_name"
              required
              placeholder="Display name"
              className="w-full rounded-xl border border-white/10 bg-[#202a40] p-3 text-[#f8f1e7] placeholder:text-[#a7a8bd] outline-none focus:border-[#c4b5fd] focus:ring-2 focus:ring-[#c4b5fd]/40"
            />

            <select
              name="age_range"
              className="w-full rounded-xl border border-white/10 bg-[#202a40] p-3 text-[#f8f1e7] placeholder:text-[#a7a8bd] outline-none focus:border-[#c4b5fd] focus:ring-2 focus:ring-[#c4b5fd]/40"
            >
              <option value="under_13">Under 13</option>
              <option value="13_15">13-15</option>
              <option value="16_17">16-17</option>
              <option value="18_plus">18+</option>
            </select>

            <fieldset>
              <p className="mb-3 text-sm font-medium text-slate-200">What Moment helps with</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ["school_overwhelm", "School overwhelm"],
                  ["social_pressure", "Social pressure"],
                  ["task_start", "Starting tasks"],
                  ["math_stress", "Math stress"],
                ].map(([value, label]) => (
                  <label
                    key={value}
                    className="flex items-center gap-3 rounded-2xl bg-white/[0.05] px-4 py-3 text-sm text-slate-200"
                  >
                    <input type="checkbox" name="focus_areas" value={value} className="h-4 w-4" />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <p className="mb-3 text-sm font-medium text-slate-200">Support goals</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ["calmer_restarts", "Calmer restarts"],
                  ["finish_small_tasks", "Finish small tasks"],
                  ["protect_boundaries", "Protect boundaries"],
                ].map(([value, label]) => (
                  <label
                    key={value}
                    className="flex items-center gap-3 rounded-2xl bg-white/[0.05] px-4 py-3 text-sm text-slate-200"
                  >
                    <input type="checkbox" name="support_goals" value={value} className="h-4 w-4" />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>

            <input
              name="guardian_email"
              type="email"
              placeholder="Guardian email (optional)"
              className="w-full rounded-xl border border-white/10 bg-[#202a40] p-3 text-[#f8f1e7] placeholder:text-[#a7a8bd] outline-none focus:border-[#c4b5fd] focus:ring-2 focus:ring-[#c4b5fd]/40"
            />

            <p className="text-xs text-[#a7a8bd]">
              Moment is a support tool, not therapy or crisis care. Your entries are private to your account and protected by your sign-in.
            </p>

            <MomentButton type="submit" className="mt-2 w-full sm:w-auto">
              Save and continue
            </MomentButton>
          </form>
        </MomentCard>
      </section>
    </MomentShell>
  );
}
