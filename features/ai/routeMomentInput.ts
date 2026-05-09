import { routeMoment } from "@/features/ai/router/routeMoment";
import type { RouteMomentInput } from "@/features/ai/router/types";

export function routeMomentInput(input: { text: string; selectedStates: string[]; ageRange?: RouteMomentInput["ageRange"]; knownSupportNeeds?: string[]; recentRouteHistory?: string[] }) {
  return routeMoment({
    momentText: input.text,
    selectedSignals: input.selectedStates,
    ageRange: input.ageRange,
    knownSupportNeeds: input.knownSupportNeeds,
    recentRouteHistory: input.recentRouteHistory as RouteMomentInput["recentRouteHistory"],
  });
}
