import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { MomentAppNav } from "@/components/moment/MomentAppNav";
import { MomentMobileNav } from "@/components/moment/MomentMobileNav";
import { MomentTopBar } from "@/components/moment/MomentTopBar";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function MomentAppShell({ children, title, subtitle }: { children: ReactNode; title: string; subtitle?: string }) {
  async function signOut() {
    "use server";
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
    redirect("/sign-in");
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  return (
    <main className="min-h-screen bg-[#0f172a] px-4 py-5 text-[#f8f1e7] md:px-6 md:py-6">
      <section className="mx-auto flex w-full max-w-6xl gap-5 pb-24 md:pb-0">
        <MomentAppNav />
        <div className="min-w-0 flex-1 rounded-3xl border border-white/15 bg-[#172033] p-4 md:p-6">
          <MomentTopBar
            title={title}
            subtitle={subtitle}
            action={
              <form action={signOut}>
                <button className="rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs text-[#d6d3e8] hover:bg-white/10 hover:text-[#f8f1e7]">Sign out</button>
              </form>
            }
          />
          {children}
        </div>
      </section>
      <MomentMobileNav />
    </main>
  );
}
