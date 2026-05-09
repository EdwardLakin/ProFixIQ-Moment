import { Suspense } from "react";
import { SignInForm } from "./SignInForm";

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-[#080d1c] px-5 py-10 text-[#f8f1e7]">
      <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center">
        <div className="rounded-[2rem] bg-white/[0.07] p-6 shadow-2xl shadow-violet-950/30 ring-1 ring-white/10">
          <p className="text-xs uppercase tracking-[0.28em] text-violet-200/80">
            Moment by ProFixIQ
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">
            Sign in to Moment
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Continue to onboarding or return to your Moment dashboard.
          </p>

          <Suspense fallback={<p className="mt-6 text-sm text-slate-300">Loading sign in…</p>}>
            <SignInForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
