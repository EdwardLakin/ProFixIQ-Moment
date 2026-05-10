import { z } from "zod";

const ageSchema = z.enum(["under_13", "13_15", "16_17", "18_plus", "not_set"]);

export function normalizeAgeRange(value: unknown): "under_13" | "13_15" | "16_17" | "18_plus" {
  const parsed = ageSchema.safeParse(value);
  if (!parsed.success || parsed.data === "not_set") return "18_plus";
  return parsed.data;
}
