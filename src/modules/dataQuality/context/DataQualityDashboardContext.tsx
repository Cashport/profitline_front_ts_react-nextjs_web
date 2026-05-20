"use client";

import { createContext, useContext, useMemo, useState, ReactNode } from "react";

export type TabType = "resumen" | "detalle";

interface DataQualityDashboardContextValue {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  selectedCountry: string;
  setSelectedCountry: (id: string) => void;
  selectedPeriod: string;
  setSelectedPeriod: (period: string) => void;
  selectedFileType: string;
  setSelectedFileType: (type: string) => void;
}

const DataQualityDashboardContext = createContext<DataQualityDashboardContextValue | null>(null);

const getCurrentPeriodId = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

export function DataQualityDashboardProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<TabType>("resumen");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState(getCurrentPeriodId);
  const [selectedFileType, setSelectedFileType] = useState("");

  const value = useMemo<DataQualityDashboardContextValue>(
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
    <DataQualityDashboardContext.Provider value={value}>
      {children}
    </DataQualityDashboardContext.Provider>
  );
}

export function useDataQualityDashboardContext() {
  const ctx = useContext(DataQualityDashboardContext);
  if (!ctx) {
    throw new Error(
      "useDataQualityDashboardContext must be used within a DataQualityDashboardProvider"
    );
  }
  return ctx;
}
