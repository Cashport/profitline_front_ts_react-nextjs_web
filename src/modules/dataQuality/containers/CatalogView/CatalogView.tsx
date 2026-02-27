"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { message } from "antd";

import { convertMaterialToPack } from "@/services/dataQuality/dataQuality";
import { useAppStore } from "@/lib/store/store";
import { useCatalogsDataQuality } from "../../hooks/useCatalogsDataQuality";

import Header from "@/components/organisms/header";
import UiTab from "@/components/ui/ui-tab";
import { CatalogsTable } from "../../components/CatalogsTable";
import { CatalogPacksTable } from "../../components/CatalogPacksTable";
import { PointsOfSaleTable } from "../../components/PointsOfSaleTable";

import { IGetCatalogs } from "@/types/dataQuality/IDataQuality";
import { Button } from "@/modules/chat/ui/button";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/modules/chat/ui/card";

export default function CatalogView() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const countryId = params.countryId as string;
  const clientId = params.clientId as string;
  const clientName = searchParams.get("clientName");
  const countryName = searchParams.get("countryName");
  const { ID: projectId } = useAppStore((projects) => projects.selectedProject);

  const {
    data: catalogData,
    isLoading,
    mutate
  } = useCatalogsDataQuality(projectId, clientId, countryId);

  const handleMarkAsPack = async (item: IGetCatalogs) => {
    try {
      await convertMaterialToPack(item.id);
      mutate();
      message.success("Material marcado como pack exitosamente");
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message);
      }
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="flex flex-col gap-4">
      <Header title={`${countryName} - ${clientName}`} />
      {/* Main Content */}
      <Card className="border-none gap-2 p-6">
        <Button
          onClick={handleGoBack}
          variant="ghost"
          size="sm"
          className="text-gray-700 hover:text-gray-900 w-fit"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver al cliente
        </Button>
        <UiTab
          tabs={[
            {
              key: "materiales",
              label: "Materiales",
              children: (
                <CatalogsTable
                  equivalencies={catalogData ?? []}
                  clientName={clientName || ""}
                  countryId={Number(countryId) || 0}
                  clientId={Number(clientId) || 0}
                  mutate={mutate}
                  onMarkAsPack={handleMarkAsPack}
                />
              )
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
      </Card>
    </div>
  );
}
