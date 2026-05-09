"use client";

import { useMemo } from "react";
import { useMomentEnvironment } from "@/features/moment/context/hooks";
import { motionTokens } from "@/features/ui/momentTheme";

type Props = { searchParams?: { contextId?: string; summary?: string; from?: string } };

export function CarriedContextCard({ searchParams }: Props) {
  const env = useMomentEnvironment();
  const carried = useMemo(() => {
    if (searchParams?.contextId || searchParams?.summary) {
      return {
        contextId: searchParams.contextId ?? "external",
        summary: searchParams.summary ?? "",
        sourceRoute: searchParams.from ?? "check-in",
      };
    }
    if (!env.state.activeRecoveryContext?.active) return null;
    return env.state.activeRecoveryContext;
  }, [env.state.activeRecoveryContext, searchParams]);

  if (!carried?.summary) return <div className={`rounded-2xl border border-white/10 bg-white/[0.02] p-4 ${motionTokens.cardTransition}`}><p className="text-sm text-slate-300">No carried context yet. Start from what feels most present right now.</p></div>;
  return (
    <div className={`rounded-2xl border border-violet-300/25 bg-violet-500/10 p-4 ${motionTokens.cardTransition}`}>
      <p className="text-xs uppercase tracking-[0.16em] text-violet-200/80">Carried from check-in</p>
      <p className="mt-2 text-sm text-slate-200">{carried.summary}</p>
      <p className="mt-2 text-xs text-slate-400">Source: {searchParams?.from ?? carried.sourceRoute}</p>
    </div>
  );
}
