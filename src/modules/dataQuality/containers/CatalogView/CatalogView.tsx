"use client";

import { useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { message } from "antd";

import { createCatalog, deleteCatalog, editCatalog } from "@/services/dataQuality/dataQuality";
import { useAppStore } from "@/lib/store/store";
import { useCatalogsDataQuality } from "../../hooks/useCatalogsDataQuality";

import Header from "@/components/organisms/header";
import UiTab from "@/components/ui/ui-tab";
import { CatalogsTable } from "../../components/CatalogsTable";
import ModalAddEditCatalog, {
  CatalogFormData
} from "../../components/ModalAddEditCatalog/ModalAddEditCatalog";
import { ModalConfirmAction } from "@/components/molecules/modals/ModalConfirmAction/ModalConfirmAction";

import { IGetCatalogs, ICreateCatalogRequest } from "@/types/dataQuality/IDataQuality";
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

  const [mode, setMode] = useState<"create" | "edit">("create");
  const [selectedCatalog, setSelectedCatalog] = useState<IGetCatalogs | null>(null);
  const [whichModalOpen, setWhichModalOpen] = useState({ selected: 0 });
  const [isLoadingAction, setIsLoadingAction] = useState(false);

  const {
    data: catalogData,
    isLoading,
    mutate
  } = useCatalogsDataQuality(projectId, clientId, countryId);

  const handleEdit = (item: IGetCatalogs) => {
    setMode("edit");
    setSelectedCatalog(item);
    setWhichModalOpen({ selected: 1 });
  };

  const handleSave = async (data: CatalogFormData) => {
    const modelData: ICreateCatalogRequest = {
      id_client: Number(clientId),
      id_country: Number(countryId),
      customer_product_cod: data.customer_product_cod,
      customer_product_description: data.customer_product_description,
      product_type: Number(data.product_type),
      type_vol: Number(data.type_vol),
      material_code: Number(data.material_code),
      factor: data.factor
    };
    setIsLoadingAction(true);
    try {
      if (mode === "create") {
        await createCatalog(modelData);
        mutate();
        message.success("Catálogo creado exitosamente");
      } else {
        if (!selectedCatalog) return;
        await editCatalog(selectedCatalog.id, modelData);
        mutate();
        message.success("Catálogo actualizado exitosamente");
      }
      setWhichModalOpen({ selected: 0 });
      setSelectedCatalog(null);
    } catch (error) {
      message.error(
        mode === "create" ? "Error al crear el catálogo" : "Error al actualizar el catálogo"
      );
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleAddNew = () => {
    setMode("create");
    setSelectedCatalog(null);
    setWhichModalOpen({ selected: 1 });
  };

  const handleClose = () => {
    setWhichModalOpen({ selected: 0 });
    setSelectedCatalog(null);
  };

  const handleDeleteCatalog = async (catalog: IGetCatalogs) => {
    setIsLoadingAction(true);
    try {
      await deleteCatalog(catalog.id);
      mutate();
      message.success("Catálogo eliminado exitosamente");
      setWhichModalOpen({ selected: 0 });
      setSelectedCatalog(null);
    } catch (error) {
      message.error("Error al eliminar el catálogo");
    } finally {
      setIsLoadingAction(false);
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
              key: "productos",
              label: "Productos",
              children: (
                <CatalogsTable
                  equivalencies={catalogData ?? []}
                  clientName={clientName || ""}
                  onEdit={handleEdit}
                  onAddNew={handleAddNew}
                  onDelete={(item) => {
                    setSelectedCatalog(item);
                    setWhichModalOpen({ selected: 2 });
                  }}
                />
              )
            },
            {
              key: "packs",
              label: "Packs",
              children: <div />
            },
            {
              key: "puntos-de-venta",
              label: "Puntos de venta",
              children: <div />
            }
          ]}
        />
      </Card>

      <ModalAddEditCatalog
        isOpen={whichModalOpen.selected === 1}
        onClose={handleClose}
        mode={mode}
        catalogData={selectedCatalog}
        onSave={handleSave}
        isLoadingCreateEdit={isLoadingAction}
        countryId={Number(countryId) || 0}
      />

      <ModalConfirmAction
        isOpen={whichModalOpen.selected === 2}
        onClose={() => {
          setWhichModalOpen({ selected: 0 });
        }}
        onOk={() => {
          if (selectedCatalog) handleDeleteCatalog(selectedCatalog);
        }}
        title="¿Está seguro de eliminar?"
        okText="Eliminar"
        okLoading={isLoadingAction}
      />
    </div>
  );
}
