import Link from "next/link";

const routes = [
  {
    title: "Central check-in surface",
    badge: "Core route",
    desc: "Start with what feels heavy and get a single, specific next step.",
    cta: "Open check-in",
    href: "/dashboard",
  },
  {
    title: "Math reset",
    badge: "Math Reset",
    desc: "Defuse school overwhelm and re-enter the assignment with momentum.",
    cta: "Open Math Reset",
    href: "/math-reset",
  },
  {
    title: "Drama pause",
    badge: "Drama Pause",
    desc: "Pause escalation, name what matters, and choose clear boundaries.",
    cta: "Open Drama Pause",
    href: "/drama-pause",
  },
  {
    title: "Stuck mode",
    badge: "Stuck Mode",
    desc: "Turn avoidance loops into one action you can do right now.",
    cta: "Open Stuck Mode",
    href: "/stuck",
  },
  {
    title: "Parent insight, coming soon",
    badge: "Coming soon",
    desc: "Parent summaries focus on patterns and support, not surveillance.",
    cta: "Preview direction",
    href: "/parent",
  },
];

const trustBadges = ["Private by default", "Not therapy", "Built for tiny next steps"];

export default function HomePage() {
  return (
    <main className="moment-glow relative min-h-screen overflow-hidden px-6 py-10 text-[#f8f1e7]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[28rem] w-[38rem] -translate-x-1/2 rounded-full bg-violet-400/20 blur-3xl" />
        <div className="absolute -left-16 top-32 h-72 w-72 rounded-full bg-sky-400/10 blur-3xl" />
        <div className="absolute -right-10 bottom-20 h-72 w-72 rounded-full bg-fuchsia-400/10 blur-3xl" />
      </div>

      <section className="relative mx-auto max-w-6xl space-y-8">
        <div className="rounded-[2rem] border border-white/15 bg-gradient-to-br from-white/10 via-white/[0.07] to-transparent p-8 shadow-[0_20px_80px_-45px_rgba(167,139,250,0.9)] md:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-violet-100/80">Moment by ProFixIQ</p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">Small steps when everything feels too big.</h1>
              <p className="mt-4 max-w-2xl text-slate-200">
                Start with one check-in. Moment routes the overwhelm into the right reset.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {trustBadges.map((badge) => (
                  <span
                    key={badge}
                    className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-violet-50"
                  >
                    {badge}
                  </span>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/dashboard"
                  className="rounded-full bg-violet-200 px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_10px_35px_-15px_rgba(196,181,253,1)] transition hover:bg-violet-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-100"
                >
                  Open Moment
                </Link>
                <Link
                  href="/onboarding"
                  className="rounded-full border border-white/20 bg-white/5 px-5 py-3 text-sm font-medium text-violet-50 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-100"
                >
                  Start onboarding
                </Link>
              </div>
            </div>

            <article className="rounded-3xl border border-white/15 bg-[#120f26]/80 p-5 shadow-inner shadow-violet-500/10 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.18em] text-violet-200/70">Moment surface preview</p>
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-sm text-slate-100">What feels hardest right now?</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  {['Overwhelmed', "Can’t start", 'Math makes no sense'].map((chip) => (
                    <span key={chip} className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-slate-200">
                      {chip}
                    </span>
                  ))}
                </div>
                <div className="mt-4 inline-flex rounded-full border border-emerald-300/30 bg-emerald-300/10 px-3 py-1 text-xs font-medium text-emerald-100">
                  Route: Math Reset
                </div>
                <p className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-slate-200">
                  “First tiny step: open the assignment and only read question one.”
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button className="rounded-full border border-white/20 bg-white/5 px-3 py-2 text-xs font-medium text-slate-100">
                    Break it down
                  </button>
                  <button className="rounded-full bg-violet-200 px-3 py-2 text-xs font-semibold text-slate-950">
                    Open Math Reset
                  </button>
                </div>
              </div>
            </article>
          </div>
        </div>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight text-violet-50">Operating routes</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {routes.map((item) => (
              <article
                key={item.title}
                className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:-translate-y-0.5 hover:border-violet-200/40 hover:bg-white/[0.06] focus-within:border-violet-200/50"
              >
                <span className="inline-flex w-fit rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] uppercase tracking-[0.14em] text-violet-100/75">
                  {item.badge}
                </span>
                <h3 className="mt-3 font-semibold text-slate-50">{item.title}</h3>
                <p className="mt-2 flex-1 text-sm text-slate-300">{item.desc}</p>
                <Link
                  href={item.href}
                  className="mt-4 inline-flex w-fit rounded-full border border-violet-200/30 px-3 py-1.5 text-sm font-medium text-violet-100 transition hover:border-violet-100 hover:bg-violet-200/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-100"
                >
                  {item.cta}
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-xl font-semibold text-violet-50">How Moment works</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {[
              { step: '01', title: 'Check in', text: 'Name what feels hardest in plain language.' },
              { step: '02', title: 'Moment routes the need', text: 'The surface maps overwhelm to the right operating route.' },
              { step: '03', title: 'Take one tiny step', text: 'Leave with a concrete action you can do now.' },
            ].map((item) => (
              <article key={item.step} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <p className="text-xs font-medium tracking-[0.2em] text-violet-200/70">{item.step}</p>
                <h3 className="mt-2 font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-300">{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <article className="rounded-2xl border border-violet-200/20 bg-gradient-to-r from-violet-300/10 to-sky-300/5 p-6 text-sm text-slate-200">
          <p>
            Moment provides supportive coaching for overwhelmed moments, not therapy, diagnosis, or crisis counseling.
            Your check-ins are private by default. Parent summaries are designed around patterns and support rather than
            surveillance.
          </p>
        </article>
      </section>
    </main>
  );
}
