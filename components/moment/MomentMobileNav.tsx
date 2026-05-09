"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { momentNavItems } from "@/components/moment/MomentAppNav";

export function MomentMobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-3 bottom-3 z-30 rounded-2xl border border-white/10 bg-[#11172c]/95 p-2 shadow-2xl backdrop-blur md:hidden">
      <ul className="grid grid-cols-4 gap-1">
        {momentNavItems().map((item) => {
          const active = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`block rounded-xl px-2 py-2 text-center text-[11px] leading-tight ${active ? "bg-white/12 text-[#f8f1e7]" : "text-slate-300"}`}
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
