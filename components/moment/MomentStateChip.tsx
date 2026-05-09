type Props = { label: string; selected: boolean; onClick: () => void };

export function MomentStateChip({ label, selected, onClick }: Props) {
  return <button type="button" onClick={onClick} className={`rounded-full px-4 py-2 text-sm ${selected ? "bg-violet-200 text-slate-950" : "bg-white/5 text-slate-200"}`}>{label}</button>;
}
