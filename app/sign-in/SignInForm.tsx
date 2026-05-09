"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MomentButton } from "@/components/moment/MomentButton";
import { MomentInput } from "@/components/moment/MomentInput";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

function mapAuthError(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes("invalid login credentials")) return "Invalid email or password.";
  if (lower.includes("email not confirmed")) return "Please confirm your email before signing in.";
  if (lower.includes("signups not allowed")) return "Sign up is currently disabled.";
  if (lower.includes("password") && lower.includes("weak")) return "Password is too weak. Use a stronger password.";
  return "Something went wrong. Please try again.";
}

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState("sign-in");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const next = searchParams.get("next") || "/dashboard";

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setMessage("");

    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");
    const supabase = createSupabaseBrowserClient();

    if (mode === "sign-in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage(mapAuthError(error.message));
        setLoading(false);
        return;
      }
      router.push(`/auth/callback?next=${encodeURIComponent(next)}`);
      return;
    }

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setMessage(mapAuthError(error.message));
      setLoading(false);
      return;
    }

    if (!data.session) {
      setMessage("Check your email to confirm your account, then return to sign in.");
      setLoading(false);
      return;
    }

    router.push("/auth/callback?next=/onboarding");
  }

  return (
    <form action={handleSubmit} className="space-y-3">
      <MomentInput name="email" type="email" required placeholder="Email" />
      <MomentInput name="password" type="password" required placeholder="Password" />
      <div className="flex gap-2">
        <MomentButton type="submit" disabled={loading}>
          {loading ? "Please wait..." : mode === "sign-in" ? "Sign in" : "Create account"}
        </MomentButton>
        <MomentButton type="button" onClick={() => setMode(mode === "sign-in" ? "sign-up" : "sign-in")}>
          {mode === "sign-in" ? "Need an account?" : "Have an account?"}
        </MomentButton>
      </div>
      {message ? <p className="text-sm text-rose-300">{message}</p> : null}
    </form>
  );
}
