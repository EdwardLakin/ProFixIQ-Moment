import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const schema = z.object({
  action: z.enum(["accept_suggestion", "dismiss_suggestion", "hide_tiny_win", "pause_thread", "resume_thread", "archive_goal"]),
  id: z.string().uuid(),
});

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { action, id } = parsed.data;

  if (action === "accept_suggestion" || action === "dismiss_suggestion") {
    const status = action === "accept_suggestion" ? "accepted" : "dismissed";
    const { error } = await supabase.from("moment_suggestions").update({ status }).eq("id", id).eq("user_id", user.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (action === "hide_tiny_win") await supabase.from("moment_tiny_wins").update({ status: "hidden" }).eq("id", id).eq("user_id", user.id);
  if (action === "pause_thread") await supabase.from("moment_threads").update({ status: "paused" }).eq("id", id).eq("user_id", user.id);
  if (action === "resume_thread") await supabase.from("moment_threads").update({ status: "active" }).eq("id", id).eq("user_id", user.id);
  if (action === "archive_goal") await supabase.from("moment_goals").update({ status: "archived" }).eq("id", id).eq("user_id", user.id);

  return NextResponse.json({ ok: true });
}
