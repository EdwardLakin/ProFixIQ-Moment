"use client";

import { useEffect, useMemo, useState } from "react";
import { defaultEnvironmentState, readEnvironmentState, writeEnvironmentState } from "@/features/moment/context/storage";
import type { MomentEnvironmentState, UnresolvedLoop } from "@/features/moment/context/types";

export function useMomentEnvironment() {
  const [state, setState] = useState<MomentEnvironmentState>(defaultEnvironmentState);

  useEffect(() => {
    setState(readEnvironmentState());
  }, []);

  useEffect(() => {
    writeEnvironmentState(state);
  }, [state]);

  const actions = useMemo(() => ({
    setEmotionalState: (recentEmotionalState: MomentEnvironmentState["recentEmotionalState"]) =>
      setState((curr) => ({ ...curr, recentEmotionalState })),
    trackRoute: (from: string, to: string) =>
      setState((curr) => ({ ...curr, recentRoutePatterns: [{ from, to, at: new Date().toISOString() }, ...curr.recentRoutePatterns].slice(0, 12) })),
    setSuccessfulRestart: () => setState((curr) => ({ ...curr, lastSuccessfulRestart: new Date().toISOString() })),
    upsertLoop: (loop: UnresolvedLoop) =>
      setState((curr) => ({ ...curr, unresolvedLoops: [loop, ...curr.unresolvedLoops.filter((it) => it.id !== loop.id)].slice(0, 8) })),
    setRecoveryContext: (summary: string, sourceRoute: string) =>
      setState((curr) => ({ ...curr, activeRecoveryContext: { contextId: crypto.randomUUID(), summary, sourceRoute, active: true } })),
  }), []);

  return { state, ...actions };
}

export function useRecentMomentum(state: MomentEnvironmentState) {
  return {
    hasRestartToday: state.lastSuccessfulRestart ? new Date(state.lastSuccessfulRestart).toDateString() === new Date().toDateString() : false,
    unfinishedCount: state.unresolvedLoops.length,
    latestStep: state.unresolvedLoops[0]?.tinyStep,
  };
}

export function useRecoveryState(state: MomentEnvironmentState) {
  return {
    active: Boolean(state.activeRecoveryContext?.active),
    summary: state.activeRecoveryContext?.summary,
    sourceRoute: state.activeRecoveryContext?.sourceRoute,
  };
}
