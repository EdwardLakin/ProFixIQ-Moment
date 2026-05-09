export type EmotionalStateLevel = "steady" | "overloaded" | "shutdown" | "social_pressure" | "school_overwhelm";

export type UnresolvedLoop = {
  id: string;
  label: string;
  routePath: string;
  tinyStep?: string;
  updatedAt: string;
};

export type RoutePattern = {
  from: string;
  to: string;
  at: string;
};

export type RecoveryContext = {
  contextId: string;
  summary: string;
  sourceRoute: string;
  active: boolean;
};

export type MomentEnvironmentState = {
  recentEmotionalState?: EmotionalStateLevel;
  recentRoutePatterns: RoutePattern[];
  unresolvedLoops: UnresolvedLoop[];
  lastSuccessfulRestart?: string;
  activeRecoveryContext?: RecoveryContext;
};
