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

  await supabase.from("moment_profiles").update({ last_seen_at: new Date().toISOString() }).eq("user_id", user.id);

  return (
    <MomentAppShell title="Moment" subtitle="One calm next step, right when you need it.">
      <DashboardClient greeting={greeting} />
    </MomentAppShell>
  );
}
