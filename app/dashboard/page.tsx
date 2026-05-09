import { redirect } from "next/navigation";
import { MomentShell } from "@/components/moment/MomentShell";
import { MomentTopBar } from "@/components/moment/MomentTopBar";
import { DashboardClient } from "@/app/dashboard/DashboardClient";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function signOut() {
  "use server";
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/sign-in");
}

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  return <MomentShell><section className="mx-auto max-w-5xl"><MomentTopBar title="Moment" action={<form action={signOut}><button className="text-sm text-slate-300">Sign out</button></form>} /><DashboardClient /></section></MomentShell>;
}
