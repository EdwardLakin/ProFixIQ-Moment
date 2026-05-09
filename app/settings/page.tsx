import { MomentAppShell } from "@/components/moment/MomentAppShell";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function SettingsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const profileRows = user ? await supabase.from("profiles").select("id,full_name").eq("id", user.id).maybeSingle() : null;
  const fullName = profileRows?.data?.full_name;

  return (
    <MomentAppShell title="Settings" subtitle="Lightweight controls for profile, privacy, and safety.">
      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-3xl border border-white/10 bg-white/[0.03] p-5"><h2 className="text-lg font-medium">Profile</h2>{user ? <div className="mt-3 space-y-1 text-sm text-slate-300"><p>Email: {user.email}</p><p>Name: {fullName ?? "No profile name yet"}</p></div> : <p className="mt-3 text-sm text-slate-300">No profile data available yet.</p>}</article>
        <article className="rounded-3xl border border-white/10 bg-white/[0.03] p-5"><h2 className="text-lg font-medium">Privacy</h2><p className="mt-3 text-sm text-slate-300">Moment focuses on support patterns and minimal data collection needed to run guided resets.</p></article>
        <article className="rounded-3xl border border-white/10 bg-white/[0.03] p-5"><h2 className="text-lg font-medium">Guardian access</h2><p className="mt-3 text-sm text-slate-300">Guardian summaries are opt-in and based on trends rather than full message history.</p></article>
        <article className="rounded-3xl border border-white/10 bg-white/[0.03] p-5"><h2 className="text-lg font-medium">Data & export</h2><p className="mt-3 text-sm text-slate-300">Export tooling is planned. You will be able to request a portable summary of your data.</p></article>
        <article className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 md:col-span-2"><h2 className="text-lg font-medium">Safety note</h2><p className="mt-3 text-sm text-slate-300">Moment is for operational support in stressful moments and is not a replacement for emergency or clinical care.</p></article>
      </section>
    </MomentAppShell>
  );
}
