import { Suspense } from "react";
import { SignInForm } from "./SignInForm";

export default function SignInPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0f172a] px-5 py-8 text-[#f8f1e7]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(196,181,253,0.18),transparent_38%),radial-gradient(circle_at_80%_10%,rgba(251,191,163,0.14),transparent_30%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:56px_56px]" />

      <div className="relative mx-auto grid min-h-[85vh] w-full max-w-6xl items-center gap-8 lg:grid-cols-2">
        <section className="order-2 space-y-4 lg:order-1">
          <p className="text-xs uppercase tracking-[0.25em] text-violet-200/85">Moment</p>
          <h1 className="max-w-xl text-4xl font-semibold leading-tight sm:text-5xl">Come back to one small next step.</h1>
          <ul className="max-w-xl space-y-3 text-base leading-7 text-[#e6deed]">
            <li>Check in without needing the perfect words.</li>
            <li>Moment routes the hard thing into a calmer reset.</li>
            <li>Private by default. Built for support, not surveillance.</li>
          </ul>
        </section>

        <section className="order-1 lg:order-2">
          <div className="rounded-[2rem] border border-white/15 bg-[#172033]/95 p-6 shadow-[0_30px_80px_-25px_rgba(15,23,42,0.85)] ring-1 ring-white/10 sm:p-8">
            <p className="text-xs uppercase tracking-[0.22em] text-violet-100/80">Welcome back</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">Sign in to Moment</h2>
            <p className="mt-2 text-sm leading-6 text-[#d8d6e8]">Pick up where you left off, or create your account in a minute.</p>
            <Suspense fallback={<p className="mt-6 text-sm text-[#d6d3e8]">Loading sign in…</p>}>
              <SignInForm />
            </Suspense>
          </div>
        </section>
      </div>
    </main>
  );
}
