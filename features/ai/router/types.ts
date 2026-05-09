import type { BrainAudience, BrainCategory, MomentBrainId } from "@/features/ai/brains/types";

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
  confidence: number;
  reason: string;
  audience: BrainAudience;
  category: BrainCategory;
};
