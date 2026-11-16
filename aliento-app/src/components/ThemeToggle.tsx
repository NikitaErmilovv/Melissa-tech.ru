"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

type Theme = "dark" | "light";

const STORAGE_KEY = "aliento-theme";
const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function readTheme(): Theme {
  return document.documentElement.classList.contains("light") ? "light" : "dark";
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("light", theme === "light");
  document.documentElement.style.colorScheme = theme;
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Private mode or blocked storage — the theme still applies for this session.
  }
  listeners.forEach((listener) => listener());
}

export function ThemeToggle() {
  // Keep the first client render identical to SSR to avoid hydration mismatches
  // when the inline theme script restored "light" from localStorage.
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    setTheme(readTheme());
    return subscribe(() => setTheme(readTheme()));
  }, []);

  const next: Theme = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => applyTheme(next)}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-accent-400"
      aria-label={theme === "dark" ? "Включить светлую тему" : "Включить тёмную тему"}
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

export function ThemeScript() {
  const code = `(function(){try{var t=localStorage.getItem('${STORAGE_KEY}');if(t==='light'){document.documentElement.classList.add('light');document.documentElement.style.colorScheme='light';}}catch(e){}})();`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
