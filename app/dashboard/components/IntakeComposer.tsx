import { MomentButton } from "@/components/moment/MomentButton";

export function IntakeComposer({ onSubmit, disabled, savedNote }: { onSubmit: () => void; disabled: boolean; savedNote: string | null }) {
  return (
    <div>
      <MomentButton onClick={onSubmit} disabled={disabled}>Continue gently</MomentButton>
      {savedNote ? <p className="mt-2 text-xs text-violet-100/70">{savedNote}</p> : null}
    </div>
  );
}
