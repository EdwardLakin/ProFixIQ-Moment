import { MomentAppShell } from "@/components/moment/MomentAppShell";
import { MomentButton } from "@/components/moment/MomentButton";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAuthenticatedUser } from "@/lib/auth";
import { BillingActions } from "@/components/moment/BillingActions";
import { ProfileSettingsForm } from "@/components/moment/ProfileSettingsForm";
import { parseMomentPlan } from "@/lib/plans";

async function updateProfile(_previousState: unknown, formData: FormData) {
  "use server";
  const user = await requireAuthenticatedUser("/settings");
  const supabase = await createSupabaseServerClient();

  const displayName = String(formData.get("display_name") ?? "").trim();
  const ageRange = String(formData.get("age_range") ?? "18_plus");
  const birthdayMonthRaw = String(formData.get("birthday_month") ?? "").trim();
  const birthdayDayRaw = String(formData.get("birthday_day") ?? "").trim();
  const birthdayMonthCandidate = birthdayMonthRaw ? Number.parseInt(birthdayMonthRaw, 10) : null;
  const birthdayDayCandidate = birthdayDayRaw ? Number.parseInt(birthdayDayRaw, 10) : null;
  const birthdayMonth = typeof birthdayMonthCandidate === "number" && birthdayMonthCandidate >= 1 && birthdayMonthCandidate <= 12 ? birthdayMonthCandidate : null;
  const birthdayDay = typeof birthdayDayCandidate === "number" && birthdayDayCandidate >= 1 && birthdayDayCandidate <= 31 ? birthdayDayCandidate : null;
  const focusAreas = String(formData.get("focus_areas") ?? "").split(",").map((item) => item.trim()).filter((item) => item.length > 0);
  const supportGoals = String(formData.get("support_goals") ?? "").split(",").map((item) => item.trim()).filter((item) => item.length > 0);
  const journalContextEnabled = String(formData.get("journal_context_enabled") ?? "off") === "on";

  const { error } = await supabase.from("moment_profiles").upsert({
    user_id: user.id,
    display_name: displayName,
    age_range: ageRange,
    birthday_month: birthdayMonth,
    birthday_day: birthdayDay,
    focus_areas: focusAreas,
    support_goals: supportGoals,
    journal_context_enabled: journalContextEnabled,
  }, { onConflict: "user_id" });

  if (error) {
    return {
      ok: false,
      error: `Could not update profile: ${error.message}`,
      profile: {
        display_name: displayName,
        age_range: ageRange,
        birthday_month: birthdayMonthRaw,
        birthday_day: birthdayDayRaw,
        focus_areas: focusAreas.join(", "),
        support_goals: supportGoals.join(", "),
      },
    };
  }

  return {
    ok: true,
    error: null,
    profile: {
      display_name: displayName,
      age_range: ageRange,
      birthday_month: birthdayMonth ? String(birthdayMonth) : "",
      birthday_day: birthdayDay ? String(birthdayDay) : "",
      focus_areas: focusAreas.join(", "),
      support_goals: supportGoals.join(", "),
    },
  };
}



async function updateJournalContext(formData: FormData) {
  "use server";
  const user = await requireAuthenticatedUser("/settings");
  const supabase = await createSupabaseServerClient();
  const enabled = String(formData.get("journal_context_enabled") ?? "off") === "on";
  await supabase.from("moment_profiles").upsert({ user_id: user.id, journal_context_enabled: enabled }, { onConflict: "user_id" });
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
  const { data: profile } = await supabase.from("moment_profiles").select("display_name,age_range,birthday_month,birthday_day,focus_areas,support_goals,journal_context_enabled").eq("user_id", user.id).maybeSingle();
  const { data: goals } = await supabase.from("moment_goals").select("id,title,status").eq("user_id", user.id).eq("status", "active").order("updated_at", { ascending: false }).limit(6);
  const { data: suggestions } = await supabase.from("moment_suggestions").select("id,suggestion_text,status").eq("user_id", user.id).in("status", ["suggested", "accepted"]).order("updated_at", { ascending: false }).limit(6);
  const { data: subscription } = await supabase.from("moment_subscriptions").select("plan,status,current_period_end,cancel_at_period_end,stripe_customer_id,stripe_subscription_id").eq("user_id", user.id).maybeSingle();
  const currentPlan = parseMomentPlan(subscription?.plan);
  const likelySyncDelay = currentPlan === "free" && Boolean(subscription?.stripe_customer_id || subscription?.stripe_subscription_id);

  return (
    <MomentAppShell title="Settings" subtitle="Simple profile details you can adjust anytime.">
      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 md:col-span-2">
          <h2 className="text-lg font-medium">Profile</h2>
          <ProfileSettingsForm
            action={updateProfile}
            initialProfile={{
              display_name: profile?.display_name ?? "",
              age_range: profile?.age_range ?? "18_plus",
              birthday_month: profile?.birthday_month ? String(profile.birthday_month) : "",
              birthday_day: profile?.birthday_day ? String(profile.birthday_day) : "",
              focus_areas: (profile?.focus_areas ?? []).join(", "),
              support_goals: (profile?.support_goals ?? []).join(", "),
              journal_context_enabled: Boolean(profile?.journal_context_enabled),
            }}
          />
        </article>

        <article className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 md:col-span-2">
          <h2 className="text-lg font-medium">Journal privacy</h2>
          <p className="mt-1 text-sm text-slate-300">When on, Moment can use your past journal entries to understand patterns and continue conversations. When off, your journal stays saved for you, but Moment won’t use it as context.</p>
          <form action={updateJournalContext} className="mt-4">
            <label className="flex items-start gap-3 text-sm text-slate-200">
              <input type="checkbox" name="journal_context_enabled" defaultChecked={Boolean(profile?.journal_context_enabled)} className="mt-1 h-4 w-4" />
              <span>Allow Moment to use my journal for context</span>
            </label>
            <div className="mt-3"><MomentButton type="submit">Save privacy setting</MomentButton></div>
          </form>
        </article>

        <article className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 md:col-span-2">
          <h2 className="text-lg font-medium">Billing</h2>
          <p className="mt-1 text-sm text-slate-300">Current plan: <span className="font-semibold text-slate-100 uppercase">{currentPlan}</span></p>
          <p className="text-sm text-slate-300">Status: {subscription?.status ?? "inactive"}</p>
          <p className="text-sm text-slate-300">Renews: {subscription?.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString() : "—"}</p>
          {likelySyncDelay ? <p className="mt-2 text-sm text-amber-200">Syncing subscription… If billing looks stale, refresh billing status.</p> : null}
          <BillingActions plan={currentPlan} showSync={likelySyncDelay || currentPlan !== "free"} />
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
