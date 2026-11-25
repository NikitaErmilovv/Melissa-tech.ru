"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/actions/auth";
import { cn } from "@/lib/cn";
import type { PublicUser } from "@/lib/format";

export function AppSidebar({
  user,
  items,
  title,
}: {
  user: PublicUser;
  title: string;
  items: { href: string; label: string }[];
}) {
  const pathname = usePathname();

  return (
    <aside className="border-b border-border bg-background-elevated lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r">
      <div className="px-5 py-5">
        <p className="font-display text-lg text-foreground">{title}</p>
        <p className="mt-1 text-xs text-muted">{user.name}</p>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible lg:px-3 lg:pb-6">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-sm font-medium lg:rounded-xl",
                active ? "bg-foreground text-background" : "text-muted hover:text-foreground"
              )}
            >
              {item.label}
            </Link>
          );
        })}
        <Link href="/" className="shrink-0 rounded-full px-4 py-2 text-sm text-muted hover:text-foreground lg:rounded-xl">
          На сайт
        </Link>
        <form action={logoutAction}>
          <button type="submit" className="w-full rounded-full px-4 py-2 text-left text-sm text-muted hover:text-foreground lg:rounded-xl">
            Выйти
          </button>
        </form>
      </nav>
    </aside>
  );
}
