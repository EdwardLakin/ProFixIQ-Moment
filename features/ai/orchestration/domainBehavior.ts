import type { RouteMomentInput } from "@/features/ai/router/types";
import type { MomentBrainId } from "@/features/ai/brains/types";

export type ResponseDomain = "grief_loss" | "tutor" | "stuck_avoidance" | "conflict" | "general_overwhelm" | "loneliness" | "safety" | "general";

export type DomainBehavior = {
  domain: ResponseDomain;
  emotionalTemperature: "high" | "medium" | "steady";
  guidanceTiming: "presence_first" | "quick_validate_then_tutor" | "validate_then_decompose" | "validate_then_slow_reaction" | "calm_then_prioritize" | "safety_first";
  responseLength: "short" | "medium";
  askFollowUp: boolean;
  offerTool: boolean;
  tutorMode: boolean;
  avoidAdviceFirst: boolean;
  bannedPhrases: string[];
};

const TUTOR_TOKENS = ["math", "homework", "science", "tutor", "study", "studying", "test", "quiz", "grade", "problem", "topic", "class", "teacher", "essay", "writing", "i don't understand", "i dont understand", "feel stupid"];

const hasAny = (text: string, terms: string[]) => terms.some((term) => text.includes(term));

export function classifyResponseDomain(input: RouteMomentInput, routeId: MomentBrainId): ResponseDomain {
  const normalized = `${input.momentText} ${input.selectedSignals.join(" ")}`.toLowerCase();
  if (routeId === "safety_support_brain") return "safety";
  if (routeId === "grief_support_brain" || hasAny(normalized, ["died", "death", "passed away", "grief", "loss", "miss her", "miss him", "moms"])) return "grief_loss";
  if (routeId === "tutor_brain" || hasAny(normalized, TUTOR_TOKENS)) return "tutor";
  if (routeId === "task_start_brain" || hasAny(normalized, ["avoid", "procrast", "can't start", "cannot start", "stuck"])) return "stuck_avoidance";
  if (routeId === "social_boundary_brain" || hasAny(normalized, ["friend", "left me out", "text something mean", "conflict", "group chat", "hurt"])) return "conflict";
  if (routeId === "loneliness_support_brain" || hasAny(normalized, ["lonely", "alone", "isolated"])) return "loneliness";
  if (routeId === "overwhelm_grounding_brain" || hasAny(normalized, ["overwhelmed", "too much", "spiral", "flooded"])) return "general_overwhelm";
  return "general";
}

export function behaviorForDomain(domain: ResponseDomain): DomainBehavior {
  const banned = [
    "we can stay with this",
    "we can slow this down",
    "before we do anything with it",
    "adjust as your needs change",
    "this carries a lot of weight",
    "deep, personal way",
    "what feels heaviest",
    "no pressure to reply right away",
    "saved quietly",
  ];

  switch (domain) {
    case "grief_loss":
      return { domain, emotionalTemperature: "high", guidanceTiming: "presence_first", responseLength: "medium", askFollowUp: true, offerTool: false, tutorMode: false, avoidAdviceFirst: true, bannedPhrases: banned };
    case "tutor":
      return { domain, emotionalTemperature: "steady", guidanceTiming: "quick_validate_then_tutor", responseLength: "short", askFollowUp: true, offerTool: false, tutorMode: true, avoidAdviceFirst: false, bannedPhrases: banned };
    case "stuck_avoidance":
      return { domain, emotionalTemperature: "medium", guidanceTiming: "validate_then_decompose", responseLength: "short", askFollowUp: true, offerTool: true, tutorMode: false, avoidAdviceFirst: false, bannedPhrases: banned };
    case "conflict":
      return { domain, emotionalTemperature: "medium", guidanceTiming: "validate_then_slow_reaction", responseLength: "short", askFollowUp: true, offerTool: true, tutorMode: false, avoidAdviceFirst: false, bannedPhrases: banned };
    case "general_overwhelm":
      return { domain, emotionalTemperature: "steady", guidanceTiming: "calm_then_prioritize", responseLength: "short", askFollowUp: true, offerTool: true, tutorMode: false, avoidAdviceFirst: false, bannedPhrases: banned };
    case "safety":
      return { domain, emotionalTemperature: "steady", guidanceTiming: "safety_first", responseLength: "short", askFollowUp: false, offerTool: false, tutorMode: false, avoidAdviceFirst: false, bannedPhrases: banned };
    default:
      return { domain, emotionalTemperature: "medium", guidanceTiming: "calm_then_prioritize", responseLength: "short", askFollowUp: true, offerTool: true, tutorMode: false, avoidAdviceFirst: false, bannedPhrases: banned };
  }
}
