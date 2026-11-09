import Link from "next/link";
import { Camera, Send, Video } from "lucide-react";
import { Container } from "./Container";
import { Logo } from "./Logo";
import { siteConfig } from "@/lib/site";

const navigation = [
  { href: "/", label: "Главная" },
  { href: "/schedule", label: "Расписание" },
  { href: "/subscriptions", label: "Абонементы" },
  { href: "/events", label: "Вечеринки" },
  { href: "/about", label: "О школе" },
  { href: "/teachers", label: "Преподаватели" },
  { href: "/faq", label: "Вопросы и ответы" },
];

const documents = [
  { href: "/rules", label: "Правила школы" },
  { href: "/terms", label: "Пользовательское соглашение" },
  { href: "/privacy", label: "Политика конфиденциальности" },
  { href: "/cookies", label: "Политика cookie" },
];

const socials = [
  { href: siteConfig.telegram.channel, label: "Telegram", icon: Send },
  { href: siteConfig.social.instagram, label: "Instagram", icon: Camera },
  { href: siteConfig.social.youtube, label: "YouTube", icon: Video },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-background-elevated">
      <Container className="grid gap-10 py-12 md:py-16 lg:grid-cols-[1.1fr_2fr]">
        <div className="max-w-sm">
          <Logo size="md" />
          <p className="mt-5 text-sm leading-relaxed text-muted">{siteConfig.description}</p>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <h3 className="app-card-title">Навигация</h3>
            <ul className="mt-4 space-y-2.5">
              {navigation.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted transition-colors hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="app-card-title">Контакты</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-muted">
              <li>{siteConfig.contacts.phone}</li>
              <li>{siteConfig.contacts.email}</li>
              <li>{siteConfig.contacts.address}</li>
              <li>{siteConfig.contacts.hours}</li>
            </ul>
            <ul className="mt-6 space-y-2.5">
              {documents.map((doc) => (
                <li key={doc.href}>
                  <Link href={doc.href} className="text-sm text-muted transition-colors hover:text-foreground">
                    {doc.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="app-card-title">Мы в соцсетях</h3>
            <div className="mt-4 flex gap-2.5">
              {socials.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-accent-400 hover:text-accent-300"
                >
                  <social.icon className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </Container>

      <div className="border-t border-border py-6">
        <Container className="flex flex-col gap-2 text-xs text-muted-dim sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {siteConfig.name} — школа бачаты. Все права защищены.
          </p>
          <p>Запись на занятия подтверждается администратором.</p>
        </Container>
      </div>
    </footer>
  );
}
