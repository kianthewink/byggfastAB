"use client";

import { useLayoutEffect, useSyncExternalStore } from "react";
import { MoonIcon, SunIcon } from "./icons";

type Theme = "light" | "dark";

const STORAGE_KEY = "theme";
// Fired whenever this tab changes the theme. The native `storage` event only
// reaches *other* tabs, never the one that made the change, so
// useSyncExternalStore needs its own signal to know to re-read localStorage.
const THEME_EVENT = "bofast-theme-change";

function readTheme(): Theme {
  try {
    return localStorage.getItem(STORAGE_KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

function getServerTheme(): Theme {
  return "light";
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(THEME_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(THEME_EVENT, onChange);
  };
}

export function ThemeToggle() {
  // getServerTheme ("light") is also what the client renders on its first
  // pass, before this can read localStorage — matching the server keeps
  // hydration from failing whenever a visitor has "dark" saved. Once
  // mounted, useSyncExternalStore re-reads on the events subscribe() listens
  // for and re-renders with the real value.
  const theme = useSyncExternalStore(subscribe, readTheme, getServerTheme);

  // React 19 treats <html> as a singleton host element and can strip
  // attributes the inline bootstrap script set before hydration. Re-assert
  // the attribute after every commit (before paint) so it always matches
  // state, regardless of what hydration did to the DOM.
  useLayoutEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {}
    window.dispatchEvent(new Event(THEME_EVENT));
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Växla mörkt läge"
      aria-pressed={theme === "dark"}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-muted transition-colors hover:bg-sidebar-active hover:text-sidebar-foreground"
    >
      {theme === "dark" ? (
        <SunIcon className="h-5 w-5 shrink-0" />
      ) : (
        <MoonIcon className="h-5 w-5 shrink-0" />
      )}
      {theme === "dark" ? "Ljust läge" : "Mörkt läge"}
    </button>
  );
}
