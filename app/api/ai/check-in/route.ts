import { NextResponse } from "next/server";
import { z } from "zod";
import { runMomentOrchestrator } from "@/features/ai/orchestration/runMomentOrchestrator";
import { detectSupportRisk } from "@/features/safety";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const schema = z.object({ text: z.string().min(3), selectedStates: z.array(z.string()).default([]), ageRange: z.enum(["under_13", "13_15", "16_17", "18_plus"]).optional() });

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const risk = detectSupportRisk(`${parsed.data.text} ${parsed.data.selectedStates.join(" ")}`);
  const result = runMomentOrchestrator({ momentText: parsed.data.text, selectedSignals: parsed.data.selectedStates, ageRange: parsed.data.ageRange });
  const warnings = [...result.warnings];
  if (risk.severity === "high" && !warnings.length) warnings.push("High-severity safety signals detected. Show safety support first.");

  return NextResponse.json({ route: result.route, response: result.response, warnings });
}
