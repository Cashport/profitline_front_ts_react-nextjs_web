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
import { useDashboardSummary } from "@/modules/dataQuality/hooks/useDashboardSummary";

function DashboardContent() {
  const { activeTab, selectedPeriod, selectedCountry, selectedFileType } =
    useDataQualityDashboardContext();

  const { data: dashboardSummary } = useDashboardSummary({
    month: selectedPeriod,
    id_country: selectedCountry ? Number(selectedCountry) : undefined,
    id_type_archive: selectedFileType ? [Number(selectedFileType)] : undefined
  });

  return (
    <div className="flex flex-col gap-4">
      <DashboardHeader />
      {activeTab === "resumen" ? (
        <>
          <div className="grid grid-cols-2 gap-6 items-stretch">
            <DashboardKPICards kpis={dashboardSummary?.kpis} />
            <NovedadesChart />
          </div>
          <DashboardIngestionStatus clientStatus={dashboardSummary?.clientStatus} />
          <PeriodicityChart periodicity={dashboardSummary?.periodicity} />
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
