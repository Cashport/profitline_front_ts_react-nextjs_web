import { Suspense } from "react";

import VisitsView from "@/modules/visitsModule/containers/visits-view/visits-view";

// El día se lee de la URL (?date=YYYY-MM-DD) y useSearchParams exige la frontera:
// sin ella Next no puede prerenderizar /visits.
export default function VisitsPage() {
  return (
    <Suspense
      fallback={
        <div className="h-12 w-full animate-pulse rounded-lg border border-border bg-secondary" />
      }
    >
      <VisitsView />
    </Suspense>
  );
}
