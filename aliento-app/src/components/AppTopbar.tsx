import { Logo } from "./Logo";
import { Avatar } from "./Avatar";
import type { PublicUser } from "@/lib/format";

const ROLE_LABEL: Record<string, string> = {
  STUDENT: "Ученик",
  TEACHER: "Преподаватель",
  ADMIN: "Администратор",
  OWNER: "Владелец школы",
};

export function AppTopbar({
  user,
  children,
  hideLogoOnDesktop = false,
}: {
  user: PublicUser;
  children?: React.ReactNode;
  /** The admin shell already shows the wordmark in its sidebar on wide screens. */
  hideLogoOnDesktop?: boolean;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between gap-4 px-4 md:px-8">
        <div className="flex items-center gap-4">
          <span className={hideLogoOnDesktop ? "lg:hidden" : undefined}>
            <Logo size="sm" />
          </span>
          {children}
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm text-foreground">{user.name}</p>
            <p className="text-xs text-muted-dim">{ROLE_LABEL[user.role] ?? user.role}</p>
          </div>
          <Avatar name={user.name} size="sm" />
        </div>
      </div>
    </header>
  );
}
