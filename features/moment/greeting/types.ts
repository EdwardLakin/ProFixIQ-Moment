export type MomentGreetingTone = "daily" | "returning" | "birthday" | "first_time";

export type MomentGreetingInput = {
  displayName: string;
  birthdayMonth: number | null;
  birthdayDay: number | null;
  lastSeenAt: string | null;
  now: Date;
  recentContext?: string | null;
};

export type MomentGreetingOutput = {
  headline: string;
  subtext: string;
  prompt: string;
  tone: MomentGreetingTone;
};
