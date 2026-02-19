"use client";

import { useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Pagination } from "antd";
import { Badge } from "@/modules/chat/ui/badge";
import { Button } from "@/modules/chat/ui/button";
import UiSearchInput from "@/components/ui/search-input";
import { GenerateActionButton } from "@/components/atoms/GenerateActionButton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/modules/chat/ui/table";
import { IGetCatalogs } from "@/types/dataQuality/IDataQuality";

interface CatalogsTableProps {
  equivalencies: IGetCatalogs[];
  clientName: string;
  onEdit: (item: IGetCatalogs) => void;
  onAddNew: () => void;
  onDelete: (item: IGetCatalogs) => void;
}

export function CatalogsTable({
  equivalencies,
  clientName,
  onEdit,
  onAddNew,
  onDelete
}: CatalogsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  const filteredEquivalencies = equivalencies.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      item.customer_product_cod.toLowerCase().includes(term) ||
      item.customer_product_description.toLowerCase().includes(term) ||
      item.material_name.toLowerCase().includes(term)
    );
  });

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEquivalencies = filteredEquivalencies.slice(startIndex, startIndex + itemsPerPage);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4 pb-4 ">
        <div className="flex items-center gap-3">
          <UiSearchInput
            placeholder="Buscar por ID"
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          <GenerateActionButton />
        </div>
        <Button
          onClick={onAddNew}
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
      <Table>
        <TableHeader>
          <TableRow style={{ borderColor: "#DDDDDD" }}>
            <TableHead style={{ color: "#141414" }}>Código Cliente</TableHead>
            <TableHead style={{ color: "#141414" }}>Producto Cliente</TableHead>
            <TableHead style={{ color: "#141414" }}>SKU</TableHead>
            <TableHead style={{ color: "#141414" }}>Nombre Producto</TableHead>
            <TableHead style={{ color: "#141414" }}>Estado</TableHead>
            <TableHead style={{ color: "#141414" }}>Fecha Actualización</TableHead>
            <TableHead style={{ color: "#141414" }}>Usuario</TableHead>
            <TableHead style={{ color: "#141414" }}>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedEquivalencies.map((item) => (
            <TableRow key={item.id} className="hover:bg-gray-50" style={{ borderColor: "#DDDDDD" }}>
              <TableCell>
                <span className="font-medium" style={{ color: "#141414" }}>
                  {item.customer_product_cod}
                </span>
              </TableCell>
              <TableCell>
                <span style={{ color: "#141414" }}>{item.customer_product_description}</span>
              </TableCell>
              <TableCell>
                <span style={{ color: "#141414" }}>-</span>
              </TableCell>
              <TableCell>
                <span style={{ color: "#141414" }}>{item.material_name}</span>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="text-xs">
                  {item.status}
                </Badge>
              </TableCell>
              <TableCell>
                <span style={{ color: "#141414" }}>-</span>
              </TableCell>
              <TableCell>
                <span style={{ color: "#141414" }}>-</span>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(item)}
                    title="Editar equivalencia"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onDelete(item)} title="Eliminar">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div
        className="mt-4 pt-4 border-t flex items-center justify-between"
        style={{ borderColor: "#DDDDDD" }}
      >
        <div className="text-sm" style={{ color: "#141414" }}>
          Mostrando {paginatedEquivalencies.length} de {filteredEquivalencies.length} productos
        </div>
        <Pagination
          current={currentPage}
          onChange={(page) => setCurrentPage(page)}
          total={filteredEquivalencies.length}
          pageSize={itemsPerPage}
          showSizeChanger={false}
        />
      </div>
    </div>
  );
}
