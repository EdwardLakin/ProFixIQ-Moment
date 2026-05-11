import type { RouteMomentInput } from "@/features/ai/router/types";

export type EmotionalTheme = "grief" | "shame" | "loneliness" | "overwhelm" | "fear_of_failure" | "comparison_pain" | "self_criticism" | "hopelessness" | "emotional_exhaustion" | "avoidance" | "relational_pain";
export type EmotionalContradiction = "wants_connection_but_withdraws" | "wants_progress_but_avoids" | "needs_rest_but_self_pushes" | "asks_help_but_masks_pain";
export type EmotionalWeight = "light" | "moderate" | "heavy" | "acute";
export type FragilityLevel = "low" | "guarded" | "fragile" | "raw";

export type EmotionalCognition = {
  themes: EmotionalTheme[];
  contradictions: EmotionalContradiction[];
  unmetNeeds: string[];
  attachmentSignals: string[];
  emotionalTension: string[];
  relationalPain: string[];
  stressSources: string[];
  escalationRisk: "low" | "watch" | "elevated";
  fragilityLevel: FragilityLevel;
  exhaustionLevel: "low" | "moderate" | "high";
  isolationLevel: "low" | "moderate" | "high";
  maskingSignals: string[];
  connectionBids: string[];
  subtext: string[];
  emotionalWeight: EmotionalWeight;
};

function includesAny(text: string, patterns: string[]) {
  return patterns.some((pattern) => text.includes(pattern));
}

function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}

