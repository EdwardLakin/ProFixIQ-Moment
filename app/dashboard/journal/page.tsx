import { MomentAppShell } from "@/components/moment/MomentAppShell";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAuthenticatedUser } from "@/lib/auth";
import { MomentButton } from "@/components/moment/MomentButton";
import { revalidatePath } from "next/cache";
import { JournalExperience } from "./JournalExperience";

async function createManualJournalEntry(formData: FormData) {
  "use server";
  const user = await requireAuthenticatedUser("/dashboard/journal");
  const supabase = await createSupabaseServerClient();
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  if (!content) return;
  await supabase.from("moment_entries").insert({ user_id: user.id, source: "manual", entry_date: new Date().toISOString().slice(0, 10), title: title || null, content, input_summary: content.slice(0, 280), ai_context_allowed_snapshot: false });
  revalidatePath("/dashboard/journal");
}

async function archiveJournalEntry(formData: FormData) {
  "use server";
  const user = await requireAuthenticatedUser("/dashboard/journal");
  const supabase = await createSupabaseServerClient();
  const entryId = String(formData.get("entryId") ?? "").trim();
  if (!entryId) return;
  await supabase.from("moment_entries").update({ deleted_at: new Date().toISOString() }).eq("id", entryId).eq("user_id", user.id).is("deleted_at", null);
  revalidatePath("/dashboard/journal");
}

export default async function JournalPage() {
  const user = await requireAuthenticatedUser("/dashboard/journal");
  const supabase = await createSupabaseServerClient();
  const { data: rows } = await supabase.from("moment_entries").select("id,source,entry_date,title,content,input_summary,created_at").eq("user_id", user.id).is("deleted_at", null).order("entry_date", { ascending: false }).order("created_at", { ascending: false }).limit(200);
  return <MomentAppShell title="Journal" subtitle="Private memory for your Moment history.">
    <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 text-sm text-slate-300">
      <p className="text-slate-100">Private memory for your Moment history.</p>
      <p className="mt-2 text-xs text-slate-400">Moment can only read this if you allow journal context in Settings.</p>
    </section>
    <section className="mt-4 rounded-3xl border border-white/10 bg-[linear-gradient(155deg,rgba(255,255,255,0.05),rgba(255,255,255,0.01))] p-5">
      <h2 className="text-lg font-medium text-slate-100">Add a private note</h2>
      <p className="mt-1 text-xs text-slate-400">Manual notes are saved privately. Moment will only use them as context if you enable journal context.</p>
      <form action={createManualJournalEntry} className="mt-4 grid gap-3">
        <input name="title" placeholder="Optional title" className="rounded-xl border border-white/15 bg-[#202a40] p-3 text-sm text-slate-100 placeholder:text-slate-400" />
        <textarea name="content" required rows={6} placeholder="Write what you want to remember..." className="rounded-2xl border border-white/15 bg-[#202a40] p-3 text-sm text-slate-100 placeholder:text-slate-400" />
        <div><MomentButton type="submit">Save to journal</MomentButton></div>
      </form>
    </section>
    <JournalExperience rows={rows ?? []} archiveAction={archiveJournalEntry} />
  </MomentAppShell>;
}
