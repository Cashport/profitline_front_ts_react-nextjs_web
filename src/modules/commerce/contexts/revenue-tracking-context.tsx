"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type FilterOption = { id: string; name: string };
type Filters = Record<string, FilterOption[]>;

interface RevenueTrackingContextValue {
  filters: Filters;
  setFilters: (filters: Filters) => void;
  /**
   * Toggle de IVA del dashboard. Por defecto el dashboard reporta NETO (sin IVA),
   * que es el criterio con el que comercial lee las ventas; al encenderlo el back
   * devuelve `mo.total` tal cual (con IVA).
   */
  includeIva: boolean;
  setIncludeIva: (includeIva: boolean) => void;
}

const RevenueTrackingContext = createContext<RevenueTrackingContextValue | null>(null);

export function RevenueTrackingProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<Filters>({});
  const [includeIva, setIncludeIva] = useState(false);

  return (
    <RevenueTrackingContext.Provider value={{ filters, setFilters, includeIva, setIncludeIva }}>
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
