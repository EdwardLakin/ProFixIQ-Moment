"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type AuthMode = "sign-in" | "sign-up";

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const requestedNext = searchParams.get("next") || "/";
  const signupNext = requestedNext === "/" || requestedNext === "/dashboard" || requestedNext === "/onboarding" || requestedNext.startsWith("/settings")
    ? "/onboarding"
    : requestedNext;
  const signinNext = requestedNext;

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
              emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(signupNext)}`,
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

    router.replace(mode === "sign-up" ? signupNext : signinNext);
    router.refresh();
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="grid grid-cols-2 gap-2 rounded-full bg-[#1d2941]/85 p-1 ring-1 ring-white/20">
        <button
          type="button"
          onClick={() => setMode("sign-in")}
          className={[
            "rounded-full px-4 py-2 text-sm font-semibold transition",
            mode === "sign-in"
              ? "bg-violet-100 text-[#1a1730] shadow-[0_10px_24px_-16px_rgba(196,181,253,1)]"
              : "text-[#e7e2ff] hover:bg-white/12 hover:text-[#f8f1e7]",
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
              ? "bg-violet-100 text-[#1a1730] shadow-[0_10px_24px_-16px_rgba(196,181,253,1)]"
              : "text-[#e7e2ff] hover:bg-white/12 hover:text-[#f8f1e7]",
          ].join(" ")}
        >
          Create account
        </button>
      </div>

      <label className="block">
        <span className="text-sm font-medium text-[#ece8f6]">Email</span>
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          autoComplete="email"
          className="mt-2 w-full rounded-2xl border border-white/15 bg-[#1d2941]/90 px-4 py-3 text-[#f8f1e7] outline-none placeholder:text-[#a7a8bd] focus:border-[#c4b5fd] focus:ring-2 focus:ring-[#c4b5fd]/40"
          placeholder="you@example.com"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-[#ece8f6]">Password</span>
        <input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          type="password"
          autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
          className="mt-2 w-full rounded-2xl border border-white/15 bg-[#1d2941]/90 px-4 py-3 text-[#f8f1e7] outline-none placeholder:text-[#a7a8bd] focus:border-[#c4b5fd] focus:ring-2 focus:ring-[#c4b5fd]/40"
          placeholder="Password"
        />
      </label>

      {error ? (
        <div className="rounded-2xl border border-rose-300/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      ) : null}

      {status ? (
        <div className="rounded-2xl border border-[#c4b5fd]/30 bg-[#c4b5fd]/10 px-4 py-3 text-sm text-[#f8f1e7]">
          {status}
        </div>
      ) : null}

      <button
        type="button"
        onClick={submit}
        disabled={isSubmitting}
        className="moment-btn-primary w-full disabled:cursor-not-allowed disabled:bg-[#9f93c9] disabled:text-[#241f3a]"
      >
        {isSubmitting ? "Working…" : mode === "sign-up" ? "Create account" : "Sign in"}
      </button>
    </div>
  );
}
