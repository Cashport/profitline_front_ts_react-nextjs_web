"use client";

import { DashboardHeader } from "@/modules/dataQuality/components/Dashboard/DashboardHeader";
import { DataExplorationCard } from "@/modules/dataQuality/components/Dashboard/DataExplorationCard/DataExplorationCard";

import { DashboardFiltersProvider } from "./DashboardFiltersContext";

export default function DataQualityDashboardView() {
  return (
    <DashboardFiltersProvider>
      <div className="flex flex-col gap-4">
        <DashboardHeader />
        <DataExplorationCard />
      </div>
    </DashboardFiltersProvider>
  );
}
