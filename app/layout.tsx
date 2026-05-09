import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ProFixIQ Moment",
  description: "AI executive-function operating system for ADHD/anxiety/school overwhelm",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* Using a system font stack for build reliability. Hosted fonts can be restored
          after deployment/network behavior is stable across environments. */}
      <body>{children}</body>
    </html>
  );
}
