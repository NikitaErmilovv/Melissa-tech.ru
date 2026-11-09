import Link from "next/link";
import { BackgroundGlow } from "@/components/BackgroundGlow";
import { Container } from "@/components/Container";
import { TelegramButton } from "@/components/TelegramButton";
import { siteConfig } from "@/lib/site";

export default function NotFound() {
  return (
    <section className="relative flex flex-1 items-center overflow-hidden py-24">
      <BackgroundGlow variant="hero" />
      <Container className="relative flex flex-col items-center text-center">
        <span className="font-display text-7xl font-medium text-accent-400/70">404</span>
        <h1 className="mt-4 font-display text-3xl font-medium">Страница не найдена</h1>
        <p className="mt-3 max-w-md text-muted">
          Возможно, страница была перемещена. Загляните на главную или перейдите в
          Telegram школы Aliento.
        </p>
        <div className="mt-8 flex w-full max-w-md flex-col items-stretch gap-3 sm:max-w-none sm:flex-row sm:items-center sm:justify-center sm:gap-4">
          <Link
            href="/"
            className="inline-flex w-full items-center justify-center rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition hover:bg-accent-300 sm:w-auto"
          >
            На главную
          </Link>
          <TelegramButton href={siteConfig.telegram.channel} variant="secondary" className="w-full sm:w-auto">
            Перейти в Telegram
          </TelegramButton>
        </div>
      </Container>
    </section>
  );
}
