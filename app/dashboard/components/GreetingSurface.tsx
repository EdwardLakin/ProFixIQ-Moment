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
    <section className="rounded-[1.6rem] bg-[linear-gradient(160deg,#151629,#111522_60%,#131b2d)] p-5 sm:p-7">
      <p className="text-xs tracking-[0.04em] text-[#e8dbff]/70">{headline}</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#f7efe3] sm:text-3xl">What feels heaviest right now?</h2>
      <p className="mt-3 max-w-2xl text-sm text-[#d9d8e8]">{opening}</p>
      <MomentTextarea rows={5} value={text} onChange={(event) => onText(event.target.value)} placeholder="Write what this moment feels like." />
    </section>
  );
}
