import type { MomentEnvironmentState } from "@/features/moment/context/types";
import { syncEnvironmentState } from "@/features/moment/context/syncAdapter";

const STORAGE_KEY = "moment.environment.v1";

export const defaultEnvironmentState: MomentEnvironmentState = {
  recentRoutePatterns: [],
  unresolvedLoops: [],
  emotionalRhythmHints: [],
  supportTimingState: { mode: "normal" },
  futureSignals: {
    emotionalSeasonAwareness: true,
    supportExhaustionAwareness: true,
    adaptiveContinuationPacing: true,
    longTermSupportMemory: true,
    supportStylePersistence: true,
  },
};

export function readEnvironmentState(): MomentEnvironmentState {
  if (typeof window === "undefined") return defaultEnvironmentState;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultEnvironmentState;
  try {
    return { ...defaultEnvironmentState, ...JSON.parse(raw) } as MomentEnvironmentState;
  } catch {
    return defaultEnvironmentState;
  }
}

export function writeEnvironmentState(state: MomentEnvironmentState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  void syncEnvironmentState(state).then((result) => {
    if (result.status === "synced" && result.merged) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(result.merged));
    }
  });
}
