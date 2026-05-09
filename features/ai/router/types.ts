import type { BrainAudience, BrainCategory, MomentBrainId } from "@/features/ai/brains/types";
import type { MomentRouteConfidence } from "@/features/ai/types";

export type UserAgeRange = "under_13" | "13_15" | "16_17" | "18_plus";

export type RouteMomentInput = {
  momentText: string;
  selectedSignals: string[];
  ageRange?: UserAgeRange;
  profileContext?: string;
  knownSupportNeeds?: string[];
  recentRouteHistory?: MomentBrainId[];
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
