import { redirect } from "next/navigation";
import { DashboardClient } from "@/app/dashboard/DashboardClient";
import { MomentAppShell } from "@/components/moment/MomentAppShell";
import { getOnboardingRedirectPath, getOrCreateMomentProfile, requireAuthenticatedUser } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await requireAuthenticatedUser("/dashboard");
  const profile = await getOrCreateMomentProfile(user.id);

  if (getOnboardingRedirectPath(profile) !== "/dashboard") {
    redirect("/onboarding");
  }

  return (
    <MomentAppShell title="Moment" subtitle="One calm next step, right when you need it.">
      <DashboardClient />
    </MomentAppShell>
  );
}
