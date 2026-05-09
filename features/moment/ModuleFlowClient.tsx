"use client";
import Link from "next/link";
import { useState } from "react";
import { CarriedContextCard } from "@/components/moment/CarriedContextCard";
import { MomentButton } from "@/components/moment/MomentButton";
import { MomentCard } from "@/components/moment/MomentCard";
import { MomentInput } from "@/components/moment/MomentInput";
import { MomentStateChip } from "@/components/moment/MomentStateChip";
import { MomentTextarea } from "@/components/moment/MomentTextarea";
import { MomentumBuilderBlock } from "@/components/moment/MomentumBuilderBlock";
import { RecoveryPromptBlock } from "@/components/moment/RecoveryPromptBlock";
import { RouteTransitionBlock } from "@/components/moment/RouteTransitionBlock";
import type { MomentCheckInResponse } from "@/features/ai/types";
import { useMomentEnvironment } from "@/features/moment/context/hooks";

type FieldConfig = { name: string; label: string; area?: boolean; chipOptions?: string[] };

export function ModuleFlowClient({ searchParams, apiPath, fields, title }: { searchParams?: { from?: string; contextId?: string; summary?: string }; apiPath: string; fields: FieldConfig[]; title: string }) {
  const [result, setResult] = useState<MomentCheckInResponse | null>(null);
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const env = useMomentEnvironment();
  async function onSubmit(formData: FormData) {
    const body: Record<string, string | string[]> = Object.fromEntries(formData.entries()) as Record<string, string>;
    if (fields.some((field) => field.name === "selectedStates" && field.chipOptions)) body.selectedStates = selectedStates;
    if (typeof body.selectedStates === "string") body.selectedStates = body.selectedStates.split(",").map((value) => value.trim()).filter(Boolean);
    const res = await fetch(apiPath, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!res.ok) return;
    const data = await res.json() as { response: MomentCheckInResponse };
    setResult(data.response);
    env.trackRoute("check-in", apiPath.replace("/api/ai", ""));
    env.setRecoveryContext(data.response.reflection, title);
    env.upsertLoop({ id: `${title}-${Date.now()}`, label: title, routePath: apiPath, tinyStep: data.response.tinyNextStep, updatedAt: new Date().toISOString() });
    env.setSuccessfulRestart();
  }

  return <div className="space-y-4"><CarriedContextCard searchParams={searchParams} /><MomentCard><form action={onSubmit} className="space-y-3">{fields.map((field) => {
    if (field.chipOptions) {
      return <div key={field.name} className="space-y-2"><p className="text-sm text-slate-300">{field.label}</p><div className="flex flex-wrap gap-2">{field.chipOptions.map((chip) => <MomentStateChip key={chip} label={chip} selected={selectedStates.includes(chip)} onClick={() => setSelectedStates((curr) => curr.includes(chip) ? curr.filter((value) => value !== chip) : [...curr, chip])} />)}</div></div>;
    }
    return field.area ? <MomentTextarea key={field.name} name={field.name} required={field.name.includes("text")} placeholder={field.label} defaultValue={field.name.includes("text") ? (searchParams?.summary ?? "") : ""} /> : <MomentInput key={field.name} name={field.name} placeholder={field.label} />;
  })}<MomentButton type="submit">Get guided reset</MomentButton></form></MomentCard>{result ? <MomentCard><div className="space-y-3">{result.blocks?.map((block, i) => block.type === "momentum_builder" ? <MomentumBuilderBlock key={i} text={block.text} /> : block.type === "route_transition" ? <RouteTransitionBlock key={i} text={block.text} /> : <RecoveryPromptBlock key={i} text={block.text} />)}</div><Link href="/dashboard" className="mt-4 inline-flex rounded-full border border-white/15 px-4 py-2 text-sm">Return to Moment</Link></MomentCard> : null}</div>;
}