export function buildEmotionalCognition(input: RouteMomentInput): EmotionalCognition {
  const normalized = `${input.momentText} ${input.selectedSignals.join(" ")} ${(input.knownSupportNeeds ?? []).join(" ")} ${(input.followUpHistory ?? []).map((h) => h.choiceLabel).join(" ")}`.toLowerCase();

  const themes: EmotionalTheme[] = [];
  if (includesAny(normalized, ["died", "passed away", "grief", "miss", "anniversary"])) themes.push("grief");
  if (includesAny(normalized, ["ashamed", "hate myself", "i'm the problem", "stupid", "embarrassed"])) themes.push("shame", "self_criticism");
  if (includesAny(normalized, ["alone", "lonely", "no one", "left out", "excluded"])) themes.push("loneliness");
  if (includesAny(normalized, ["overwhelmed", "too much", "flooded", "spiral"])) themes.push("overwhelm");
  if (includesAny(normalized, ["avoid", "procrastinat", "can't start", "cannot start"])) themes.push("avoidance");
  if (includesAny(normalized, ["fail", "failure", "mess up", "not good enough"])) themes.push("fear_of_failure");
  if (includesAny(normalized, ["everyone else", "other people", "their moms", "compared to"])) themes.push("comparison_pain");
  if (includesAny(normalized, ["hopeless", "pointless", "what's the point"])) themes.push("hopelessness");
  if (includesAny(normalized, ["drained", "exhausted", "tired of", "worn out"])) themes.push("emotional_exhaustion");
  if (includesAny(normalized, ["fight", "argument", "relationship", "my partner", "my mom", "my dad"])) themes.push("relational_pain");

  const contradictions: EmotionalContradiction[] = [];
  if (includesAny(normalized, ["alone", "no one"]) && includesAny(normalized, ["whatever", "fine", "don't need"])) contradictions.push("wants_connection_but_withdraws");
  if (includesAny(normalized, ["need to", "should"]) && includesAny(normalized, ["avoid", "can't start"])) contradictions.push("wants_progress_but_avoids");
  if (includesAny(normalized, ["exhausted", "burned out"]) && includesAny(normalized, ["must push", "have to keep going"])) contradictions.push("needs_rest_but_self_pushes");
  if (includesAny(normalized, ["i guess", "whatever", "it's fine"]) && includesAny(normalized, ["hurts", "heavy", "can't"])) contradictions.push("asks_help_but_masks_pain");

  const maskingSignals = unique([
    includesAny(normalized, ["i guess", "whatever", "it's fine", "doesn't matter"]) ? "emotional minimization language" : "",
    includesAny(normalized, ["lol", "lmao"]) && includesAny(normalized, ["hurt", "sad", "grief", "panic"]) ? "humor masking distress" : "",
  ].filter(Boolean));

  const connectionBids = unique([
    includesAny(normalized, ["anyone", "someone", "wish i could talk", "i just want"]) ? "indirect request for closeness" : "",
    includesAny(normalized, ["do you", "can you stay", "are you there"]) ? "direct request for steady presence" : "",
  ].filter(Boolean));

  const isolationLevel = themes.includes("loneliness") || includesAny(normalized, ["nobody", "by myself"]) ? "high" : (includesAny(normalized, ["left out", "excluded"]) ? "moderate" : "low");
  const exhaustionLevel = themes.includes("emotional_exhaustion") || themes.includes("overwhelm") ? "high" : (includesAny(normalized, ["tired", "spent"]) ? "moderate" : "low");
  const emotionalWeight: EmotionalWeight = themes.includes("grief") || themes.includes("hopelessness") ? "acute" : (themes.length >= 4 ? "heavy" : themes.length >= 2 ? "moderate" : "light");

  return {
    themes: unique(themes),
    contradictions: unique(contradictions),
    unmetNeeds: unique([
      themes.includes("grief") ? "permission to grieve without fixing" : "",
      themes.includes("shame") ? "non-judgmental reassurance" : "",
      themes.includes("overwhelm") ? "reduced cognitive load" : "",
      themes.includes("loneliness") ? "felt sense of connection" : "",
      themes.includes("fear_of_failure") ? "safe-to-start framing" : "",
    ].filter(Boolean)),
    attachmentSignals: unique([
      includesAny(normalized, ["mom", "dad", "partner", "best friend", "left"]) ? "attachment figure activation" : "",
      includesAny(normalized, ["abandon", "ignored", "left out"]) ? "abandonment sensitivity cue" : "",
    ].filter(Boolean)),
    emotionalTension: unique([
      contradictions.length > 0 ? "internal push-pull between needs and protection" : "",
      themes.includes("self_criticism") ? "identity-level self-attack" : "",
    ].filter(Boolean)),
    relationalPain: unique([
      themes.includes("comparison_pain") ? "social comparison amplifying hurt" : "",
      themes.includes("relational_pain") ? "relationship strain carrying emotional load" : "",
    ].filter(Boolean)),
    stressSources: unique([
      includesAny(normalized, ["homework", "school", "exam", "class"]) ? "academic demand" : "",
      includesAny(normalized, ["work", "boss", "deadline"]) ? "work pressure" : "",
      includesAny(normalized, ["family", "mom", "dad"]) ? "family context triggers" : "",
      includesAny(normalized, ["money", "rent", "bills"]) ? "financial pressure" : "",
    ].filter(Boolean)),
    escalationRisk: emotionalWeight === "acute" || includesAny(normalized, ["nothing helps", "can't do this"]) ? "elevated" : (themes.length >= 3 ? "watch" : "low"),
    fragilityLevel: emotionalWeight === "acute" ? "raw" : (emotionalWeight === "heavy" ? "fragile" : (maskingSignals.length > 0 ? "guarded" : "low")),
    exhaustionLevel,
    isolationLevel,
    maskingSignals,
    connectionBids,
    subtext: unique([
      themes.includes("grief") && themes.includes("comparison_pain") ? "reminders are reopening grief and making belonging feel out of reach" : "",
      themes.includes("avoidance") && themes.includes("shame") ? "avoidance may be protective paralysis, then shame spikes afterward" : "",
      themes.includes("loneliness") && themes.includes("overwhelm") ? "frustration may be carrying a hidden need for companionship" : "",
    ].filter(Boolean)),
    emotionalWeight,
  };
}
