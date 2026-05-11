import { redirect } from "next/navigation";
import { getCanonicalAppPath, getOrCreateMomentProfile, requireAuthenticatedUser } from "@/lib/auth";

export default async function BillingSuccessPage() {
  const user = await requireAuthenticatedUser("/billing/success");
  const profile = await getOrCreateMomentProfile(user.id);
  redirect(await getCanonicalAppPath(user.id, profile));
}
