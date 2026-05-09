import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0b1020] px-6 py-10 text-[#f8f1e7]">
      <section className="mx-auto flex max-w-4xl flex-col gap-8">
        <p className="text-sm uppercase tracking-[0.28em] text-violet-200/70">
          Moment by ProFixIQ
        </p>

        <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-violet-950/20">
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
            The pause button for overwhelmed minds.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            Moment helps users check in, get unstuck, break hard tasks into tiny
            steps, and restart calmly. It is not therapy, diagnosis, or crisis care.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="rounded-full bg-violet-200 px-5 py-3 text-sm font-semibold text-slate-950"
            >
              Open dashboard
            </Link>
            <Link
              href="/sign-in"
              className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
