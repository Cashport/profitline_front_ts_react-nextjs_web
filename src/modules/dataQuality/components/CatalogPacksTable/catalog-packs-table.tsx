"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Plus, Edit, Trash2, ChevronUp, ChevronDown } from "lucide-react";

import { usePacksDataQuality } from "../../hooks/usePacksDataQuality";

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

import { IMaterialPackMaterial } from "@/types/dataQuality/IDataQuality";

export function CatalogPacksTable() {
  const params = useParams();
  const countryId = params.countryId as string;
  const clientId = params.clientId as string;

  const { data: packs } = usePacksDataQuality(clientId, countryId);

  const [packSearch, setPackSearch] = useState("");
  const [expandedPacks, setExpandedPacks] = useState<Set<number>>(new Set());

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

  const handlePackAddNew = () => {
    // TODO: implement when CRUD endpoint is available
  };

  const handleSkuAdd = (_packId: number) => {
    // TODO: implement when CRUD endpoint is available
  };

  const handleSkuEdit = (_packId: number, _material: IMaterialPackMaterial) => {
    // TODO: implement when CRUD endpoint is available
  };

  const handleSkuDelete = (_packId: number, _idCatalogMaterial: number) => {
    // TODO: implement when CRUD endpoint is available
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
        <Button
          onClick={handlePackAddNew}
          className="text-sm font-medium"
          style={{ backgroundColor: "#CBE71E", color: "#141414", border: "none" }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Pack
        </Button>
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
            const isExpanded = expandedPacks.has(pack.id);
            const firstMaterial = pack.materials[0];
            const remainingMaterials = pack.materials.slice(1);

            return (
              <>
                {/* Pack main row (shows first material inline) */}
                <TableRow
                  key={pack.id}
                  className="hover:bg-gray-50"
                  style={{ borderColor: "#DDDDDD" }}
                >
                  <TableCell className="w-10">
                    {pack.materials.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-0 h-6 w-6"
                        onClick={() => togglePackExpand(pack.id)}
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
                        onClick={() => handleSkuAdd(pack.id)}
                        title="Agregar SKU"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                      {firstMaterial && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSkuEdit(pack.id, firstMaterial)}
                          title="Editar SKU"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                      {firstMaterial && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSkuDelete(pack.id, firstMaterial.idCatalogMaterial)}
                          title="Quitar material"
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
                            onClick={() => handleSkuEdit(pack.id, material)}
                            title="Editar SKU"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSkuDelete(pack.id, material.idCatalogMaterial)}
                            title="Quitar SKU"
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
    </div>
  );
}
