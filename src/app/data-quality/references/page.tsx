import { Suspense } from "react";

import ReferencesView from "@/modules/dataQuality/containers/ReferencesView/ReferencesView";

function Page() {
  // `ReferencesView` usa `useSearchParams` (contexto pais/region/cliente):
  // Next.js exige un limite de Suspense para el render estatico de la pagina.
  return (
    <Suspense fallback={null}>
      <ReferencesView />
    </Suspense>
  );
}

export default Page;
