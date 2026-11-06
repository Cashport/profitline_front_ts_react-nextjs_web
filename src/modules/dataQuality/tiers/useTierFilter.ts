import { useEffect } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { TierFilterCode } from "./tiers";

interface TierFilterState {
  selected: TierFilterCode[];
  toggle: (code: TierFilterCode) => void;
  setSelected: (codes: TierFilterCode[]) => void;
  clear: () => void;
}

const sessionSafeStorage = createJSONStorage(() =>
  typeof window !== "undefined"
    ? sessionStorage
    : { getItem: () => null, setItem: () => {}, removeItem: () => {} }
);

/**
 * Tier quick filter shared by every Data Quality screen: choosing "Oro" on the
 * countries overview keeps it when the user opens a country, the alerts or the
 * dashboard. Lives in sessionStorage so a new session starts unfiltered.
 */
export const useTierFilter = create<TierFilterState>()(
  persist(
    (set) => ({
      selected: [],
      toggle: (code) =>
        set((state) => ({
          selected: state.selected.includes(code)
            ? state.selected.filter((c) => c !== code)
            : [...state.selected, code]
        })),
      setSelected: (codes) => set({ selected: codes }),
      clear: () => set({ selected: [] })
    }),
    { name: "dq-tier-filter", storage: sessionSafeStorage, skipHydration: true }
  )
);

/** Rehydrates after mount so the server render and the first client render match. */
export const useTierFilterHydration = () => {
  useEffect(() => {
    useTierFilter.persist.rehydrate();
  }, []);
};
