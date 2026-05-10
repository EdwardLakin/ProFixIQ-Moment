import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAppUrl, getStripeConfig } from "@/lib/env";

export async function POST() {
  const { user } = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("moment_subscriptions").select("stripe_customer_id").eq("user_id", user.id).maybeSingle();
  if (!data?.stripe_customer_id) return NextResponse.json({ error: "No billing profile" }, { status: 400 });

  const { secretKey } = getStripeConfig();
  const appUrl = getAppUrl();
  const payload = new URLSearchParams({ customer: data.stripe_customer_id, return_url: `${appUrl}/settings?tab=billing` });

  const stripeResponse = await fetch("https://api.stripe.com/v1/billing_portal/sessions", {
    method: "POST",
    headers: { Authorization: `Bearer ${secretKey}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: payload,
  });

  if (!stripeResponse.ok) return NextResponse.json({ error: "Portal unavailable" }, { status: 502 });
  const session = (await stripeResponse.json()) as { url: string };
  return NextResponse.json({ url: session.url });
}
