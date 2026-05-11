"use client";

import { useState } from "react";

export function BillingActions({ plan, source = "settings", showSync = false }: { plan: "free" | "plus" | "pro"; source?: "settings" | "pricing"; showSync?: boolean }) {
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
      const data = (response.headers.get("content-type")?.includes("application/json")
        ? await response.json()
        : {}) as { url?: string; error?: string; synced?: boolean };
      if (!response.ok) {
        throw new Error(data.error || "Unable to start checkout. Please try again.");
      }
      if (data.synced) {
        window.location.reload();
        return;
      }
      if (!data.url) {
        throw new Error("Unable to refresh billing right now. Please try again.");
      }
      if (!/^https?:\/\//.test(data.url)) {
        throw new Error("Unable to start checkout. Please try again.");
      }
      window.location.assign(data.url);
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
        {showSync ? <button onClick={() => go("/api/stripe/sync-subscription")} className="moment-btn-secondary" disabled={Boolean(busy)}>{busy ? "Working…" : "Refresh billing status"}</button> : null}
      </div>
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
    </div>
  );
}
