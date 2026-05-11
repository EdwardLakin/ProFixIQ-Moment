"use client";

import { useActionState, useEffect, useState } from "react";
import { MomentButton } from "@/components/moment/MomentButton";

type ProfileState = {
  ok: boolean;
  error: string | null;
  profile: {
    display_name: string;
    age_range: string;
    birthday_month: string;
    birthday_day: string;
    focus_areas: string;
    support_goals: string;
  };
};

const initialState: ProfileState = {
  ok: false,
  error: null,
  profile: {
    display_name: "",
    age_range: "18_plus",
    birthday_month: "",
    birthday_day: "",
    focus_areas: "",
    support_goals: "",
  },
};

export function ProfileSettingsForm({
  action,
  initialProfile,
}: {
  action: (state: ProfileState, formData: FormData) => Promise<ProfileState>;
  initialProfile: ProfileState["profile"];
}) {
  const [state, formAction, pending] = useActionState(action, { ...initialState, profile: initialProfile });
  const [formValues, setFormValues] = useState(initialProfile);

  useEffect(() => {
    if (state.ok) {
      setFormValues(state.profile);
    }
  }, [state]);

  return (
    <form action={formAction} className="mt-4 grid gap-3 sm:grid-cols-2">
      <label className="text-sm text-slate-300">Display name<input name="display_name" value={formValues.display_name} onChange={(e) => setFormValues((prev) => ({ ...prev, display_name: e.target.value }))} className="mt-1 w-full rounded-xl border border-white/15 bg-[#202a40] p-3 text-[#f8f1e7]" /></label>
      <label className="text-sm text-slate-300">Age range<select name="age_range" value={formValues.age_range} onChange={(e) => setFormValues((prev) => ({ ...prev, age_range: e.target.value }))} className="mt-1 w-full rounded-xl border border-white/15 bg-[#202a40] p-3 text-[#f8f1e7]"><option value="under_13">Under 13</option><option value="13_15">13-15</option><option value="16_17">16-17</option><option value="18_plus">18+</option><option value="not_set">Prefer not to say</option></select></label>
      <label className="text-sm text-slate-300">Birthday month<input name="birthday_month" type="text" inputMode="numeric" pattern="[0-9]*" maxLength={2} value={formValues.birthday_month} onChange={(e) => setFormValues((prev) => ({ ...prev, birthday_month: e.target.value }))} className="mt-1 w-full rounded-xl border border-white/15 bg-[#202a40] p-3 text-[#f8f1e7]" /></label>
      <label className="text-sm text-slate-300">Birthday day<input name="birthday_day" type="text" inputMode="numeric" pattern="[0-9]*" maxLength={2} value={formValues.birthday_day} onChange={(e) => setFormValues((prev) => ({ ...prev, birthday_day: e.target.value }))} className="mt-1 w-full rounded-xl border border-white/15 bg-[#202a40] p-3 text-[#f8f1e7]" /></label>
      <label className="text-sm text-slate-300 sm:col-span-2">Focus areas (comma-separated)<input name="focus_areas" value={formValues.focus_areas} onChange={(e) => setFormValues((prev) => ({ ...prev, focus_areas: e.target.value }))} className="mt-1 w-full rounded-xl border border-white/15 bg-[#202a40] p-3 text-[#f8f1e7]" /></label>
      <label className="text-sm text-slate-300 sm:col-span-2">Support goals (comma-separated)<input name="support_goals" value={formValues.support_goals} onChange={(e) => setFormValues((prev) => ({ ...prev, support_goals: e.target.value }))} className="mt-1 w-full rounded-xl border border-white/15 bg-[#202a40] p-3 text-[#f8f1e7]" /></label>
      {state.error ? <p className="sm:col-span-2 text-sm text-rose-300">{state.error}</p> : null}
      <div className="sm:col-span-2"><MomentButton type="submit" disabled={pending}>{pending ? "Saving…" : "Save profile"}</MomentButton></div>
    </form>
  );
}
