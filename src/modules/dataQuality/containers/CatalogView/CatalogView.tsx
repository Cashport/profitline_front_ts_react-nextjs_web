"use client";

import { useParams, useSearchParams } from "next/navigation";

import Header from "@/components/organisms/header";
import UiTab from "@/components/ui/ui-tab";
import { CatalogsTable } from "../../components/CatalogsTable";
import { CatalogPacksTable } from "../../components/CatalogPacksTable";
import { PointsOfSaleTable } from "../../components/PointsOfSaleTable";

export default function CatalogView() {
  const { clientId } = useParams<{ clientId: string }>();
  const searchParams = useSearchParams();
  const clientName = searchParams.get("clientName");
  const countryName = searchParams.get("countryName");

  return (
    <div className="cp-page">
      <Header title={`${countryName} - ${clientName}`} back={`/data-quality/client/${clientId}`} />
      {/* Main Content */}
      <div className="cp-card flex flex-col gap-2 px-[18px] py-[14px]">
        <UiTab
          tabs={[
            {
              key: "materiales",
              label: "Materiales",
              children: <CatalogsTable />
            },
            {
              key: "packs",
              label: "Packs",
              children: <CatalogPacksTable />
            },
            {
              key: "puntos-de-venta",
              label: "Puntos de venta",
              children: <PointsOfSaleTable />
            }
          ]}
        />
      </div>
    </div>
  );
}
