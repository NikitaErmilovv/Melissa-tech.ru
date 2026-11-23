"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Building2,
  CalendarDays,
  CreditCard,
  ExternalLink,
  LayoutDashboard,
  Megaphone,
  MessageSquare,
  Settings,
  Ticket,
  Users,
} from "lucide-react";
import { Logo } from "./Logo";
import { LogoutButton } from "./LogoutButton";
import { cn } from "@/lib/cn";

const ICONS = {
  dashboard: LayoutDashboard,
  schedule: CalendarDays,
  halls: Building2,
  classes: CalendarDays,
  students: Users,
  plans: Ticket,
  payments: CreditCard,
  stats: BarChart3,
  messages: MessageSquare,
  announcements: Megaphone,
  settings: Settings,
} as const;

export type AdminNavItem = {
  href: string;
  label: string;
  icon: keyof typeof ICONS;
};

export function AdminSidebar({ items }: { items: AdminNavItem[] }) {
  const pathname = usePathname();

  return (
    <aside className="border-b border-border bg-background-elevated lg:sticky lg:top-0 lg:h-screen lg:w-60 lg:shrink-0 lg:border-b-0 lg:border-r">
      <div className="hidden px-5 py-5 lg:block">
        <Logo size="sm" href="/admin" />
      </div>

      <nav className="flex gap-1 overflow-x-auto px-3 py-3 lg:flex-col lg:overflow-visible lg:py-0">
        {items.map((item) => {
          const Icon = ICONS[item.icon];
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn("side-link", active && "side-link-active")}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
              {item.label}
            </Link>
          );
        })}

        <div className="hidden lg:mt-4 lg:block lg:border-t lg:border-border lg:pt-4">
          <Link href="/" className="side-link">
            <ExternalLink className="h-4 w-4 shrink-0" strokeWidth={1.75} />
            На сайт
          </Link>
          <LogoutButton />
        </div>

        <div className="flex gap-1 lg:hidden">
          <Link href="/" className="side-link">
            <ExternalLink className="h-4 w-4 shrink-0" strokeWidth={1.75} />
            На сайт
          </Link>
          <LogoutButton />
        </div>
      </nav>
    </aside>
  );
}
