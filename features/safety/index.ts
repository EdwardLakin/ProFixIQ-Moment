export type SupportSeverity = "low" | "medium" | "high";

const highRiskPatterns = [/kill myself/i, /suicide/i, /self\s*harm/i, /hurt myself/i, /want to die/i, /end my life/i];
const mediumRiskPatterns = [/panic attack/i, /hopeless/i, /can't do this/i, /worthless/i, /nobody would care/i];

export function detectSupportRisk(input: string): { severity: SupportSeverity; flags: string[] } {
  const flags: string[] = [];
  highRiskPatterns.forEach((pattern) => { if (pattern.test(input)) flags.push(`high:${pattern.source}`); });
  if (flags.length > 0) return { severity: "high", flags };

  mediumRiskPatterns.forEach((pattern) => { if (pattern.test(input)) flags.push(`medium:${pattern.source}`); });
  if (flags.length > 0) return { severity: "medium", flags };
  return { severity: "low", flags };
}
