import { Suspense } from "react";
import DataMonitoringView from "@/modules/dataQuality/containers/DataMonitoringView/DataMonitoringView";

function Page() {
  return (
    <Suspense fallback={null}>
      <DataMonitoringView />
    </Suspense>
  );
}

export default Page;
