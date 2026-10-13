import { Suspense } from "react";
import ProfitLoader from "@/components/ui/profit-loader";
import MarketAdminClientDetail from "@/modules/marketAdmin/containers/market-admin-client-detail/MarketAdminClientDetail";

export default function Page({ params }: { params: { id: string } }) {
  // El detalle lee `?codigo=` con useSearchParams, que exige un límite de Suspense.
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <ProfitLoader />
        </div>
      }
    >
      <MarketAdminClientDetail params={params} />
    </Suspense>
  );
}