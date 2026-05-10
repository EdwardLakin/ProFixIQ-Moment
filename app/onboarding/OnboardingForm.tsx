"use client";

import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { MomentButton } from "@/components/moment/MomentButton";

type OnboardingState = { error: string | null };
type CompleteOnboardingAction = (state: OnboardingState, formData: FormData) => Promise<OnboardingState>;

const teenChips: ReadonlyArray<readonly [string, string]> = [["school_overwhelm", "School feels overwhelming"], ["task_start", "Starting is hard"], ["math_stress", "Math gets frustrating"], ["social_pressure", "Friend drama pulls me in"], ["shutdown", "I shut down when confused"], ["calm_restart", "I want calmer restarts"]];
const adultChips: ReadonlyArray<readonly [string, string]> = [["work_stress", "Work stress"], ["money_unclear", "Money feels unclear"], ["relationship_stress", "Relationship stress"], ["household_overload", "Household overload"], ["life_admin", "Life admin"], ["decision_fatigue", "Decision fatigue"], ["task_start", "Starting is hard"], ["calm_restart", "I want calmer restarts"]];

function SubmitButton() { const { pending } = useFormStatus(); return <MomentButton type="submit" className="mt-2 w-full sm:w-auto" disabled={pending}>{pending ? "Saving…" : "Save and continue"}</MomentButton>; }

export function OnboardingForm({ action }: { action: CompleteOnboardingAction }) {
  const [state, formAction] = useActionState(action, { error: null });
  const [ageRange, setAgeRange] = useState("under_13");
  const [selectedSupportGoals, setSelectedSupportGoals] = useState<string[]>([]);
  const chips = useMemo(() => (ageRange === "18_plus" ? adultChips : teenChips), [ageRange]);

  return <form action={formAction} className="space-y-5">
    <input name="display_name" required placeholder="Display name" className="w-full rounded-xl border border-white/15 bg-[#202a40] p-3 text-[#f8f1e7] placeholder:text-[#b9bad0] outline-none focus:border-[#d2c5ff] focus:ring-2 focus:ring-[#d2c5ff]/40" />
    <select name="age_range" value={ageRange} onChange={(event) => { setAgeRange(event.target.value); setSelectedSupportGoals([]); }} className="w-full rounded-xl border border-white/15 bg-[#202a40] p-3 text-[#f8f1e7] outline-none focus:border-[#d2c5ff] focus:ring-2 focus:ring-[#d2c5ff]/40"><option value="under_13">Under 13</option><option value="13_15">13-15</option><option value="16_17">16-17</option><option value="18_plus">18+</option></select>
    <fieldset><p className="mb-3 text-sm font-medium text-slate-100">What tends to feel heavy?</p><div className="grid gap-3 sm:grid-cols-2">{chips.map(([value, label]) => <label key={value} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3 text-sm text-slate-100"><input type="checkbox" name="support_goals" value={value} checked={selectedSupportGoals.includes(value)} onChange={(event) => setSelectedSupportGoals((current) => event.target.checked ? [...current, value] : current.filter((item) => item !== value))} className="h-4 w-4" />{label}</label>)}</div></fieldset>
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
      <p className="text-sm text-slate-100">Parent/guardian email (optional)</p><p className="mt-1 text-xs text-slate-300">Only used for optional guardian summaries. Private entries are not shared.</p>
      <input name="guardian_email" type="email" placeholder="name@example.com" className="mt-2 w-full rounded-xl border border-white/15 bg-[#202a40] p-3 text-[#f8f1e7] placeholder:text-[#b9bad0] outline-none focus:border-[#d2c5ff] focus:ring-2 focus:ring-[#d2c5ff]/40" />
    </div>
    {state.error ? <p className="rounded-xl border border-rose-300/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-100">{state.error}</p> : null}
    <SubmitButton />
  </form>;
}
