import { MomentAppShell } from "@/components/moment/MomentAppShell";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAuthenticatedUser } from "@/lib/auth";
import { MomentButton } from "@/components/moment/MomentButton";

async function createManualJournalEntry(formData: FormData) {
  "use server";
  const user = await requireAuthenticatedUser("/dashboard/journal");
  const supabase = await createSupabaseServerClient();
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  if (!content) return;
  await supabase.from("moment_entries").insert({ user_id: user.id, source: "manual", entry_date: new Date().toISOString().slice(0,10), title: title || null, content, input_summary: content.slice(0, 280), ai_context_allowed_snapshot: false });
}

export default async function JournalPage(){
  const user = await requireAuthenticatedUser("/dashboard/journal");
  const supabase = await createSupabaseServerClient();
  const { data: rows } = await supabase.from("moment_entries").select("id,source,entry_date,title,content,input_summary,created_at").eq("user_id", user.id).is("deleted_at", null).order("entry_date", { ascending: false }).order("created_at", { ascending: false }).limit(200);
  const byDate = new Map<string, typeof rows>();
  for (const row of rows ?? []) { const key = row.entry_date ?? row.created_at.slice(0,10); byDate.set(key, [...(byDate.get(key) ?? []), row]); }
  return <MomentAppShell title="Journal" subtitle="Private storage for your Moment history.">
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-300">Moment only uses journal context if you allow it in Settings.</section>
    <section className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4"><h2 className="text-lg">Add entry</h2><form action={createManualJournalEntry} className="mt-3 grid gap-3"><input name="title" placeholder="Title (optional)" className="rounded-xl border border-white/15 bg-[#202a40] p-3"/><textarea name="content" required rows={4} placeholder="Write what you want to remember..." className="rounded-xl border border-white/15 bg-[#202a40] p-3" /><div><MomentButton type="submit">Save entry</MomentButton></div></form></section>
    <section className="mt-4 space-y-4"><div className="text-xs text-slate-300">Filters: All / Manual / Moments</div>{(rows??[]).length===0?<p className="rounded-xl bg-white/[0.03] p-4 text-slate-300">No entries yet. Your conversations and manual notes will appear here.</p>:Array.from(byDate.entries()).map(([date, entries])=><article key={date} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"><h3 className="text-sm font-medium">{date}</h3><ul className="mt-2 space-y-2">{entries?.map((entry)=><li key={entry.id} className="rounded-xl bg-black/20 p-3"><p className="text-xs uppercase text-slate-400">{entry.source === "manual" ? "Manual" : "Moment"}</p><p className="text-sm text-slate-100">{entry.title ?? entry.input_summary}</p>{entry.content ? <p className="mt-1 text-sm text-slate-300 whitespace-pre-wrap">{entry.content}</p> : null}</li>)}</ul></article>)}</section>
  </MomentAppShell>
}
