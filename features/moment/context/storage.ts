import type { MomentEnvironmentState } from "@/features/moment/context/types";

const STORAGE_KEY = "moment.environment.v1";

export const defaultEnvironmentState: MomentEnvironmentState = {
  recentRoutePatterns: [],
  unresolvedLoops: [],
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
}
