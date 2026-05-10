import { MomentTextarea } from "@/components/moment/MomentTextarea";

export function GreetingSurface({
  headline,
  opening,
  text,
  onText,
}: {
  headline: string;
  opening: string;
  text: string;
  onText: (value: string) => void;
}) {
  return (
    <section className="rounded-[1.6rem] border border-white/8 bg-[radial-gradient(circle_at_14%_0%,rgba(244,200,255,0.1),transparent_42%),radial-gradient(circle_at_88%_0%,rgba(147,197,253,0.12),transparent_40%),linear-gradient(150deg,#171222,#111925_58%,#192236) ] p-5 sm:p-6">
      <p className="text-xs tracking-[0.04em] text-[#e8dbff]/70">{headline}</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#f7efe3] sm:text-4xl">What feels heaviest right now?</h2>
      <p className="mt-2 max-w-2xl text-sm text-[#d9d8e8]">{opening}</p>
      <MomentTextarea rows={5} value={text} onChange={(event) => onText(event.target.value)} placeholder="Write what this moment feels like." />
    </section>
  );
}
