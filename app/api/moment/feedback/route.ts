import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const schema = z.object({
  threadId: z.string().optional(),
  routeId: z.string().optional(),
  signal: z.enum(["helpful", "too_much", "not_helpful", "needed_more_support", "needed_less_advice"]),
  pacingMismatch: z.boolean().default(false),
  overprompting: z.boolean().default(false),
});

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  await supabase.from("moment_support_feedback").insert({ user_id: user.id, thread_id: parsed.data.threadId ?? null, route_id: parsed.data.routeId ?? null, signal: parsed.data.signal, pacing_mismatch: parsed.data.pacingMismatch, overprompting_signal: parsed.data.overprompting });
  return NextResponse.json({ ok: true });
}
