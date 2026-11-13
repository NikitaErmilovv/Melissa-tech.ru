"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { X } from "lucide-react";

const STORAGE_KEY = "aliento-cookies-accepted";

function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

function getSnapshot() {
  try {
    return localStorage.getItem(STORAGE_KEY) !== "1";
  } catch {
    return true;
  }
}

function getServerSnapshot() {
  return false;
}

export function CookieBanner() {
  const shouldShow = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [dismissed, setDismissed] = useState(false);

  if (!shouldShow || dismissed) return null;

  const accept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Private mode or blocked storage — just hide for this session.
    }
    setDismissed(true);
  };

  return (
    <div
      role="dialog"
      aria-label="Уведомление об использовании cookie"
      className="fixed bottom-4 left-4 z-50 max-w-[min(calc(100vw-2rem),20rem)] pb-[env(safe-area-inset-bottom)] sm:bottom-6 sm:left-6 sm:max-w-xs"
    >
      <div className="content-panel flex flex-col gap-3 !p-4">
        <p className="text-[11px] leading-relaxed text-muted">
          Мы используем cookie для работы сайта. Подробнее — в{" "}
          <Link href="/cookies" className="link-underline text-accent-300/90">
            политике cookie
          </Link>{" "}
          и{" "}
          <Link href="/privacy" className="link-underline text-accent-300/90">
            политике конфиденциальности
          </Link>
          .
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={accept}
            className="rounded-full bg-foreground px-4 py-2 text-[11px] font-medium text-background transition-colors hover:bg-accent-200"
          >
            Принять
          </button>
          <button
            type="button"
            onClick={accept}
            aria-label="Закрыть уведомление"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border-strong text-muted transition-colors hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
