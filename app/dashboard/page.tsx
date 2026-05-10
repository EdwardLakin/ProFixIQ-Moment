import { redirect } from "next/navigation";
import { DashboardClient } from "@/app/dashboard/DashboardClient";
import { MomentAppShell } from "@/components/moment/MomentAppShell";
import { getMomentGreeting } from "@/features/moment/greeting/getMomentGreeting";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOnboardingRedirectPath, getOrCreateMomentProfile, requireAuthenticatedUser } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await requireAuthenticatedUser("/dashboard");
  const supabase = await createSupabaseServerClient();
  const profile = await getOrCreateMomentProfile(user.id);

  if (getOnboardingRedirectPath(profile) !== "/dashboard") {
    redirect("/onboarding");
  }

  const greeting = getMomentGreeting({
    displayName: profile.display_name,
    birthdayMonth: profile.birthday_month,
    birthdayDay: profile.birthday_day,
    lastSeenAt: profile.last_seen_at,
    now: new Date(),
  });

  const [{ count: activeGoalsCount }, { data: wins }, { data: suggestions }, { data: threads }] = await Promise.all([
    supabase.from("moment_goals").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "active"),
    supabase.from("moment_tiny_wins").select("win_note,created_at").eq("user_id", user.id).eq("status", "recorded").order("created_at", { ascending: false }).limit(1),
    supabase.from("moment_suggestions").select("suggestion_text,created_at,status").eq("user_id", user.id).in("status", ["suggested", "accepted"]).order("created_at", { ascending: false }).limit(1),
    supabase.from("moment_threads").select("title,summary,last_activity_at,status").eq("user_id", user.id).order("last_activity_at", { ascending: false }).limit(1),
  ]);

  await supabase.from("moment_profiles").update({ last_seen_at: new Date().toISOString() }).eq("user_id", user.id);

  return (
    <MomentAppShell title="Moment" subtitle="One calm next step, right when you need it.">
      <DashboardClient greeting={greeting} memory={{ activeGoalsCount: activeGoalsCount ?? 0, latestTinyWin: wins?.[0]?.win_note ?? null, latestSuggestion: suggestions?.[0]?.suggestion_text ?? null, recentThreadCue: threads?.[0]?.summary ?? null }} />
    </MomentAppShell>
  );
}
