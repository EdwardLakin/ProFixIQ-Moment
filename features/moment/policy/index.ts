import { detectSupportRisk } from "@/features/safety";

export function resolveAudiencePolicy(ageRange?: "under_13" | "13_15" | "16_17" | "18_plus") {
  if (!ageRange) return { audience: "all", isMinor: false };
  return { audience: ageRange === "18_plus" ? "adult" : "teen", isMinor: ageRange !== "18_plus" };
}

export function applyRouteSafetyFilters(input: string) {
  const risk = detectSupportRisk(input);
  return {
    risk,
    deny: risk.severity === "high",
    transform: risk.severity === "medium",
  };
}

export function escalationCopy(isMinor: boolean) {
  return isMinor ? "Please reach out to a trusted adult right now." : "Please reach out to trusted in-person support right now.";
}
