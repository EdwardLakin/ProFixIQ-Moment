import type { MomentRouteResult } from "@/features/ai/types";

export function MomentRouteBadge({ route }: { route: MomentRouteResult }) {
  return <p className="inline-flex rounded-full bg-blue-200/20 px-3 py-1 text-xs text-blue-100">Route: {route.reason} ({route.confidence})</p>;
}
