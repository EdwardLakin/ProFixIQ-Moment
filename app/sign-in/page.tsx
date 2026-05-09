import { redirect } from "next/navigation";
import { MomentButton } from "@/components/moment/MomentButton";
import { MomentCard } from "@/components/moment/MomentCard";
import { MomentInput } from "@/components/moment/MomentInput";
import { MomentPageHeader } from "@/components/moment/MomentPageHeader";
import { MomentShell } from "@/components/moment/MomentShell";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function signIn(formData: FormData) {
  "use server";
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect("/sign-in?error=1");
  redirect("/dashboard");
}

export default function SignInPage() {
  return (
    <MomentShell>
      <section className="mx-auto max-w-md">
        <MomentPageHeader eyebrow="Moment" title="Sign in" subtitle="Use your account to continue." />
        <MomentCard>
          <form action={signIn} className="space-y-3">
            <MomentInput name="email" type="email" required placeholder="Email" />
            <MomentInput name="password" type="password" required placeholder="Password" />
            <MomentButton type="submit">Sign in</MomentButton>
          </form>
        </MomentCard>
      </section>
    </MomentShell>
  );
}
