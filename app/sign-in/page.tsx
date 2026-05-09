import { Suspense } from "react";
import { SignInForm } from "./SignInForm";

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#0b1020] px-6 py-10 text-[#f8f1e7]">
          <div className="mx-auto max-w-md rounded-3xl bg-white/[0.05] p-6">
            Loading sign in…
          </div>
        </main>
      }
    >
      <SignInForm />
    </Suspense>
  );
}
