"use client";

import { createContext, useContext, useMemo, useState, ReactNode } from "react";

export type TabType = "resumen" | "detalle";

interface DashboardFiltersContextValue {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  selectedCountry: string;
  setSelectedCountry: (id: string) => void;
  selectedPeriod: string;
  setSelectedPeriod: (period: string) => void;
  selectedFileType: string;
  setSelectedFileType: (type: string) => void;
}

const DashboardFiltersContext = createContext<DashboardFiltersContextValue | null>(null);

const getCurrentPeriodId = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

export function DashboardFiltersProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<TabType>("resumen");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState(getCurrentPeriodId);
  const [selectedFileType, setSelectedFileType] = useState("");

  const value = useMemo<DashboardFiltersContextValue>(
    () => ({
      activeTab,
      setActiveTab,
      selectedCountry,
      setSelectedCountry,
      selectedPeriod,
      setSelectedPeriod,
      selectedFileType,
      setSelectedFileType
    }),
    [activeTab, selectedCountry, selectedPeriod, selectedFileType]
  );

  return (
    <DashboardFiltersContext.Provider value={value}>{children}</DashboardFiltersContext.Provider>
  );
}

export function useDashboardFilters() {
  const ctx = useContext(DashboardFiltersContext);
  if (!ctx) {
    throw new Error("useDashboardFilters must be used within a DashboardFiltersProvider");
  }
  return ctx;
}
