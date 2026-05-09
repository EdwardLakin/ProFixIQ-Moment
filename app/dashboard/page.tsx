import { DashboardClient } from "@/app/dashboard/DashboardClient";
import { MomentAppShell } from "@/components/moment/MomentAppShell";

export default async function DashboardPage() {
  return (
    <MomentAppShell title="Moment" subtitle="One calm next step, right when you need it.">
      <DashboardClient />
    </MomentAppShell>
  );
}
