"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Moment", href: "/dashboard" },
  { label: "Check in", href: "/check-in" },
  { label: "Stuck", href: "/stuck" },
  { label: "Math reset", href: "/math-reset" },
  { label: "Drama pause", href: "/drama-pause" },
  { label: "Parent", href: "/parent" },
  { label: "Settings", href: "/settings" }
];

export function MomentAppNav() {
  const pathname = usePathname();

  return (
    <nav className="moment-glass-panel moment-gradient-border moment-soft-glow hidden w-60 shrink-0 p-3 md:block">
      <ul className="space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`block rounded-2xl px-3 py-2 text-sm transition ${active ? "bg-white/18 text-[#f8f1e7] shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] ring-1 ring-white/25" : "text-[#d6d3e8] hover:bg-white/12 hover:text-[#f8f1e7]"}`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function momentNavItems() {
  return navItems;
}
