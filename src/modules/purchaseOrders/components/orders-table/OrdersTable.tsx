"use client";

import { Eye, ArrowUpDown, AlertCircle, FileText, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/modules/chat/ui/badge";
import { Button } from "@/modules/chat/ui/button";
import { Checkbox } from "@/modules/chat/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/modules/chat/ui/tooltip";
import type { InvoiceData } from "../../context/app-context";

const documentStateConfig = [
  { name: "Novedad", color: "#E53935", icon: XCircle, textColor: "text-white" },
  { name: "En validación", color: "#2196F3", icon: CheckCircle, textColor: "text-white" },
  { name: "En aprobaciones", color: "#9C27B0", icon: CheckCircle, textColor: "text-white" },
  { name: "En facturación", color: "#FFC107", icon: FileText, textColor: "text-black" },
  { name: "Facturado", color: "#4CAF50", icon: CheckCircle, textColor: "text-white" },
  { name: "En despacho", color: "#009688", icon: CheckCircle, textColor: "text-white" },
  { name: "Entregado", color: "#2E7D32", icon: CheckCircle, textColor: "text-white" },
  { name: "Back order", color: "#000000", icon: XCircle, textColor: "text-white" }
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0
  }).format(amount);
};

const formatDate = (dateString: string) => {
  if (!dateString) return { date: "-", time: "" };

  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return {
    date: `${day}/${month}/${year}`,
    time: `${hours}:${minutes}`
  };
};

interface OrdersTableProps {
  invoices: InvoiceData[];
  selectedInvoiceIds: string[];
  sortColumn: string | null;
  sortDirection: "asc" | "desc";
  onSort: (column: string) => void;
  onRowClick: (invoice: InvoiceData) => void;
  onToggleSelection: (id: string) => void;
  onSelectAll: (checked: boolean) => void;
  isAllSelected: boolean;
  isIndeterminate: boolean;
}

