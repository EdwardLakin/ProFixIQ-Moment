import Link from "next/link";

const routes = [
  {
    title: "Math reset",
    badge: "Math",
    desc: "Defuse school overwhelm and re-enter with one clear action.",
    cta: "Open",
    href: "/math-reset",
  },
  {
    title: "Drama pause",
    badge: "Social",
    desc: "Pause escalation and choose your next boundary.",
    cta: "Open",
    href: "/drama-pause",
  },
  {
    title: "Stuck mode",
    badge: "Stuck",
    desc: "Break avoidance loops into one immediate step.",
    cta: "Open",
    href: "/stuck",
  },
  {
    title: "Parent insight",
    badge: "Soon",
    desc: "Pattern-level support summaries, not surveillance.",
    cta: "Preview",
    href: "/parent",
  },
];

const trustBadges = ["Private by default", "Not therapy", "Tiny next steps"];

export default function HomePage() {
  return (
    <main className="moment-glow relative min-h-screen overflow-hidden px-5 py-8 text-[#f8f1e7] sm:px-6 sm:py-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[34rem] w-[52rem] -translate-x-1/2 rounded-full bg-violet-400/22 blur-3xl" />
        <div className="absolute -left-16 top-32 h-72 w-72 rounded-full bg-sky-400/10 blur-3xl" />
        <div className="absolute -right-10 bottom-20 h-72 w-72 rounded-full bg-fuchsia-400/10 blur-3xl" />
      </div>

      <section className="relative mx-auto max-w-6xl space-y-6">
        <div className="rounded-[2rem] border border-white/12 bg-gradient-to-br from-white/10 via-white/[0.06] to-transparent p-6 shadow-[0_35px_120px_-55px_rgba(167,139,250,0.9)] sm:p-8 md:p-10">
          <div className="grid gap-7 lg:grid-cols-[1fr_1.05fr] lg:items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-violet-100/80 sm:text-sm">Moment by ProFixIQ</p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                Open Moment. Check in. Get one tiny next step.
              </h1>
              <p className="mt-4 max-w-xl text-slate-200 sm:text-lg">
                When everything feels loud, Moment gives you one focused move you can do now.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {trustBadges.map((badge) => (
                  <span key={badge} className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-violet-50">
                    {badge}
                  </span>
                ))}
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href="/dashboard"
                  className="inline-flex min-h-12 items-center justify-center rounded-full bg-violet-100 px-6 py-3 text-sm font-semibold text-[#140f2a] shadow-[0_14px_42px_-20px_rgba(196,181,253,1)] transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-100 focus-visible:ring-offset-2 focus-visible:ring-offset-[#130f26]"
                >
                  Open Moment
                </Link>
                <Link
                  href="/onboarding"
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/25 bg-white/5 px-6 py-3 text-sm font-medium text-violet-50 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-100"
                >
                  Start onboarding
                </Link>
              </div>
            </div>

            <article className="rounded-[1.7rem] border border-violet-200/20 bg-[#120f26]/85 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_40px_120px_-70px_rgba(196,181,253,0.95)] backdrop-blur sm:p-6">
              <p className="text-xs uppercase tracking-[0.18em] text-violet-200/70">Live Moment surface</p>
              <div className="mt-4 space-y-4 rounded-2xl border border-white/12 bg-white/[0.04] p-4 sm:p-5">
                <div>
                  <p className="text-sm text-slate-100">What feels hardest right now?</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    {["Overwhelmed", "Can’t start", "Math feels impossible"].map((chip) => (
                      <span key={chip} className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-slate-100">
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="inline-flex rounded-full border border-emerald-300/30 bg-emerald-300/10 px-3 py-1 text-xs font-medium text-emerald-100">
                  Routed to: Math Reset
                </div>

                <p className="rounded-xl border border-white/12 bg-black/25 p-3 text-sm text-slate-100">
                  Tiny next step: open the assignment and only read question one.
                </p>

                <div className="flex flex-wrap gap-2">
                  <button className="min-h-10 rounded-full border border-white/20 bg-white/5 px-3.5 py-2 text-xs font-medium text-slate-100">
                    Break it down
                  </button>
                  <button className="min-h-10 rounded-full bg-violet-100 px-4 py-2 text-xs font-semibold text-[#130f2b]">Open Math Reset</button>
                </div>
              </div>
            </article>
          </div>
        </div>

        <section className="space-y-3">
          <h2 className="text-base font-semibold tracking-tight text-violet-100/85">Other routes</h2>
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            {routes.map((item) => (
              <article key={item.title} className="flex h-full flex-col rounded-xl border border-white/10 bg-white/[0.025] p-3.5">
                <span className="inline-flex w-fit rounded-full border border-white/12 bg-white/[0.04] px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-violet-100/70">
                  {item.badge}
                </span>
                <h3 className="mt-2 text-sm font-semibold text-slate-100">{item.title}</h3>
                <p className="mt-1 flex-1 text-xs text-slate-300">{item.desc}</p>
                <Link
                  href={item.href}
                  className="mt-2 inline-flex min-h-9 w-fit items-center rounded-full border border-white/15 px-3 py-1.5 text-xs font-medium text-violet-100/85 transition hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-100"
                >
                  {item.cta}
                </Link>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
