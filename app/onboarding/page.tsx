import { redirect } from "next/navigation";
import { MomentButton } from "@/components/moment/MomentButton";
import { MomentCard } from "@/components/moment/MomentCard";
import { MomentPageHeader } from "@/components/moment/MomentPageHeader";
import { MomentShell } from "@/components/moment/MomentShell";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAuthenticatedUser } from "@/lib/auth";

const focusChipOptions = [
  "School feels overwhelming",
  "Starting is hard",
  "Math gets frustrating",
  "Friend drama pulls me in",
  "I shut down when confused",
  "I want calmer restarts",
  "I need help with boundaries",
  "I want tiny steps",
];

async function completeOnboarding(formData: FormData) {
  "use server";

  const user = await requireAuthenticatedUser("/onboarding");
  const supabase = await createSupabaseServerClient();

  const displayName = String(formData.get("display_name") ?? "").trim();
  const ageRange = String(formData.get("age_range") ?? "18_plus");
  const guardianEmail = String(formData.get("guardian_email") ?? "").trim();
  const supportGoals = formData.getAll("support_goals").map(String);
  const birthdayMonthRaw = String(formData.get("birthday_month") ?? "").trim();
  const birthdayDayRaw = String(formData.get("birthday_day") ?? "").trim();
  const initialJournalEntry = String(formData.get("initial_journal_entry") ?? "").trim();
  const knownSupportNeeds = String(formData.get("known_support_needs") ?? "").trim();

  const birthdayMonth = birthdayMonthRaw ? Number.parseInt(birthdayMonthRaw, 10) : null;
  const birthdayDay = birthdayDayRaw ? Number.parseInt(birthdayDayRaw, 10) : null;

  const { error: profileError } = await supabase.from("moment_profiles").upsert(
    {
      user_id: user.id,
      display_name: displayName,
      age_range: ageRange,
      focus_areas: supportGoals,
      support_goals: supportGoals,
      birthday_month: Number.isInteger(birthdayMonth) ? birthdayMonth : null,
      birthday_day: Number.isInteger(birthdayDay) ? birthdayDay : null,
      preferences: {
        initial_journal_entry: initialJournalEntry,
        known_support_needs: knownSupportNeeds,
      },
      onboarding_complete: true,
    },
    { onConflict: "user_id" }
  );

  if (profileError) throw new Error(`Could not save onboarding profile: ${profileError.message}`);

  if (guardianEmail) {
    const { error: guardianError } = await supabase.from("moment_guardian_links").upsert(
      {
        student_user_id: user.id,
        guardian_email: guardianEmail,
        status: "pending",
        summary_access: true,
        raw_session_access: false,
      },
      { onConflict: "student_user_id,guardian_email" }
    );

    if (guardianError) throw new Error(`Could not save guardian invite: ${guardianError.message}`);
  }

  redirect("/dashboard");
}

