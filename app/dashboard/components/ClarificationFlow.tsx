export function ClarificationFlow({ prompt }: { prompt: string | null }) {
  if (!prompt) return null;
  return <p className="text-sm text-[#d6caef]">{prompt}</p>;
}
