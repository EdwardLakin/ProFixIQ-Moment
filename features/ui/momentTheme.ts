export const momentTheme = {
  background: "#0b1020",
  surface: "#121932",
  elevated: "#1a2240",
  border: "rgba(255,255,255,0.14)",
  text: "#f8f1e7",
  mutedText: "#b5bdd7",
  violetAccent: "#c8b5ff",
  blueAccent: "#9ec5ff",
  cream: "#f8f1e7",
  danger: "#ff8f8f",
  success: "#9ce7bf",
} as const;

export const motionTokens = {
  cardTransition: "transition duration-200 ease-out motion-reduce:transition-none motion-safe:opacity-100 motion-safe:translate-y-0",
  blurTransition: "transition-[filter] duration-200 motion-reduce:transition-none motion-safe:blur-0",
  translateTransition: "transition-transform duration-200 ease-out motion-reduce:transition-none",
} as const;
