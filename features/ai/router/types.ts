import type { AgeRange, BrainAudience, BrainCategory, MomentBrainId } from "@/features/ai/brains/types";
import type { MomentRouteConfidence } from "@/features/ai/types";

export type UserAgeRange = AgeRange;

export type RouteMomentInput = {
  momentText: string;
  selectedSignals: string[];
  ageRange?: UserAgeRange;
  profileContext?: string;
  knownSupportNeeds?: string[];
  recentRouteHistory?: MomentBrainId[];
  supportStyle?: "calm_reflective" | "gentle_grounding" | "structured_reset" | "action_forward";
  followUpHistory?: { promptId: string; choiceId: string; choiceLabel: string }[];
  threadId?: string;
  sourceSurface?: string;
  suggestedIntent?: string;
  optionalBrainHint?: MomentBrainId;
  audienceHint?: "teen" | "adult" | "all";
};

export type RouteMomentResult = {
  primaryBrainId: MomentBrainId;
  supportingBrainIds: MomentBrainId[];
  routeLabel: string;
  routePath: string;
  confidence: MomentRouteConfidence;
  reason: string;
  audience: BrainAudience;
  category: BrainCategory;
};
