import Link from "next/link";

export default function HomePage() {
  return (
    <main className="moment-glow min-h-screen px-6 py-10 text-[#f8f1e7]">
      <section className="mx-auto flex max-w-5xl flex-col gap-10">
        <p className="text-sm uppercase tracking-[0.28em] text-violet-200/70">Moment by ProFixIQ</p>
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-10 shadow-2xl shadow-violet-950/20 backdrop-blur-xl">
          <h1 className="max-w-4xl text-4xl font-semibold tracking-tight md:text-6xl">A calmer way to restart when life feels too loud.</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">Small steps when everything feels too big. Moment is an AI operating system for overwhelmed minds.</p>
          <div className="mt-8 flex flex-wrap gap-3"><Link href="/dashboard" className="rounded-full bg-violet-200 px-5 py-3 text-sm font-semibold text-slate-950">Open moment</Link><Link href="/sign-in" className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white">Sign in</Link></div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            "Emotional overload",
            "School overwhelm",
            "Executive dysfunction",
            "Social pressure",
            "Restart momentum",
          ].map((item) => <article key={item} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-slate-200">{item}</article>)}
        </div>
      </section>
    </main>
  );
}
