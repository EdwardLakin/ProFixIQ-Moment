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

      <section className="relative mx-auto max-w-6xl space-y-10 md:space-y-12">
        <div className="relative overflow-hidden rounded-[2.2rem] bg-[radial-gradient(circle_at_20%_16%,rgba(196,181,253,0.28),transparent_52%),radial-gradient(circle_at_82%_12%,rgba(56,189,248,0.2),transparent_45%),linear-gradient(145deg,rgba(255,255,255,0.09),rgba(255,255,255,0.03)_48%,rgba(10,9,23,0.24))] p-6 shadow-[0_42px_130px_-60px_rgba(167,139,250,0.95),inset_0_1px_0_rgba(255,255,255,0.16)] sm:p-9 md:p-11">
          <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-white/18" />
          <div className="grid gap-9 lg:grid-cols-[1fr_1.05fr] lg:items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-violet-100/75 sm:text-sm">Moment by ProFixIQ</p>
              <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Open Moment. Check in. Get one tiny next step.
              </h1>
              <p className="mt-5 max-w-xl text-slate-200/90 sm:text-lg">
                When everything feels loud, Moment gives you one focused move you can do now.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {trustBadges.map((badge) => (
                  <span key={badge} className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-violet-50/95 ring-1 ring-white/12">
                    {badge}
                  </span>
                ))}
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href="/dashboard"
                  className="inline-flex min-h-12 items-center justify-center rounded-full bg-violet-100 px-6 py-3 text-sm font-semibold text-[#140f2a] shadow-[0_16px_42px_-20px_rgba(196,181,253,1)] transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-100 focus-visible:ring-offset-2 focus-visible:ring-offset-[#130f26]"
                >
                  Open Moment
                </Link>
                <Link
                  href="/onboarding"
                  className="inline-flex min-h-12 items-center justify-center rounded-full bg-white/8 px-6 py-3 text-sm font-medium text-violet-50/95 ring-1 ring-white/20 transition hover:bg-white/14 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-100"
                >
                  Start onboarding
                </Link>
              </div>
            </div>

            <article className="relative overflow-hidden rounded-[1.7rem] bg-[#120f26]/72 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.11),0_38px_110px_-64px_rgba(196,181,253,1)] ring-1 ring-white/8 backdrop-blur-md sm:p-6">
              <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-violet-300/25 blur-3xl" />
              <p className="text-xs uppercase tracking-[0.18em] text-violet-200/70">Live Moment surface</p>
              <div className="mt-4 space-y-4 rounded-2xl bg-white/[0.035] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:p-5">
                <div>
                  <p className="text-sm text-slate-100">What feels hardest right now?</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    {["Overwhelmed", "Can’t start", "Math feels impossible"].map((chip) => (
                      <span key={chip} className="rounded-full bg-white/11 px-3 py-1 text-slate-100 ring-1 ring-white/10">
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="inline-flex rounded-full bg-emerald-300/14 px-3 py-1 text-xs font-medium text-emerald-100 ring-1 ring-emerald-200/30">
                  Routed to: Math Reset
                </div>

                <p className="rounded-xl bg-black/28 p-3 text-sm font-medium text-white shadow-[0_14px_35px_-24px_rgba(52,211,153,0.95)] ring-1 ring-emerald-200/28">
                  Tiny next step: open the assignment and only read question one.
                </p>

                <div className="flex flex-wrap gap-2">
                  <button className="min-h-10 rounded-full bg-white/8 px-3.5 py-2 text-xs font-medium text-slate-100 ring-1 ring-white/18">
                    Break it down
                  </button>
                  <button className="min-h-10 rounded-full bg-violet-100 px-4 py-2 text-xs font-semibold text-[#130f2b]">Open Math Reset</button>
                </div>
              </div>
            </article>
          </div>
        </div>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold tracking-[0.06em] text-violet-100/72">When Moment routes the need</h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {routes.map((item) => (
              <article key={item.title} className="flex h-full flex-col rounded-xl bg-white/[0.02] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] ring-1 ring-white/7 transition hover:-translate-y-0.5 hover:bg-white/[0.035] hover:shadow-[0_16px_40px_-28px_rgba(129,140,248,0.9)]">
                <span className="inline-flex w-fit rounded-full bg-white/[0.045] px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-violet-100/70 ring-1 ring-white/10">
                  {item.badge}
                </span>
                <h3 className="mt-2 text-xs font-semibold text-slate-100">{item.title}</h3>
                <p className="mt-1 flex-1 text-[11px] text-slate-300/90">{item.desc}</p>
                <Link
                  href={item.href}
                  className="mt-2 inline-flex min-h-8 w-fit items-center rounded-full bg-white/[0.03] px-3 py-1.5 text-[11px] font-medium text-violet-100/80 ring-1 ring-white/12 transition hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-100"
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
