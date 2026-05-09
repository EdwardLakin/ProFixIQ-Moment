export const momentTheme = {
  background: "#0f172a",
  deepBackground: "#0b1020",
  surface: "#172033",
  elevated: "#202a40",
  softPanel: "rgba(255,255,255,0.07)",
  border: "rgba(255,255,255,0.16)",
  textPrimary: "#f8f1e7",
  textSecondary: "#d6d3e8",
  textMuted: "#a7a8bd",
  lavender: "#c4b5fd",
  violet: "#a78bfa",
  mistBlue: "#93c5fd",
  teal: "#7dd3fc",
  danger: "#fda4af",
  warning: "#fcd34d",
  success: "#86efac",
} as const;

export const motionTokens = {
  cardTransition: "transition duration-200 ease-out motion-reduce:transition-none motion-safe:opacity-100 motion-safe:translate-y-0",
  blurTransition: "transition-[filter] duration-200 motion-reduce:transition-none motion-safe:blur-0",
  translateTransition: "transition-transform duration-200 ease-out motion-reduce:transition-none",
} as const;
