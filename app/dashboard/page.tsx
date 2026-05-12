import { DashboardClient } from "@/app/dashboard/DashboardClient";
import { MomentAppShell } from "@/components/moment/MomentAppShell";
import { getMomentGreeting } from "@/features/moment/greeting/getMomentGreeting";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { readMomentMemory } from "@/features/moment/memory/readMomentMemory";
import { getOrCreateMomentProfile, requireAuthenticatedUser } from "@/lib/auth";
import { getCurrentMomentPlan } from "@/lib/subscriptions";
import { getMomentUsageSnapshot } from "@/lib/entitlements";

export default async function DashboardPage() {
  const user = await requireAuthenticatedUser("/dashboard");
  const supabase = await createSupabaseServerClient();
  const profile = await getOrCreateMomentProfile(user.id);

  const greeting = getMomentGreeting({
    displayName: profile.display_name,
    birthdayMonth: profile.birthday_month,
    birthdayDay: profile.birthday_day,
    lastSeenAt: profile.last_seen_at,
    now: new Date(),
  });

  const memory = await readMomentMemory(supabase, user.id, { includeContext: Boolean(profile.journal_context_enabled) });
  const subscription = await getCurrentMomentPlan(user.id);
  const usage = await getMomentUsageSnapshot(user.id, subscription.plan);

  await supabase.from("moment_profiles").update({ last_seen_at: new Date().toISOString() }).eq("user_id", user.id);

  return (
    <MomentAppShell title="Moment" subtitle="One calm next step, right when you need it.">
      <DashboardClient greeting={greeting} memory={memory} usage={usage} journalContextEnabled={Boolean(profile.journal_context_enabled)} />
    </MomentAppShell>
  );
}
