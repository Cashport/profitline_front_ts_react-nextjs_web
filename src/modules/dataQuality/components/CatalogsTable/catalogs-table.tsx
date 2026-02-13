"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, Filter } from "lucide-react";
import { Pagination } from "antd";
import { Badge } from "@/modules/chat/ui/badge";
import { Button } from "@/modules/chat/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/modules/chat/ui/card";
import { Input } from "@/modules/chat/ui/input";
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

const getStatusBadge = (status: string) => {
  switch (status) {
    case "active":
      return (
        <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
          Activo
        </Badge>
      );
    case "audit":
      return (
        <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
          Por auditar
        </Badge>
      );
    case "unmapped":
      return (
        <Badge variant="destructive" className="text-xs">
          Sin mapear
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="text-xs">
          Desconocido
        </Badge>
      );
  }
};

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
    <>
      {/* Filters Card */}
      <div className="mb-6">
        <Card className="border-none">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              {/* Search bar */}
              <div className="relative flex-1 max-w-md">
                <Plus
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
                  style={{ color: "#141414" }}
                />
                <Input
                  placeholder="Buscar producto..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                  style={{ borderColor: "#DDDDDD" }}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4" style={{ color: "#141414" }} />
                <span className="text-sm font-medium" style={{ color: "#141414" }}>
                  Filtros:
                </span>
              </div>
              <div className="text-sm" style={{ color: "#141414" }}>
                Mostrando {paginatedEquivalencies.length} de {filteredEquivalencies.length}{" "}
                productos
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Equivalencies Table */}
      <Card className="border-none">
        <CardHeader>
          <CardTitle className="text-lg" style={{ color: "#141414" }}>
            Equivalencias de Productos - {clientName}
          </CardTitle>
        </CardHeader>
        <CardContent>
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
                <TableRow
                  key={item.id}
                  className="hover:bg-gray-50"
                  style={{ borderColor: "#DDDDDD" }}
                >
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
                  <TableCell>{getStatusBadge("-")}</TableCell>
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(item)}
                        title="Eliminar"
                      >
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
            <Pagination
              current={currentPage}
              onChange={(page) => setCurrentPage(page)}
              total={filteredEquivalencies.length}
              pageSize={itemsPerPage}
              showSizeChanger={false}
            />

            <Button
              onClick={onAddNew}
              variant="outline"
              className="bg-transparent"
              style={{ borderColor: "#DDDDDD", color: "#141414" }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar registro
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
