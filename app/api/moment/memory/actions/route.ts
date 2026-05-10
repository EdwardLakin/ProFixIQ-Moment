import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireMomentFeature } from "@/lib/entitlements";

const schema = z.object({
  action: z.enum(["accept_suggestion", "dismiss_suggestion", "hide_tiny_win", "pause_thread", "resume_thread", "archive_goal", "pause_goal", "resume_goal", "mark_goal_progress", "mark_goal_struggling"]),
  id: z.string().uuid(),
});

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await request.json());

  if (["archive_goal", "pause_goal", "resume_goal", "mark_goal_progress", "mark_goal_struggling"].includes(parsed.success ? parsed.data.action : "")) {
    const gated = await requireMomentFeature("goals");
    if (!gated.ok) return NextResponse.json(gated.response, { status: gated.status });
  }
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
  if (action === "pause_goal") await supabase.from("moment_goals").update({ status: "paused" }).eq("id", id).eq("user_id", user.id);
  if (action === "resume_goal") await supabase.from("moment_goals").update({ status: "active" }).eq("id", id).eq("user_id", user.id);
  if (action === "mark_goal_progress") await supabase.from("moment_goals").update({ status: "gently_progressing" }).eq("id", id).eq("user_id", user.id);
  if (action === "mark_goal_struggling") await supabase.from("moment_goals").update({ status: "struggling" }).eq("id", id).eq("user_id", user.id);

  return NextResponse.json({ ok: true });
}