export function OrdersTable({
  invoices,
  selectedInvoiceIds,
  sortColumn,
  sortDirection,
  onSort,
  onRowClick,
  onToggleSelection,
  onSelectAll,
  isAllSelected,
  isIndeterminate
}: OrdersTableProps) {
  return (
    <table className="w-full">
      <thead className="bg-white border-b border-gray-200">
        <tr>
          <th className="text-left p-4 font-bold text-black w-12">
            <Checkbox
              checked={isIndeterminate ? "indeterminate" : isAllSelected}
              onCheckedChange={onSelectAll}
            />
          </th>
          <th className="text-left p-4 font-bold text-black">
            <button
              onClick={() => onSort("autoId")}
              className="flex items-center gap-1 hover:text-gray-600 transition-colors"
            >
              ID
              <ArrowUpDown className="h-3 w-3" />
            </button>
          </th>
          <th className="text-left p-4 font-bold text-black">
            <button
              onClick={() => onSort("id")}
              className="flex items-center gap-1 hover:text-gray-600 transition-colors"
            >
              Orden de compra
              <ArrowUpDown className="h-3 w-3" />
            </button>
          </th>
          <th className="text-left p-4 font-bold text-black">
            <button
              onClick={() => onSort("comprador")}
              className="flex items-center gap-1 hover:text-gray-600 transition-colors"
            >
              Cliente
              <ArrowUpDown className="h-3 w-3" />
            </button>
          </th>
          <th className="text-left p-4 font-bold text-black">
            <button
              onClick={() => onSort("entrega")}
              className="flex items-center gap-1 hover:text-gray-600 transition-colors"
            >
              Entrega
              <ArrowUpDown className="h-3 w-3" />
            </button>
          </th>
          <th className="text-left p-4 font-bold text-black">
            <button
              onClick={() => onSort("estado")}
              className="flex items-center gap-1 hover:text-gray-600 transition-colors"
            >
              Estado
              <ArrowUpDown className="h-3 w-3" />
            </button>
          </th>
          <th className="text-left p-4 font-bold text-black">Factura</th>
          <th className="text-right p-4 font-bold text-black">
            <button
              onClick={() => onSort("productos")}
              className="flex items-center justify-end gap-1 hover:text-gray-600 transition-colors w-full"
            >
              Productos
              <ArrowUpDown className="h-3 w-3" />
            </button>
          </th>
          <th className="text-right p-4 font-bold text-black w-28">
            <button
              onClick={() => onSort("monto")}
              className="flex items-center justify-end gap-1 hover:text-gray-600 transition-colors w-full"
            >
              Monto
              <ArrowUpDown className="h-3 w-3" />
            </button>
          </th>
          <th className="p-4 w-16"></th>
        </tr>
      </thead>
      <tbody>
        {invoices.map((invoice) => {
          const estadoConfig = documentStateConfig.find((s) => s.name === invoice.estado);

          return (
            <tr
              key={invoice.id}
              className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <td className="p-4" onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={selectedInvoiceIds.includes(invoice.id)}
                  onCheckedChange={() => onToggleSelection(invoice.id)}
                />
              </td>
              <td className="p-4">
                <button
                  onClick={() => onRowClick(invoice)}
                  className="text-blue-500 hover:text-blue-700 hover:underline cursor-pointer transition-colors"
                >
                  {invoice.autoId}
                </button>
              </td>
              <td className="p-4">
                <div className="flex flex-col">
                  <span className="text-cashport-black">{invoice.id}</span>
                  <span className="text-xs text-gray-500">
                    {formatDate(invoice.fechaFactura).date}
                  </span>
                </div>
              </td>
              <td className="p-4 text-gray-700 max-w-64">
                <div className="flex flex-col">
                  <span className="truncate" title={invoice.comprador}>
                    {invoice.comprador}
                  </span>
                  <span
                    className="text-xs text-gray-500 truncate"
                    title={
                      invoice.ciudad && invoice.direccion
                        ? `${invoice.ciudad} - ${invoice.direccion}`
                        : ""
                    }
                  >
                    {invoice.ciudad && invoice.direccion
                      ? `${invoice.ciudad} - ${invoice.direccion}`
                      : ""}
                  </span>
                </div>
              </td>
              <td className="p-4 text-gray-700">
                {invoice.fechaEntrega ? (
                  <div className="flex flex-col">
                    <span>{formatDate(invoice.fechaEntrega).date}</span>
                    <span className="text-xs text-gray-500">
                      {formatDate(invoice.fechaEntrega).time}
                    </span>
                  </div>
                ) : (
                  "-"
                )}
              </td>
              <td className="p-4">
                <div className="flex items-center gap-2">
                  {invoice.estado === "Novedad" && invoice.tipoNovedad ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-1 cursor-help">
                            <Badge
                              className={`${estadoConfig?.textColor || "text-white"}`}
                              style={{
                                backgroundColor: estadoConfig?.color || "#B0BEC5"
                              }}
                            >
                              {invoice.estado}
                            </Badge>
                            <AlertCircle className="h-4 w-4 text-orange-500" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent
                          side="right"
                          className="bg-gray-900 text-white p-3 max-w-xs"
                        >
                          <div className="space-y-1">
                            <div className="font-semibold text-sm">Tipo de novedad:</div>
                            <div className="text-sm">{invoice.tipoNovedad}</div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <Badge
                      className={`${estadoConfig?.textColor || "text-white"}`}
                      style={{ backgroundColor: estadoConfig?.color || "#B0BEC5" }}
                    >
                      {invoice.estado}
                    </Badge>
                  )}
                </div>
              </td>
              <td className="p-4 text-gray-700">
                {(invoice.estado === "Entregado" ||
                  invoice.estado === "Facturado" ||
                  invoice.estado === "En despacho") &&
                invoice.factura &&
                invoice.factura.length > 0 ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help">
                          {invoice.factura[0]}
                          {invoice.factura.length > 1 && (
                            <span className="ml-1.5 text-xs text-gray-600 border border-gray-300 rounded px-1.5 py-0.5 bg-gray-50">
                              +{invoice.factura.length - 1}
                            </span>
                          )}
                        </span>
                      </TooltipTrigger>
                      {invoice.factura.length > 1 && (
                        <TooltipContent
                          side="right"
                          className="bg-gray-900 text-white p-3 max-w-xs"
                        >
                          <div className="space-y-1">
                            {invoice.factura.map((factura, idx) => (
                              <div key={idx} className="text-sm">
                                {factura}
                              </div>
                            ))}
                          </div>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  "-"
                )}
              </td>
              <td className="p-4 text-right text-cashport-black">{invoice.cantidad}</td>
              <td className="p-4 text-right text-cashport-black w-28">
                {formatCurrency(invoice.monto)}
              </td>
              <td className="p-4 text-right">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-md border-gray-300 hover:bg-gray-100 bg-transparent"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRowClick(invoice);
                  }}
                >
                  <Eye className="h-4 w-4 text-gray-600" />
                </Button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
