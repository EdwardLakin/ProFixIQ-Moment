import Link from "next/link";

const actions = [
  { href: "/stuck", label: "I’m stuck", detail: "Turn overwhelm into one tiny next step." },
  { href: "/check-in", label: "Check in", detail: "Name what is happening without pressure." },
  { href: "/drama-pause", label: "Drama pause", detail: "Slow down before jumping into conflict." },
  { href: "/math-reset", label: "Math reset", detail: "Restart when school work feels confusing." }
];

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-[#0b1020] px-6 py-8 text-[#f8f1e7]">
      <section className="mx-auto max-w-5xl">
        <p className="text-sm uppercase tracking-[0.28em] text-violet-200/70">
          Moment dashboard
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">
          What do you need right now?
        </h1>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {actions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5 transition hover:bg-white/[0.07]"
            >
              <h2 className="text-xl font-semibold">{action.label}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">{action.detail}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
