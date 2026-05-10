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
    <section className="rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_14%_0%,rgba(244,200,255,0.14),transparent_38%),radial-gradient(circle_at_88%_0%,rgba(147,197,253,0.15),transparent_36%),linear-gradient(140deg,#1a1427,#111925_58%,#1a2238)] p-6">
      <p className="text-xs uppercase tracking-[0.2em] text-[#e8dbff]/75">{headline}</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#f7efe3] sm:text-4xl">Tell Moment what is happening once.</h2>
      <p className="mt-2 max-w-2xl text-sm text-[#d9d8e8]">{opening}</p>
      <MomentTextarea rows={6} value={text} onChange={(event) => onText(event.target.value)} placeholder="Write what this moment feels like." />
    </section>
  );
}
