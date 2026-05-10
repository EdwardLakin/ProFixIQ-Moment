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
    <main className="moment-glow relative min-h-screen overflow-hidden px-4 py-5 text-[#f8f1e7] md:px-6 md:py-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(196,181,253,0.2),transparent_36%),radial-gradient(circle_at_82%_10%,rgba(34,211,238,0.12),transparent_32%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:56px_56px]" />
      <section className="relative mx-auto flex w-full max-w-6xl gap-5 pb-24 md:pb-0">
        <MomentAppNav />
        <div className="moment-glass-panel moment-gradient-border min-w-0 flex-1 p-4 md:p-6">
          <MomentTopBar
            title={title}
            subtitle={subtitle}
            action={
              <form action={signOut}>
                <button className="moment-btn-secondary min-h-0 px-3 py-1.5 text-xs">Sign out</button>
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
