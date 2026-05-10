import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCanonicalAppPath, getOrCreateMomentProfile } from "@/lib/auth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/";

  const supabase = await createSupabaseServerClient();

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL(`/sign-in?next=${encodeURIComponent(next)}`, url.origin));
  }

  const profile = await getOrCreateMomentProfile(user.id);
  const path = next === "/" || next === "/dashboard" || next === "/onboarding" ? await getCanonicalAppPath(user.id, profile) : next;

  return NextResponse.redirect(new URL(path, url.origin));
}
