import { useAppStore } from "@/lib/store/store";

import Header from "@/components/organisms/header";
import { DataExplorationCard } from "@/modules/dataQuality/components/Dashboard/DataExplorationCard";

export default function DataQualityDashboardView() {
  return (
    <div className="flex flex-col gap-4">
      <Header title="Dashboard de ingesta" />
      <DataExplorationCard />
    </div>
  );
}
