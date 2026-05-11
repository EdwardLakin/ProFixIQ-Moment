import { redirect } from "next/navigation";
import { getCanonicalAppPath, getOrCreateMomentProfile, requireAuthenticatedUser } from "@/lib/auth";
import { getAppUrl } from "@/lib/env";

export default async function BillingSuccessPage() {
  const user = await requireAuthenticatedUser("/billing/success");
  const appUrl = getAppUrl();
  await fetch(`${appUrl}/api/stripe/sync-subscription`, { method: "POST", cache: "no-store" }).catch(() => null);
  const profile = await getOrCreateMomentProfile(user.id);
  redirect(await getCanonicalAppPath(user.id, profile));
}
