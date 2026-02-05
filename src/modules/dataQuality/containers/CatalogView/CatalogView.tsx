"use client";

import { useState } from "react";

import { Plus, ArrowLeft } from "lucide-react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/modules/chat/ui/button";
import { CatalogsTable } from "../../components/CatalogsTable";
import ModalAddEditCatalog from "../../components/ModalAddEditCatalog/ModalAddEditCatalog";
import { useAppStore } from "@/lib/store/store";
import { useCatalogsDataQuality } from "../../hooks/useCatalogsDataQuality";
import { IGetCatalogs } from "@/types/dataQuality/IDataQuality";

export default function CatalogView() {
  const params = useParams();
  const countryId = params.countryId as string;
  const clientId = params.clientId as string;
  const { ID: projectId } = useAppStore((projects) => projects.selectedProject);

  const [editingItem, setEditingItem] = useState<IGetCatalogs | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: catalogData, isLoading } = useCatalogsDataQuality(projectId, clientId, countryId);

  const handleEdit = (item: IGetCatalogs) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    setIsDialogOpen(false);
    setEditingItem(null);
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setIsDialogOpen(true);
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
        onClose={() => setIsDialogOpen(false)}
        editingItem={editingItem}
        setEditingItem={setEditingItem}
        onSave={handleSave}
      />
    </>
  );
}
