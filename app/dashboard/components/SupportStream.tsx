import { MomentCard } from "@/components/moment/MomentCard";
import type { CheckInResult } from "./types";

export function SupportStream({ result }: { result: CheckInResult | null }) {
  if (!result) return null;
  const cadence = result.response.steps.length <= 1 ? "space-y-3" : "space-y-2";
  const responseMeta = result.response as typeof result.response & {
    emotionalRhythmHint?: string | null;
    seasonalContextCue?: string | null;
    supportStyleAdaptationCue?: string | null;
    recoveryTrajectoryCue?: string | null;
    journalArcSummary?: string | null;
    supportTimingMode?: "normal" | "gentle_presence";
  };
  return (
    <MomentCard>
      <p className="text-xs uppercase tracking-[0.18em] text-violet-100/70">A gentle reflection</p>
      <p className="mt-3 text-sm text-[#f5edff]">{result.response.reflection}</p>
      <p className="mt-2 text-sm text-[#d8d0ee]">{result.response.whyThisRoute}</p>
      <p className="mt-2 text-sm text-[#f3ebdb]">A gentle next step: {result.response.tinyNextStep}</p>
      {responseMeta.recoveryTrajectoryCue ? <p className="mt-2 text-sm text-[#e6dbf7]">{responseMeta.recoveryTrajectoryCue}</p> : null}
      {responseMeta.journalArcSummary ? <p className="mt-2 text-sm text-[#d9d8e8]">{responseMeta.journalArcSummary}</p> : null}
      {responseMeta.seasonalContextCue ? <p className="mt-2 text-xs text-[#cabfdf]">{responseMeta.seasonalContextCue}</p> : null}
      {responseMeta.emotionalRhythmHint ? <p className="mt-2 text-xs text-[#cabfdf]">{responseMeta.emotionalRhythmHint}</p> : null}
      {responseMeta.supportStyleAdaptationCue ? <p className="mt-2 text-xs text-[#cabfdf]">{responseMeta.supportStyleAdaptationCue}</p> : null}
      <details className="mt-3 text-sm text-[#d6caef]">
        <summary>{responseMeta.supportTimingMode === "gentle_presence" ? "Keep it very light" : "Keep going with this"}</summary>
        <div className={`mt-2 ${cadence}`}>
          {result.response.steps.map((step) => (
            <p key={step}>{step}</p>
          ))}
        </div>
      </details>
    </MomentCard>
  );
}
