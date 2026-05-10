import type { MomentCheckInResponse, MomentRouteResult } from "@/features/ai/types";
import type { MomentMemorySnapshot } from "@/features/moment/memory/types";

export type CheckInResult = {
  route: MomentRouteResult;
  response: MomentCheckInResponse;
};

export type DashboardState = {
  memory: MomentMemorySnapshot;
  result: CheckInResult | null;
  continuitySummary: string | null;
  continuityCue: string | null;
};
