"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type Filters = Record<string, string[]>;

interface RevenueTrackingContextValue {
  filters: Filters;
  setFilters: (filters: Filters) => void;
}

const RevenueTrackingContext = createContext<RevenueTrackingContextValue | null>(null);

export function RevenueTrackingProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<Filters>({});

  return (
    <RevenueTrackingContext.Provider value={{ filters, setFilters }}>
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
