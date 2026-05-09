"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type AuthMode = "sign-in" | "sign-up";

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const next = searchParams.get("next") || "/onboarding";

  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit() {
    setIsSubmitting(true);
    setError(null);
    setStatus(null);

    const normalizedEmail = email.trim();

    if (!normalizedEmail || !password) {
      setError("Enter an email and password to continue.");
      setIsSubmitting(false);
      return;
    }

    const result =
      mode === "sign-up"
        ? await supabase.auth.signUp({
            email: normalizedEmail,
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
            },
          })
        : await supabase.auth.signInWithPassword({
            email: normalizedEmail,
            password,
          });

    if (result.error) {
      setError(result.error.message);
      setIsSubmitting(false);
      return;
    }

    if (mode === "sign-up" && !result.data.session) {
      setStatus("Check your email to confirm your account, then return to sign in.");
      setIsSubmitting(false);
      return;
    }

    router.replace(next);
    router.refresh();
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="grid grid-cols-2 gap-2 rounded-full bg-black/20 p-1 ring-1 ring-white/10">
        <button
          type="button"
          onClick={() => setMode("sign-in")}
          className={[
            "rounded-full px-4 py-2 text-sm font-semibold transition",
            mode === "sign-in"
              ? "bg-violet-200 text-slate-950"
              : "text-slate-300 hover:bg-white/10 hover:text-white",
          ].join(" ")}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => setMode("sign-up")}
          className={[
            "rounded-full px-4 py-2 text-sm font-semibold transition",
            mode === "sign-up"
              ? "bg-violet-200 text-slate-950"
              : "text-slate-300 hover:bg-white/10 hover:text-white",
          ].join(" ")}
        >
          Create account
        </button>
      </div>

      <label className="block">
        <span className="text-sm font-medium text-slate-200">Email</span>
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          autoComplete="email"
          className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-violet-300/70"
          placeholder="you@example.com"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-slate-200">Password</span>
        <input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          type="password"
          autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
          className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-violet-300/70"
          placeholder="Password"
        />
      </label>

      {error ? (
        <div className="rounded-2xl border border-rose-300/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      ) : null}

      {status ? (
        <div className="rounded-2xl border border-violet-200/20 bg-violet-300/10 px-4 py-3 text-sm text-violet-100">
          {status}
        </div>
      ) : null}

      <button
        type="button"
        onClick={submit}
        disabled={isSubmitting}
        className="w-full rounded-full bg-violet-200 px-5 py-3 text-sm font-bold text-slate-950 shadow-xl shadow-violet-950/30 transition hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Working…" : mode === "sign-up" ? "Create account" : "Sign in"}
      </button>
    </div>
  );
}