export default async function OnboardingPage() {
  await requireAuthenticatedUser("/onboarding");

  return (
    <MomentShell>
      <section className="mx-auto max-w-3xl">
        <MomentPageHeader
          eyebrow="Your first Moment"
          title="Tell Moment a little about you"
          subtitle="You don’t need perfect answers. This helps Moment greet you gently and route support in a way that feels useful."
        />

        <MomentCard className="border-white/10 bg-[linear-gradient(150deg,rgba(36,30,59,0.93),rgba(22,30,48,0.93))] shadow-[0_35px_90px_-50px_rgba(192,132,252,0.6)]">
          <form action={completeOnboarding} className="space-y-6">
            <label className="block space-y-2">
              <span className="text-sm text-slate-100">What should Moment call you?</span>
              <input name="display_name" required placeholder="Your name" className="w-full rounded-2xl border border-white/10 bg-black/20 p-3 text-[#f8f1e7] placeholder:text-[#b9bad0] outline-none focus:border-[#d2c5ff] focus:ring-2 focus:ring-[#d2c5ff]/30" />
            </label>

            <label className="block space-y-2">
              <span className="text-sm text-slate-100">Which age range fits you?</span>
              <select name="age_range" className="w-full rounded-2xl border border-white/10 bg-black/20 p-3 text-[#f8f1e7] outline-none focus:border-[#d2c5ff] focus:ring-2 focus:ring-[#d2c5ff]/30">
                <option value="under_13">Under 13</option><option value="13_15">13-15</option><option value="16_17">16-17</option><option value="18_plus">18+</option>
              </select>
            </label>

            <fieldset className="space-y-2">
              <p className="text-sm text-slate-100">Parent/guardian setup</p>
              <p className="text-xs text-[#c5c7dc]">Because Moment can support minors, a parent or guardian should be connected. Parent views are designed around patterns and support, not reading every private entry.</p>
              <input name="guardian_email" type="email" placeholder="Parent or guardian email (recommended for minors)" className="w-full rounded-2xl border border-white/10 bg-black/20 p-3 text-[#f8f1e7] placeholder:text-[#b9bad0] outline-none focus:border-[#d2c5ff] focus:ring-2 focus:ring-[#d2c5ff]/30" />
            </fieldset>

            <fieldset className="space-y-2">
              <p className="text-sm text-slate-100">Want Moment to remember your birthday?</p>
              <p className="text-xs text-[#c5c7dc]">Optional — Moment can make that day feel a little warmer.</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <input name="birthday_month" type="number" min={1} max={12} placeholder="Month" className="w-full rounded-2xl border border-white/10 bg-black/20 p-3 text-[#f8f1e7] placeholder:text-[#b9bad0] outline-none focus:border-[#d2c5ff] focus:ring-2 focus:ring-[#d2c5ff]/30" />
                <input name="birthday_day" type="number" min={1} max={31} placeholder="Day" className="w-full rounded-2xl border border-white/10 bg-black/20 p-3 text-[#f8f1e7] placeholder:text-[#b9bad0] outline-none focus:border-[#d2c5ff] focus:ring-2 focus:ring-[#d2c5ff]/30" />
              </div>
            </fieldset>

            <label className="block space-y-2">
              <span className="text-sm text-slate-100">Tell Moment what life has felt like lately.</span>
              <textarea name="initial_journal_entry" rows={4} placeholder="School, focus, friends, anxiety, motivation, family, sleep — anything you want Moment to understand." className="w-full rounded-2xl border border-white/10 bg-black/20 p-3 text-[#f8f1e7] placeholder:text-[#b9bad0] outline-none focus:border-[#d2c5ff] focus:ring-2 focus:ring-[#d2c5ff]/30" />
            </label>

            <fieldset>
              <p className="mb-2 text-sm text-slate-100">Support preferences</p>
              <div className="flex flex-wrap gap-2">{focusChipOptions.map((chip) => <label key={chip} className="inline-flex cursor-pointer items-center rounded-full border border-white/12 bg-white/[0.05] px-3 py-2 text-xs text-slate-100"><input type="checkbox" name="support_goals" value={chip} className="mr-2 h-3.5 w-3.5" />{chip}</label>)}</div>
            </fieldset>

            <label className="block space-y-2">
              <span className="text-sm text-slate-100">Anything Moment should know?</span>
              <span className="text-xs text-[#c5c7dc]">You can mention ADHD, anxiety, learning differences, or anything you already know helps or makes things harder. Moment won’t diagnose — this just helps it respond better.</span>
              <textarea name="known_support_needs" rows={3} className="w-full rounded-2xl border border-white/10 bg-black/20 p-3 text-[#f8f1e7] placeholder:text-[#b9bad0] outline-none focus:border-[#d2c5ff] focus:ring-2 focus:ring-[#d2c5ff]/30" />
            </label>

            <MomentButton type="submit" className="mt-2 w-full sm:w-auto">Begin my first Moment</MomentButton>
          </form>
        </MomentCard>
      </section>
    </MomentShell>
  );
}
