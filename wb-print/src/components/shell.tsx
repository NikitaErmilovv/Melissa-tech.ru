"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { formatTime } from "@/lib/time";
import { useDesk } from "./use-desk";

const LINKS = [
  { href: "/", label: "Стол" },
  { href: "/articles", label: "Артикулы" },
  { href: "/texts", label: "Тексты" },
  { href: "/settings", label: "Настройки" },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data, error } = useDesk();
  const live = data?.worker.mode === "live";

  return (
    <div className="min-h-screen">
      <header className="fixed inset-x-0 top-0 z-40 px-3 pt-3 md:px-6">
        <div className="header-glass mx-auto flex max-w-6xl items-center gap-3 rounded-full px-4 py-2.5 md:px-6">
          <Link href="/" className="font-heading text-lg font-black tracking-[-0.06em] uppercase">
            DODJ
          </Link>
          <nav className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto md:justify-center">
            {LINKS.map((link) => {
              const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`shrink-0 rounded-full px-3 py-1.5 font-heading text-[10px] font-bold tracking-[0.16em] uppercase ${
                    active ? "bg-white text-black" : "text-white/55 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <p className={`hidden shrink-0 text-[10px] font-bold tracking-[0.14em] uppercase sm:block ${live ? "text-[#ffc5ee]" : "text-white/45"}`}>
            {live ? `WB · …${data?.settings.tokenTail}` : "демо"}
            {data?.settings.liveReplies ? "" : live ? " · ответы выкл" : ""}
            {data?.worker.lastTickAt ? ` · ${formatTime(data.worker.lastTickAt)}` : ""}
          </p>
        </div>
        <p className={`mx-auto mt-2 max-w-6xl px-2 text-[10px] font-bold tracking-[0.14em] uppercase sm:hidden ${live ? "text-[#ffc5ee]" : "text-white/45"}`}>
          {live ? `WB · …${data?.settings.tokenTail}` : "демо"}
          {data?.settings.liveReplies ? "" : live ? " · ответы выкл" : ""}
        </p>
        {data?.worker.lastError || error ? (
          <p className="mx-auto mt-2 max-w-6xl px-4 text-xs text-[#ff6b3d]">{data?.worker.lastError || error}</p>
        ) : null}
      </header>
      <main className="mx-auto max-w-6xl px-4 pt-32 pb-10 sm:pt-24">
        {live && data && !data.settings.liveReplies ? (
          <Link href="/settings" className="mb-4 block rounded-2xl border border-[#ffc5ee]/50 bg-[#ffc5ee]/15 px-4 py-3 text-sm">
            Бот молчит: ответы покупателям выключены. Включите их, иначе на новое сообщение в чате никто не ответит.
          </Link>
        ) : null}
        {children}
      </main>
    </div>
  );
}
