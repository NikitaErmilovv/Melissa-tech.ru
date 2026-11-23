"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Container } from "./Container";
import { Logo } from "./Logo";
import { ButtonLink } from "./ButtonLink";
import { cn } from "@/lib/cn";
import type { PublicUser } from "@/lib/format";
import { isStaff } from "@/lib/format";

const navLinks = [
  { href: "/", label: "Главная" },
  { href: "/schedule", label: "Расписание" },
  { href: "/subscriptions", label: "Абонементы" },
  { href: "/about", label: "О школе" },
  { href: "/teachers", label: "Преподаватели" },
  { href: "/contacts", label: "Контакты" },
];

export function Header({ user }: { user: PublicUser | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const closeMenu = () => setOpen(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const accountHref = user && isStaff(user.role) ? "/admin" : "/cabinet";

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-xl">
      <Container className="flex h-16 items-center justify-between gap-4 md:h-20">
        <Logo />

        <nav className="hidden items-center gap-0.5 lg:flex">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-3.5 py-2 text-sm transition-colors",
                  active ? "text-accent-300" : "text-muted hover:text-foreground"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {user ? (
            <ButtonLink href={accountHref} size="sm">
              {isStaff(user.role) ? "Панель" : "Кабинет"}
            </ButtonLink>
          ) : (
            <>
              <ButtonLink href="/login" variant="secondary" size="sm">
                Войти
              </ButtonLink>
              <ButtonLink href="/register" size="sm">
                Записаться
              </ButtonLink>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground"
            aria-label={open ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </Container>

      {open && (
        <div className="border-t border-border bg-background-elevated lg:hidden">
          <Container className="flex flex-col gap-1 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className={cn(
                  "rounded-xl px-4 py-3 text-base",
                  pathname === link.href ? "bg-accent-500/15 text-accent-300" : "text-muted"
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2">
              {user ? (
                <ButtonLink href={accountHref} className="w-full">
                  {isStaff(user.role) ? "Панель" : "Кабинет"}
                </ButtonLink>
              ) : (
                <>
                  <ButtonLink href="/login" variant="secondary" className="w-full">
                    Войти
                  </ButtonLink>
                  <ButtonLink href="/register" className="w-full">
                    Записаться
                  </ButtonLink>
                </>
              )}
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}
