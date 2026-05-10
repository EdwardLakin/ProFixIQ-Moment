"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export function BillingActions({ plan }: { plan: "free" | "plus" | "pro" }) {
  const [busy, setBusy] = useState<string | null>(null);
  const searchParams = useSearchParams();


  useEffect(() => {
    const intendedPlan = searchParams.get("plan");
    if (plan === "free" && (intendedPlan === "plus" || intendedPlan === "pro")) {
      void go("/api/stripe/create-checkout-session", { plan: intendedPlan });
    }
  }, [plan, searchParams]);

  async function go(endpoint: string, body?: Record<string, string>) {
    setBusy(endpoint);
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = (await response.json()) as { url?: string };
    setBusy(null);
    if (data.url) window.location.href = data.url;
  }

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {plan === "free" ? (
        <>
          <button onClick={() => go("/api/stripe/create-checkout-session", { plan: "plus" })} className="moment-btn-primary" disabled={Boolean(busy)}>{busy ? "Working…" : "Upgrade to Plus"}</button>
          <button onClick={() => go("/api/stripe/create-checkout-session", { plan: "pro" })} className="moment-btn-secondary" disabled={Boolean(busy)}>Upgrade to Pro</button>
        </>
      ) : (
        <button onClick={() => go("/api/stripe/create-portal-session")} className="moment-btn-primary" disabled={Boolean(busy)}>{busy ? "Working…" : "Manage subscription"}</button>
      )}
    </div>
  );
}
