"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type Theme = "light" | "dark" | "system";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (value: Theme) => void;
  isDark: boolean;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyTheme(value: Theme) {
  const root = document.documentElement;
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const shouldDark = value === "dark" || (value === "system" && systemDark);
  root.classList.toggle("dark", shouldDark);
}

function readStoredTheme(): Theme {
  if (typeof window === "undefined") return "system";
  const stored = window.localStorage.getItem("theme");
  if (stored === "light" || stored === "dark" || stored === "system") return stored;
  return "system";
}

export function ThemeProvider({ children, defaultTheme = "system" as Theme }: { children: React.ReactNode; defaultTheme?: Theme }) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);

  useEffect(() => {
    const initial = readStoredTheme();
    setThemeState(initial);
    applyTheme(initial);

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const current = readStoredTheme();
      if (current === "system") applyTheme("system");
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const setTheme = useCallback((value: Theme) => {
    window.localStorage.setItem("theme", value);
    setThemeState(value);
    applyTheme(value);
  }, []);

  const toggle = useCallback(() => {
    setTheme((prev => (prev === "dark" ? "light" : "dark")) as Theme);
  }, [setTheme]);

  const isDark = useMemo(() => {
    if (theme === "dark") return true;
    if (theme === "light") return false;
    return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }, [theme]);

  const value = useMemo(() => ({ theme, setTheme, isDark, toggle }), [theme, setTheme, isDark, toggle]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

export function ThemeScript() {
  // Prevent FOUC: run before React hydration
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `(() => {try {const stored = localStorage.getItem('theme'); const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches; const t = (stored === 'light' || stored === 'dark' || stored === 'system') ? stored : 'system'; const dark = t === 'dark' || (t === 'system' && systemDark); document.documentElement.classList.toggle('dark', dark);} catch (e) {}})();`,
      }}
    />
  );
}
