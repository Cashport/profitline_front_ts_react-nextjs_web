"use client";

import { createContext, useContext, ReactNode } from "react";
import useSWR from "swr";
import { getProfit360Filters } from "@/services/reverseLogistics/reverseLogistics";
import { IProfit360Filters, IProfit360FilterItem } from "@/types/reverseLogistics/IReverseLogistics";

interface Profit360FiltersContextValue {
  clientes: IProfit360FilterItem[];
  estados: IProfit360FilterItem[];
  causales: IProfit360FilterItem[];
  isLoading: boolean;
  error: Error | undefined;
  // Re-fetch when the user lands on a screen that needs fresher picklist data
  // (e.g. after creating a new cliente). Cheap and idempotent on the server.
  refresh: () => void;
}

const EMPTY_FILTERS: IProfit360Filters = {
  clientes: [],
  estados: [],
  causales: []
};

const Profit360FiltersContext = createContext<Profit360FiltersContextValue | null>(null);

// Single SWR key shared across every consumer — the filters are picklists
// that change rarely, so we dedupe and let SWR cache them at module level.
const FILTERS_SWR_KEY = ["reverse-logistics/profit360-filters"];

export function Profit360FiltersProvider({ children }: { children: ReactNode }) {
  const { data, error, isLoading, mutate } = useSWR<IProfit360Filters>(
    FILTERS_SWR_KEY,
    () => getProfit360Filters(),
    {
      revalidateOnFocus: false,
      // Picklist is stable — re-fetch at most every 5 minutes when stale.
      dedupingInterval: 5 * 60 * 1000
    }
  );

  console.log(data)

  const value: Profit360FiltersContextValue = {
    clientes: data?.clientes ?? EMPTY_FILTERS.clientes,
    estados: data?.estados ?? EMPTY_FILTERS.estados,
    causales: data?.causales ?? EMPTY_FILTERS.causales,
    isLoading,
    error,
    refresh: () => {
      void mutate();
    }
  };

  return (
    <Profit360FiltersContext.Provider value={value}>
      {children}
    </Profit360FiltersContext.Provider>
  );
}

export function useProfit360Filters() {
  const ctx = useContext(Profit360FiltersContext);
  if (!ctx) {
    throw new Error(
      "useProfit360Filters must be used inside <Profit360FiltersProvider>"
    );
  }
  return ctx;
}
