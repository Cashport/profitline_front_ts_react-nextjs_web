"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { message } from "antd";

import { createCatalog, deleteCatalog, editCatalog } from "@/services/dataQuality/dataQuality";
import { useAppStore } from "@/lib/store/store";
import { useCatalogsDataQuality } from "../../hooks/useCatalogsDataQuality";

import Header from "@/components/organisms/header";
import { CatalogsTable } from "../../components/CatalogsTable";
import ModalAddEditCatalog, {
  CatalogFormData
} from "../../components/ModalAddEditCatalog/ModalAddEditCatalog";
import { ModalConfirmAction } from "@/components/molecules/modals/ModalConfirmAction/ModalConfirmAction";

import { IGetCatalogs, ICreateCatalogRequest } from "@/types/dataQuality/IDataQuality";

export default function CatalogView() {
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
    <div className="flex flex-col gap-4">
      <Header title="Catálogo de Equivalencias" />
      {/* Main Content */}
      <main>
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
