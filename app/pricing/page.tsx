import { redirect } from "next/navigation";
import { MomentShell } from "@/components/moment/MomentShell";
import { MomentCard } from "@/components/moment/MomentCard";
import { BillingActions } from "@/components/moment/BillingActions";
import Link from "next/link";
import { getCanonicalAppPath, getOrCreateMomentProfile, requireAuthenticatedUser } from "@/lib/auth";
import { getCurrentMomentPlan } from "@/lib/subscriptions";

export default async function PricingPage() {
  const user = await requireAuthenticatedUser("/pricing");
  const profile = await getOrCreateMomentProfile(user.id);
  const subscription = await getCurrentMomentPlan(user.id);

  if (subscription.plan !== "free") {
    redirect(await getCanonicalAppPath(user.id, profile));
  }

  return (
    <MomentShell>
      <section className="mx-auto max-w-3xl">
        <MomentCard className="space-y-4 border-white/20 bg-[#1a2438]">
          <h1 className="text-2xl font-semibold text-white">Choose your plan</h1>
          <p className="text-sm text-slate-300">Upgrade when you want more Moment power, or continue free.</p>
          <BillingActions plan="free" source="pricing" />
          <div>
            <Link href={profile.onboarding_complete ? "/dashboard" : "/onboarding"} className="text-sm text-violet-200 underline">
              Continue free
            </Link>
          </div>
        </MomentCard>
      </section>
    </MomentShell>
  );
}
