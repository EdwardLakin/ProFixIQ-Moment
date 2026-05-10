import type { EmotionalStateLevel } from "@/features/moment/context/types";
import type { MomentBrainId } from "@/features/ai/brains/types";

export type SupportStyle = "calm_reflective" | "gentle_grounding" | "structured_reset" | "action_forward";
export type MomentThreadStatus = "active" | "paused" | "resolved";

export type MomentThread = {
  id: string;
  user_id: string;
  title: string;
  summary: string;
  primary_brain_id: MomentBrainId;
  support_style: SupportStyle;
  emotional_state: EmotionalStateLevel;
  status: MomentThreadStatus;
  last_activity_at: string;
  created_at: string;
  updated_at: string;
};

export type ContinuityCue = {
  threadId: string;
  prompt: string;
  confidence: "low" | "medium";
};
