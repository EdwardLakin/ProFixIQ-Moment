"use client";

import { useState } from "react";

export function BillingActions({ plan, source = "settings" }: { plan: "free" | "plus" | "pro"; source?: "settings" | "pricing" }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function go(endpoint: string, body?: Record<string, string>) {
    setBusy(endpoint);
    setError(null);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !data.url) {
        throw new Error(data.error || "Unable to start checkout. Please try again.");
      }
      window.location.href = data.url;
      return;
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "Unable to start checkout. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mt-4 space-y-2">
      <div className="flex flex-wrap gap-2">
        {plan === "free" ? (
          <>
            <button onClick={() => go("/api/stripe/create-checkout-session", { plan: "plus", source })} className="moment-btn-primary" disabled={Boolean(busy)}>{busy ? "Working…" : "Upgrade to Plus"}</button>
            <button onClick={() => go("/api/stripe/create-checkout-session", { plan: "pro", source })} className="moment-btn-secondary" disabled={Boolean(busy)}>{busy ? "Working…" : "Upgrade to Pro"}</button>
          </>
        ) : (
          <button onClick={() => go("/api/stripe/create-portal-session")} className="moment-btn-primary" disabled={Boolean(busy)}>{busy ? "Working…" : "Manage subscription"}</button>
        )}
      </div>
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
    </div>
  );
}
