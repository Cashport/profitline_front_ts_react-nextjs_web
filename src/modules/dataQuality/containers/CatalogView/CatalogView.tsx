"use client";

import { useState } from "react";

import { Plus, ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { message } from "antd";
import { Button } from "@/modules/chat/ui/button";
import { CatalogsTable } from "../../components/CatalogsTable";
import ModalAddEditCatalog, {
  CatalogFormData
} from "../../components/ModalAddEditCatalog/ModalAddEditCatalog";
import { useAppStore } from "@/lib/store/store";
import { useCatalogsDataQuality } from "../../hooks/useCatalogsDataQuality";
import { createCatalog, deleteCatalog, editCatalog } from "@/services/dataQuality/dataQuality";
import { IGetCatalogs, ICreateCatalogRequest } from "@/types/dataQuality/IDataQuality";
import { ModalConfirmAction } from "@/components/molecules/modals/ModalConfirmAction/ModalConfirmAction";

export default function CatalogView() {
  const router = useRouter();
  const params = useParams();
  const countryId = params.countryId as string;
  const clientId = params.clientId as string;
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

  const handleGoBack = () => {
    router.back();
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

  return (
    <>
      {/* Main Content */}
      <main>
        {/* Page Title on Gray Background */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                className="bg-white"
                style={{ borderColor: "#DDDDDD", color: "#141414" }}
                onClick={handleGoBack}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al cliente
              </Button>
              <h1 className="text-2xl font-bold" style={{ color: "#141414" }}>
                Catálogo de Equivalencias
              </h1>
            </div>
            <Button
              onClick={handleAddNew}
              className="text-sm font-medium"
              style={{
                backgroundColor: "#CBE71E",
                color: "#141414",
                border: "none"
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nueva Equivalencia
            </Button>
          </div>
        </div>

        <CatalogsTable
          equivalencies={catalogData ?? []}
          clientName={clientId}
          onEdit={handleEdit}
          onAddNew={handleAddNew}
          onDelete={(item) => {
            setSelectedCatalog(item);
            setWhichModalOpen({ selected: 2 });
          }}
        />
      </main>

      <ModalAddEditCatalog
        isOpen={whichModalOpen.selected === 1}
        onClose={handleClose}
        mode={mode}
        catalogData={selectedCatalog}
        onSave={handleSave}
        isLoadingCreateEdit={isLoadingAction}
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
    </>
  );
}
