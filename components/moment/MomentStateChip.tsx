type Props = { label: string; selected: boolean; onClick: () => void };

export function MomentStateChip({ label, selected, onClick }: Props) {
  return <button type="button" onClick={onClick} className={`rounded-full px-4 py-2 text-sm ${selected ? "bg-[#c4b5fd] text-[#1a1730]" : "bg-white/10 text-[#d6d3e8] hover:bg-white/[0.14]"}`}>{label}</button>;
}
