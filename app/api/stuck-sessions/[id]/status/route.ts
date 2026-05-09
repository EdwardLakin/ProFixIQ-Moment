import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const statusSchema = z.object({ status: z.enum(["started", "still_stuck", "done"]) });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = statusSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  await supabase.from("moment_stuck_sessions").update({ status: parsed.data.status }).eq("id", id).eq("user_id", user.id);
  return NextResponse.json({ ok: true });
}
