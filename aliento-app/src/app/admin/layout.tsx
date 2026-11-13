import { AdminSidebar, type AdminNavItem } from "@/components/AdminSidebar";
import { AppTopbar } from "@/components/AppTopbar";
import { requireStaff } from "@/actions/auth";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/format";

export const metadata = {
  title: "Панель управления",
  robots: { index: false, follow: false },
};

const adminItems: AdminNavItem[] = [
  { href: "/admin", label: "Панель управления", icon: "dashboard" },
  { href: "/admin/schedule", label: "Расписание", icon: "schedule" },
  { href: "/admin/classes", label: "Занятия", icon: "classes" },
  { href: "/admin/students", label: "Ученики", icon: "students" },
  { href: "/admin/plans", label: "Абонементы", icon: "plans" },
  { href: "/admin/payments", label: "Платежи", icon: "payments" },
  { href: "/admin/stats", label: "Статистика", icon: "stats" },
  { href: "/admin/announcements", label: "Анонсы", icon: "announcements" },
  { href: "/admin/messages", label: "Сообщения", icon: "messages" },
  { href: "/admin/settings", label: "Настройки", icon: "settings" },
];

const teacherItems: AdminNavItem[] = [
  { href: "/admin", label: "Панель управления", icon: "dashboard" },
  { href: "/admin/schedule", label: "Расписание", icon: "schedule" },
  { href: "/admin/classes", label: "Мои занятия", icon: "classes" },
  { href: "/admin/students", label: "Ученики", icon: "students" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireStaff();
  const staffIsAdmin = isAdmin(user.role);
  const items = staffIsAdmin ? adminItems : teacherItems;

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background-elevated lg:flex-row">
      <AdminSidebar items={items} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppTopbar user={user} hideLogoOnDesktop />
        <main className="flex-1 px-4 py-8 md:px-8">{children}</main>
      </div>
    </div>
  );
}
