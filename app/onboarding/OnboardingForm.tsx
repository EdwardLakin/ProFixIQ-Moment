"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { MomentButton } from "@/components/moment/MomentButton";

type OnboardingState = { error: string | null };

type CompleteOnboardingAction = (
  state: OnboardingState,
  formData: FormData
) => Promise<OnboardingState>;

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <MomentButton type="submit" className="mt-2 w-full sm:w-auto" disabled={pending}>
      {pending ? "Saving…" : "Save and continue"}
    </MomentButton>
  );
}

export function OnboardingForm({ action }: { action: CompleteOnboardingAction }) {
  const [state, formAction] = useActionState(action, { error: null });

  return (
    <form action={formAction} className="space-y-5">
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

      {state.error ? (
        <p className="rounded-xl border border-rose-300/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-100">{state.error}</p>
      ) : null}

      <SubmitButton />
    </form>
  );
}
