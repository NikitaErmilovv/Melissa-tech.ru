import Link from "next/link";
import { AppTopbar } from "@/components/AppTopbar";
import { NavTabs } from "@/components/NavTabs";
import { LogoutButton } from "@/components/LogoutButton";
import { requireStudent } from "@/actions/auth";

export const metadata = {
  title: "Личный кабинет",
  robots: { index: false, follow: false },
};

const tabs = [
  { href: "/cabinet", label: "Обзор" },
  { href: "/cabinet/classes", label: "Расписание" },
  { href: "/cabinet/subscriptions", label: "Абонементы" },
  { href: "/cabinet/profile", label: "Профиль" },
  { href: "/cabinet/notifications", label: "Сообщения" },
];

export default async function CabinetLayout({ children }: { children: React.ReactNode }) {
  const user = await requireStudent();

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background-elevated">
      <AppTopbar user={user} />
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 md:px-8 md:py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-display text-2xl md:text-3xl">Мой профиль</h1>
          <div className="flex items-center gap-1">
            <Link href="/" className="side-link">
              На сайт
            </Link>
            <LogoutButton />
          </div>
        </div>
        <div className="mt-7">
          <NavTabs items={tabs} />
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
