import { MomentCard } from "@/components/moment/MomentCard";
import { MomentPageHeader } from "@/components/moment/MomentPageHeader";
import { MomentShell } from "@/components/moment/MomentShell";
import { SignInForm } from "@/app/sign-in/SignInForm";

export default function SignInPage() {
  return (
    <MomentShell>
      <section className="mx-auto max-w-md">
        <MomentPageHeader eyebrow="Moment" title="Sign in" subtitle="Sign in or create an account to continue." />
        <MomentCard>
          <SignInForm />
        </MomentCard>
      </section>
    </MomentShell>
  );
}
