import type { MomentCheckInResponse, MomentRouteResult } from "@/features/ai/types";

export type MemorySource = "user_created" | "ai_suggested" | "system_detected";
export type SuggestionStatus = "suggested" | "accepted" | "dismissed" | "archived";
export type TinyWinStatus = "recorded" | "hidden";

export type MomentMemoryArtifacts = {
  entry: {
    source: MemorySource;
    inputSummary: string;
    emotionalState: string | null;
    supportStyle: string | null;
    primaryBrainId: string;
    supportingBrainIds: string[];
    routeLabel: string;
    routeCategory: string;
    routeAudience: string;
    responseSummary: string;
    tinyNextStep: string;
  };
  suggestions: Array<{ source: MemorySource; suggestionText: string; status: SuggestionStatus }>;
  tinyWin: { source: MemorySource; winNote: string; status: TinyWinStatus } | null;
};

export type ExtractMemoryArtifactsInput = {
  userText: string;
  selectedStates: string[];
  route: MomentRouteResult;
  response: MomentCheckInResponse;
  supportStyle?: string;
  riskSeverity?: "low" | "medium" | "high";
  ageRange?: "under_13" | "13_15" | "16_17" | "18_plus";
};
