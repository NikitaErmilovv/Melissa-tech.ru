"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

export function NavTabs({ items }: { items: { href: string; label: string }[] }) {
  const pathname = usePathname();

  return (
    <nav className="nav-tabs-scroll -mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn("tab-link", pathname === item.href && "tab-link-active")}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
