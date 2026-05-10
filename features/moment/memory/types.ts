import type { MomentCheckInResponse, MomentRouteResult } from "@/features/ai/types";

export type MemorySource = "user_created" | "ai_suggested" | "system_detected";
export type SuggestionStatus = "suggested" | "accepted" | "dismissed" | "archived";
export type TinyWinStatus = "recorded" | "hidden";
export type GoalStatus = "active" | "paused" | "gently_progressing" | "struggling" | "completed" | "archived";

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
  goalSuggestions: Array<{ source: MemorySource; title: string; detail: string; status: GoalStatus }>;
  tinyWin: { source: MemorySource; winNote: string; status: TinyWinStatus } | null;
  supportEffectiveness: {
    supportStyle: string;
    acceptedSuggestion: boolean;
    returnedToThread: boolean;
    tinyStepCompleted: boolean;
    continuationEngaged: boolean;
    outcomeNote: string;
  };
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

export type MomentMemorySnapshot = {
  entries: Array<{ id: string; inputSummary: string; emotionalState: string | null; tinyNextStep: string | null; createdAt: string }>;
  threads: Array<{ id: string; title: string; summary: string; status: "active" | "paused"; lastActivityAt: string }>;
  goals: Array<{ id: string; title: string; detail: string | null; status: GoalStatus; updatedAt: string }>;
  tinyWins: Array<{ id: string; winNote: string; status: TinyWinStatus; createdAt: string }>;
  suggestions: Array<{ id: string; suggestionText: string; status: SuggestionStatus; createdAt: string }>;
  supportPatterns: Array<{ id: string; summary: string; supportFocus: string; recurrenceCount: number; updatedAt: string }>;
  supportEffectivenessNotes: Array<{ id: string; supportStyle: string; outcomeNote: string; createdAt: string }>;
};
