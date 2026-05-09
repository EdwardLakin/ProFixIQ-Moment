import Link from "next/link";
import { redirect } from "next/navigation";
import { MomentButton } from "@/components/moment/MomentButton";
import { MomentCard } from "@/components/moment/MomentCard";
import { MomentPageHeader } from "@/components/moment/MomentPageHeader";
import { MomentShell } from "@/components/moment/MomentShell";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const actions = [
  { href: "/stuck", label: "I’m Stuck" },
  { href: "/check-in", label: "Check In" },
  { href: "/drama-pause", label: "Drama Pause" },
  { href: "/math-reset", label: "Math Reset" },
  { href: "/parent", label: "Parent Insights" },
  { href: "/settings", label: "Settings" },
];

async function signOut() {
  "use server";
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/sign-in");
}

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: profile } = await supabase.from("moment_profiles").select("onboarding_complete").eq("user_id", user.id).maybeSingle();
  if (!profile?.onboarding_complete) redirect("/onboarding");

  return (
    <MomentShell>
      <section className="mx-auto max-w-5xl">
        <MomentPageHeader eyebrow="Moment dashboard" title="What do you need right now?" action={<form action={signOut}><MomentButton type="submit">Sign out</MomentButton></form>} />
        <div className="grid gap-4 md:grid-cols-2">
          {actions.map((action) => (
            <Link key={action.href} href={action.href}><MomentCard><h2 className="text-xl font-semibold">{action.label}</h2></MomentCard></Link>
          ))}
        </div>
      </section>
    </MomentShell>
  );
}
