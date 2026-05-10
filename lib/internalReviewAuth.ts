import { createSupabaseServerClient } from "@/lib/supabase/server";

const INTERNAL_REVIEW_EMAILS = process.env.INTERNAL_REVIEW_EMAILS?.split(",").map((item) => item.trim().toLowerCase()).filter((item) => item.length > 0) ?? [];

export async function requireInternalReviewer() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id || !user.email) return { authorized: false as const };

  const { data: profile } = await supabase.from("moment_profiles").select("role").eq("user_id", user.id).maybeSingle();
  const roleAllowed = profile?.role === "admin";
  const emailAllowed = INTERNAL_REVIEW_EMAILS.includes(user.email.toLowerCase());

  return { authorized: roleAllowed && emailAllowed, userId: user.id } as const;
}
