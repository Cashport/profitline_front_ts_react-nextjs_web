"use client";

import { DashboardHeader } from "@/modules/dataQuality/components/Dashboard/DashboardHeader";
import { DataExplorationCard } from "@/modules/dataQuality/components/Dashboard/DataExplorationCard/DataExplorationCard";
import { DashboardKPICards } from "@/modules/dataQuality/components/Dashboard/DashboardKPICards/DashboardKPICards";
import { NovedadesChart } from "@/modules/dataQuality/components/Dashboard/NovedadesChart/NovedadesChart";
import { DashboardIngestionStatus } from "@/modules/dataQuality/components/Dashboard/DashboardIngestionStatus/DashboardIngestionStatus";
import { PeriodicityChart } from "@/modules/dataQuality/components/Dashboard/PeriodicityChart/PeriodicityChart";
import {
  DataQualityDashboardProvider,
  useDataQualityDashboardContext
} from "@/modules/dataQuality/context/DataQualityDashboardContext";

function DashboardContent() {
  const { activeTab } = useDataQualityDashboardContext();

  return (
    <div className="flex flex-col gap-4">
      <DashboardHeader />
      {activeTab === "resumen" ? (
        <>
          <div className="grid grid-cols-2 gap-6 items-stretch">
            <DashboardKPICards />
            <NovedadesChart />
          </div>
          <DashboardIngestionStatus />
          <PeriodicityChart />
        </>
      ) : (
        <DataExplorationCard />
      )}
    </div>
  );
}

export default function DataQualityDashboardView() {
  return (
    <DataQualityDashboardProvider>
      <DashboardContent />
    </DataQualityDashboardProvider>
  );
}
