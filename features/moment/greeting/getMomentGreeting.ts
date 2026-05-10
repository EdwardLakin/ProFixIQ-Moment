import type { MomentGreetingInput, MomentGreetingOutput } from "@/features/moment/greeting/types";

function getName(displayName: string) {
  const trimmed = displayName.trim();
  return trimmed.length > 0 ? trimmed : "there";
}

export function getMomentGreeting(input: MomentGreetingInput): MomentGreetingOutput {
  const name = getName(input.displayName);
  const todayMonth = input.now.getUTCMonth() + 1;
  const todayDay = input.now.getUTCDate();
  const isBirthday = input.birthdayMonth === todayMonth && input.birthdayDay === todayDay;

  if (isBirthday) {
    return {
      headline: `Happy birthday, ${name}.`,
      subtext: "No pressure today — just one small check-in if you want it.",
      prompt: "If you want, share what would make today feel one notch lighter.",
      tone: "birthday",
    };
  }

  if (!input.lastSeenAt) {
    return {
      headline: `Hi ${name}, welcome to your Moment.`,
      subtext: "Start with whatever feels easiest to say.",
      prompt: "What feels most important to put down first?",
      tone: "first_time",
    };
  }

  const elapsedMs = input.now.getTime() - new Date(input.lastSeenAt).getTime();
  const elapsedDays = elapsedMs / (1000 * 60 * 60 * 24);

  if (elapsedDays >= 3) {
    return {
      headline: `Hi ${name}, it’s been a few days.`,
      subtext: "How have the last few days felt?",
      prompt: "If it helps, begin with the part that has been hardest to carry.",
      tone: "returning",
    };
  }

  return {
    headline: `Hi ${name}, what is asking for care today?`,
    subtext: "No need to sort it all at once — we can start gently.",
    prompt: input.recentContext ? "We can continue gently from last time, or begin fresh." : "A single sentence is enough to begin.",
    tone: "daily",
  };
}
