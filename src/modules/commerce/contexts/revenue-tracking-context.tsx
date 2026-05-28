"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Filters = Record<string, string[]>;
type ThemePreference = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

interface RevenueTrackingContextValue {
  filters: Filters;
  setFilters: (filters: Filters) => void;
  theme: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
  resolvedTheme: ResolvedTheme;
}

const RevenueTrackingContext = createContext<RevenueTrackingContextValue | null>(null);

export function RevenueTrackingProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<Filters>({});
  const [theme, setTheme] = useState<ThemePreference>("light");
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>("light");

  useEffect(() => {
    if (theme !== "system" || typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemTheme(mediaQuery.matches ? "dark" : "light");

    const handleChange = (event: MediaQueryListEvent) => {
      setSystemTheme(event.matches ? "dark" : "light");
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const resolvedTheme: ResolvedTheme = theme === "system" ? systemTheme : theme;

  return (
    <RevenueTrackingContext.Provider
      value={{ filters, setFilters, theme, setTheme, resolvedTheme }}
    >
      {children}
    </RevenueTrackingContext.Provider>
  );
}

export function useRevenueTracking() {
  const ctx = useContext(RevenueTrackingContext);
  if (!ctx) {
    throw new Error("useRevenueTracking must be used inside <RevenueTrackingProvider>");
  }
  return ctx;
}
