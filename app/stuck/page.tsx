import { redirect } from "next/navigation";
import { MomentPageHeader } from "@/components/moment/MomentPageHeader";
import { MomentShell } from "@/components/moment/MomentShell";
import { StuckClient } from "@/features/stuck/StuckClient";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function StuckPage({ searchParams }: { searchParams: { from?: string; contextId?: string; summary?: string } }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: sessions } = await supabase.from("moment_stuck_sessions").select("id,task_text,status").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5);

  return (
    <MomentShell>
      <section className="mx-auto max-w-3xl">
        <MomentPageHeader eyebrow="I’m Stuck" title="Let’s find a gentle next step" subtitle="Support for getting unstuck. Not therapy or crisis care." />
        <StuckClient sessions={sessions ?? []} searchParams={searchParams} />
      </section>
    </MomentShell>
  );
}
