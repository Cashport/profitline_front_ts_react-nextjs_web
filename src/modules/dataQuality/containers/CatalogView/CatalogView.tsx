"use client";

import { useState } from "react";

import { Plus, ArrowLeft } from "lucide-react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { message } from "antd";
import { Button } from "@/modules/chat/ui/button";
import { CatalogsTable } from "../../components/CatalogsTable";
import ModalAddEditCatalog, {
  CatalogFormData
} from "../../components/ModalAddEditCatalog/ModalAddEditCatalog";
import { useAppStore } from "@/lib/store/store";
import { useCatalogsDataQuality } from "../../hooks/useCatalogsDataQuality";
import { createCatalog } from "@/services/dataQuality/dataQuality";
import { IGetCatalogs, ICreateCatalogRequest } from "@/types/dataQuality/IDataQuality";

export default function CatalogView() {
  const params = useParams();
  const countryId = params.countryId as string;
  const clientId = params.clientId as string;
  const { ID: projectId } = useAppStore((projects) => projects.selectedProject);

  const [mode, setMode] = useState<"create" | "edit">("create");
  const [selectedCatalog, setSelectedCatalog] = useState<IGetCatalogs | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: catalogData, isLoading, mutate } = useCatalogsDataQuality(projectId, clientId, countryId);

  const handleEdit = (item: IGetCatalogs) => {
    setMode("edit");
    setSelectedCatalog(item);
    setIsDialogOpen(true);
  };

  const handleSave = async (data: CatalogFormData) => {
    if (mode === "create") {
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
      try {
        await createCatalog(modelData);
        await mutate();
        setIsDialogOpen(false);
        setSelectedCatalog(null);
        message.success("Catálogo creado exitosamente");
      } catch (error) {
        message.error("Error al crear el catálogo");
      }
    } else {
      // Llamar API para actualizar
      console.log("Actualizar catálogo:", selectedCatalog?.id, data);
      setIsDialogOpen(false);
      setSelectedCatalog(null);
    }
  };

  const handleAddNew = () => {
    setMode("create");
    setSelectedCatalog(null);
    setIsDialogOpen(true);
  };

  const handleClose = () => {
    setIsDialogOpen(false);
    setSelectedCatalog(null);
  };

  return (
    <>
      {/* Main Content */}
      <main>
        {/* Page Title on Gray Background */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href={`/explorer/${countryId}/${clientId}`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white"
                  style={{ borderColor: "#DDDDDD", color: "#141414" }}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver al cliente
                </Button>
              </Link>
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
        />
      </main>

      <ModalAddEditCatalog
        isOpen={isDialogOpen}
        onClose={handleClose}
        mode={mode}
        catalogData={selectedCatalog}
        onSave={handleSave}
      />
    </>
  );
}
