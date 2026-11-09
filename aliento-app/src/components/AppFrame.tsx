"use client";

import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { CookieBanner } from "./CookieBanner";
import type { PublicUser } from "@/lib/format";

export function AppFrame({
  user,
  children,
}: {
  user: PublicUser | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isApp =
    pathname.startsWith("/cabinet") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register");

  if (isApp) {
    return <div className="flex min-h-full flex-1 flex-col">{children}</div>;
  }

  return (
    <>
      <Header user={user} />
      <main className="flex-1">{children}</main>
      <Footer />
      <CookieBanner />
    </>
  );
}
