const requiredKeys = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
};

export function getSupabaseEnv() {
  const missing = Object.entries(requiredKeys)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(`Missing required env vars: ${missing.join(", ")}`);
  }

  return {
    url: requiredKeys.NEXT_PUBLIC_SUPABASE_URL as string,
    anonKey: requiredKeys.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
  };
}

export function getOpenAIKey() {
  return process.env.OPENAI_API_KEY;
}
