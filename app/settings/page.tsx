import { MomentAppShell } from "@/components/moment/MomentAppShell";
import { MomentButton } from "@/components/moment/MomentButton";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAuthenticatedUser } from "@/lib/auth";
import { BillingActions } from "@/components/moment/BillingActions";
import { parseMomentPlan } from "@/lib/plans";

async function updateProfile(formData: FormData) {
  "use server";
  const user = await requireAuthenticatedUser("/settings");
  const supabase = await createSupabaseServerClient();

  const displayName = String(formData.get("display_name") ?? "").trim();
  const ageRange = String(formData.get("age_range") ?? "18_plus");
  const birthdayMonthRaw = String(formData.get("birthday_month") ?? "").trim();
  const birthdayDayRaw = String(formData.get("birthday_day") ?? "").trim();
  const birthdayMonth = birthdayMonthRaw ? Number.parseInt(birthdayMonthRaw, 10) : null;
  const birthdayDay = birthdayDayRaw ? Number.parseInt(birthdayDayRaw, 10) : null;
  const focusAreas = String(formData.get("focus_areas") ?? "").split(",").map((item) => item.trim()).filter((item) => item.length > 0);
  const supportGoals = String(formData.get("support_goals") ?? "").split(",").map((item) => item.trim()).filter((item) => item.length > 0);

  const { error } = await supabase.from("moment_profiles").upsert({
    user_id: user.id,
    display_name: displayName,
    age_range: ageRange,
    birthday_month: Number.isInteger(birthdayMonth) ? birthdayMonth : null,
    birthday_day: Number.isInteger(birthdayDay) ? birthdayDay : null,
    focus_areas: focusAreas,
    support_goals: supportGoals,
  }, { onConflict: "user_id" });

  if (error) throw new Error(`Could not update profile: ${error.message}`);
}


async function updateSuggestionStatus(formData: FormData) {
  "use server";
  const user = await requireAuthenticatedUser("/settings");
  const supabase = await createSupabaseServerClient();
  const id = String(formData.get("suggestion_id") ?? "");
  const status = String(formData.get("status") ?? "archived");
  if (!id || !(status === "dismissed" || status === "archived")) return;
  await supabase.from("moment_suggestions").update({ status }).eq("id", id).eq("user_id", user.id);
}

export default async function SettingsPage() {
  const user = await requireAuthenticatedUser("/settings");
  const supabase = await createSupabaseServerClient();
  const { data: profile } = await supabase.from("moment_profiles").select("display_name,age_range,birthday_month,birthday_day,focus_areas,support_goals").eq("user_id", user.id).maybeSingle();
  const { data: goals } = await supabase.from("moment_goals").select("id,title,status").eq("user_id", user.id).eq("status", "active").order("updated_at", { ascending: false }).limit(6);
  const { data: suggestions } = await supabase.from("moment_suggestions").select("id,suggestion_text,status").eq("user_id", user.id).in("status", ["suggested", "accepted"]).order("updated_at", { ascending: false }).limit(6);
  const { data: subscription } = await supabase.from("moment_subscriptions").select("plan,status,current_period_end,cancel_at_period_end").eq("user_id", user.id).maybeSingle();
  const currentPlan = parseMomentPlan(subscription?.plan);

  return (
    <MomentAppShell title="Settings" subtitle="Simple profile details you can adjust anytime.">
      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 md:col-span-2">
          <h2 className="text-lg font-medium">Profile</h2>
          <form action={updateProfile} className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="text-sm text-slate-300">Display name<input name="display_name" defaultValue={profile?.display_name ?? ""} className="mt-1 w-full rounded-xl border border-white/15 bg-[#202a40] p-3 text-[#f8f1e7]" /></label>
            <label className="text-sm text-slate-300">Age range<select name="age_range" defaultValue={profile?.age_range ?? "18_plus"} className="mt-1 w-full rounded-xl border border-white/15 bg-[#202a40] p-3 text-[#f8f1e7]"><option value="under_13">Under 13</option><option value="13_15">13-15</option><option value="16_17">16-17</option><option value="18_plus">18+</option><option value="not_set">Prefer not to say</option></select></label>
            <label className="text-sm text-slate-300">Birthday month<input name="birthday_month" type="number" min={1} max={12} defaultValue={profile?.birthday_month ?? ""} className="mt-1 w-full rounded-xl border border-white/15 bg-[#202a40] p-3 text-[#f8f1e7]" /></label>
            <label className="text-sm text-slate-300">Birthday day<input name="birthday_day" type="number" min={1} max={31} defaultValue={profile?.birthday_day ?? ""} className="mt-1 w-full rounded-xl border border-white/15 bg-[#202a40] p-3 text-[#f8f1e7]" /></label>
            <label className="text-sm text-slate-300 sm:col-span-2">Focus areas (comma-separated)<input name="focus_areas" defaultValue={(profile?.focus_areas ?? []).join(", ")} className="mt-1 w-full rounded-xl border border-white/15 bg-[#202a40] p-3 text-[#f8f1e7]" /></label>
            <label className="text-sm text-slate-300 sm:col-span-2">Support goals (comma-separated)<input name="support_goals" defaultValue={(profile?.support_goals ?? []).join(", ")} className="mt-1 w-full rounded-xl border border-white/15 bg-[#202a40] p-3 text-[#f8f1e7]" /></label>
            <div className="sm:col-span-2"><MomentButton type="submit">Save profile</MomentButton></div>
          </form>
        </article>


        <article className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 md:col-span-2">
          <h2 className="text-lg font-medium">Billing</h2>
          <p className="mt-1 text-sm text-slate-300">Current plan: <span className="font-semibold text-slate-100 uppercase">{currentPlan}</span></p>
          <p className="text-sm text-slate-300">Status: {subscription?.status ?? "inactive"}</p>
          <p className="text-sm text-slate-300">Renews: {subscription?.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString() : "—"}</p>
          <BillingActions plan={currentPlan} />
        </article>

        <article className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 md:col-span-2">
          <h2 className="text-lg font-medium">Memory</h2>
          <p className="mt-1 text-sm text-slate-300">Pattern-level notes from your recent support flow.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <h3 className="text-sm font-medium text-slate-200">Active goals</h3>
              <ul className="mt-2 space-y-2 text-sm text-slate-300">{(goals ?? []).map((goal) => <li key={goal.id} className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2">{goal.title}</li>)}{(goals ?? []).length === 0 ? <li>No active goals yet.</li> : null}</ul>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-200">Suggestions</h3>
              <ul className="mt-2 space-y-2 text-sm text-slate-300">
                {(suggestions ?? []).map((suggestion) => (
                  <li key={suggestion.id} className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2">
                    <p>{suggestion.suggestion_text}</p>
                    <div className="mt-2 flex gap-2">
                      <form action={updateSuggestionStatus}><input type="hidden" name="suggestion_id" value={suggestion.id} /><input type="hidden" name="status" value="dismissed" /><MomentButton type="submit">Dismiss</MomentButton></form>
                      <form action={updateSuggestionStatus}><input type="hidden" name="suggestion_id" value={suggestion.id} /><input type="hidden" name="status" value="archived" /><MomentButton type="submit">Archive</MomentButton></form>
                    </div>
                  </li>
                ))}
                {(suggestions ?? []).length === 0 ? <li>No active suggestions.</li> : null}
              </ul>
            </div>
          </div>
        </article>
      </section>
    </MomentAppShell>
  );
}
