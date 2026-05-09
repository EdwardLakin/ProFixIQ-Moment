import Link from "next/link";

export default function Page() {
  return (
    <main className="min-h-screen bg-[#0b1020] px-6 py-8 text-[#f8f1e7]">
      <section className="mx-auto max-w-5xl">
        <Link href="/" className="text-sm text-violet-200/80">
          ← Moment
        </Link>
        <div className="mt-6 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-violet-200/60">
            Moment workspace
          </p>
          <h1 className="mt-3 text-3xl font-semibold">Onboarding</h1>
          <p className="mt-3 max-w-2xl text-slate-300">
            Placeholder route ready for the next vertical slice.
          </p>
        </div>
      </section>
    </main>
  );
}
