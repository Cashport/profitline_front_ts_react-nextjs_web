"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Plus, Edit, Trash2, ChevronUp, ChevronDown } from "lucide-react";

import { usePacksDataQuality } from "../../hooks/usePacksDataQuality";
import { createMaterialPack, editMaterialPackRow } from "@/services/dataQuality/dataQuality";

import UiSearchInput from "@/components/ui/search-input";
import { Button } from "@/modules/chat/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/modules/chat/ui/table";
import ModalAddEditPackMaterial, {
  PackMaterialFormData
} from "../ModalAddEditPackMaterial/ModalAddEditPackMaterial";

import { IMaterialPackMaterial, IPackMaterialRequest } from "@/types/dataQuality/IDataQuality";

export function CatalogPacksTable() {
  const params = useParams();
  const countryId = params.countryId as string;
  const clientId = params.clientId as string;

  const { data: packs, mutate } = usePacksDataQuality(clientId, countryId);

  const [packSearch, setPackSearch] = useState("");
  const [expandedPacks, setExpandedPacks] = useState<Set<number>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedPackId, setSelectedPackId] = useState<number | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<IMaterialPackMaterial | null>(null);
  const [isLoadingSave, setIsLoadingSave] = useState(false);

  const filteredPacks = (packs ?? []).filter((pack) => {
    const term = packSearch.toLowerCase();
    return (
      pack.customerProductCod.toLowerCase().includes(term) ||
      pack.clientName.toLowerCase().includes(term) ||
      pack.materials.some((m) => m.materialCode.toLowerCase().includes(term))
    );
  });

  const togglePackExpand = (packId: number) => {
    setExpandedPacks((prev) => {
      const next = new Set(prev);
      if (next.has(packId)) {
        next.delete(packId);
      } else {
        next.add(packId);
      }
      return next;
    });
  };

  const handleAddMaterialToPack = (packId: number) => {
    setSelectedPackId(packId);
    setSelectedMaterial(null);
    setModalMode("create");
    setModalOpen(true);
  };

  const handleMaterialEdit = (packId: number, material: IMaterialPackMaterial) => {
    setSelectedPackId(packId);
    setSelectedMaterial(material);
    setModalMode("edit");
    setModalOpen(true);
  };

  const handleMaterialDelete = (_packId: number, _idCatalogMaterial: number) => {
    // TODO: implement when CRUD endpoint is available
  };

  const handleModalSave = async (data: PackMaterialFormData) => {
    setIsLoadingSave(true);
    try {
      const payload: IPackMaterialRequest = {
        product_type: Number(data.product_type),
        type_vol: Number(data.type_vol),
        id_catalog_material: Number(data.material_code),
        factor: data.factor
      };
      if (modalMode === "create") {
        if (!selectedPackId) return;
        await createMaterialPack(selectedPackId, payload);
      } else {
        if (!selectedMaterial) return;
        await editMaterialPackRow(selectedMaterial?.materialPackId, payload);
      }
      mutate();
      setModalOpen(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingSave(false);
    }
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between pb-4 gap-2">
        <div className="flex items-center gap-3">
          <UiSearchInput
            placeholder="Buscar"
            onChange={(e) => {
              setPackSearch(e.target.value);
            }}
          />
        </div>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow style={{ borderColor: "#DDDDDD" }}>
            <TableHead className="w-10" />
            <TableHead style={{ color: "#141414", fontWeight: 600 }}>Id Cliente</TableHead>
            <TableHead style={{ color: "#141414", fontWeight: 600 }}>Nombre Pack</TableHead>
            <TableHead style={{ color: "#141414", fontWeight: 600 }}>SKU</TableHead>
            <TableHead style={{ color: "#141414", fontWeight: 600 }}>Nombre Producto</TableHead>
            <TableHead style={{ color: "#141414", fontWeight: 600 }}>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredPacks.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                No hay packs configurados.
              </TableCell>
            </TableRow>
          )}
          {filteredPacks.map((pack) => {
            const isExpanded = expandedPacks.has(pack.idCatalogMaterialAux);
            const firstMaterial = pack.materials[0];
            const remainingMaterials = pack.materials.slice(1);

            return (
              <>
                {/* Pack main row (shows first material inline) */}
                <TableRow
                  key={pack.idCatalogMaterialAux}
                  className="hover:bg-gray-50"
                  style={{ borderColor: "#DDDDDD" }}
                >
                  <TableCell className="w-10">
                    {pack.materials.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-0 h-6 w-6"
                        onClick={() => togglePackExpand(pack.idCatalogMaterialAux)}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                  </TableCell>
                  <TableCell className="font-medium" style={{ color: "#141414" }}>
                    {pack.customerProductCod}
                  </TableCell>
                  <TableCell style={{ color: "#141414" }}>{pack.clientName}</TableCell>
                  <TableCell className="text-sm" style={{ color: "#141414" }}>
                    {firstMaterial?.materialCode || "-"}
                  </TableCell>
                  <TableCell style={{ color: "#141414" }}>
                    {firstMaterial?.materialName || "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAddMaterialToPack(pack.idCatalogMaterialAux)}
                        title="Agregar"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                      {firstMaterial && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleMaterialEdit(pack.idCatalogMaterialAux, firstMaterial)
                          }
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                      {firstMaterial && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleMaterialDelete(
                              pack.idCatalogMaterialAux,
                              firstMaterial.idCatalogMaterial
                            )
                          }
                          title="Eliminar"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>

                {/* Expanded material rows */}
                {isExpanded &&
                  remainingMaterials.map((material) => (
                    <TableRow
                      key={material.idCatalogMaterial}
                      className="bg-gray-50/60"
                      style={{ borderColor: "#EEEEEE" }}
                    >
                      <TableCell />
                      <TableCell />
                      <TableCell />
                      <TableCell className="text-sm" style={{ color: "#141414" }}>
                        {material.materialCode}
                      </TableCell>
                      <TableCell style={{ color: "#141414" }}>{material.materialName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMaterialEdit(pack.idCatalogMaterialAux, material)}
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleMaterialDelete(
                                pack.idCatalogMaterialAux,
                                material.idCatalogMaterial
                              )
                            }
                            title="Eliminar"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </>
            );
          })}
        </TableBody>
      </Table>

      <div className="mt-4 pt-4 border-t text-sm text-gray-600" style={{ borderColor: "#DDDDDD" }}>
        Mostrando {filteredPacks.length} packs con{" "}
        {filteredPacks.reduce((acc, p) => acc + p.materials.length, 0)} productos
      </div>

      <ModalAddEditPackMaterial
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={modalMode}
        materialData={selectedMaterial}
        onSave={handleModalSave}
        countryId={Number(countryId)}
        isLoadingCreateEdit={isLoadingSave}
      />
    </div>
  );
}
