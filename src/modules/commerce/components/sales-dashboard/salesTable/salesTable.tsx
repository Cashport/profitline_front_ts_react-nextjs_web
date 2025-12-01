"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight, TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/modules/chat/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/modules/chat/ui/tooltip";

type SalesData = {
  total: number;
  facturado: number;
  enProceso: number;
  cartera: number;
  borrador: number;
  cuota: number;
  avance: number;
  faltante: number;
  topProducts: { name: string; sales: number }[];
};

type Vendedor = {
  nombre: string;
  data: SalesData;
};

type Regional = {
  nombre: string;
  data: SalesData;
  vendedores: Vendedor[];
};

type SortColumn =
  | "borrador"
  | "cartera"
  | "enProceso"
  | "facturado"
  | "total"
  | "cuota"
  | "faltante"
  | "avance"
  | null;

type SortDirection = "asc" | "desc";

interface SalesTableProps {
  regionales: Regional[];
  iaTotal: SalesData;
  formatCurrency: (amount: number) => string;
}

export default function SalesTable({ regionales, iaTotal, formatCurrency }: SalesTableProps) {
  const [expandedRegions, setExpandedRegions] = useState<Set<string>>(
    new Set(["regional 1", "regional 2", "regional 3"])
  );
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const toggleRegion = (regionName: string) => {
    setExpandedRegions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(regionName)) {
        newSet.delete(regionName);
      } else {
        newSet.add(regionName);
      }
      return newSet;
    });
  };

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("desc");
    }
  };

  const renderSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) {
      return <TrendingUp className="ml-1 h-3 w-3 inline opacity-40" />;
    }
    return sortDirection === "asc" ? (
      <ChevronDown className="ml-1 h-3 w-3 inline" />
    ) : (
      <ChevronRight className="ml-1 h-3 w-3 inline" />
    );
  };

  const getAvanceBgColor = (avance: number) => {
    if (avance >= 100) return "bg-green-50";
    if (avance >= 70) return "bg-blue-50";
    if (avance >= 40) return "bg-yellow-50";
    return "bg-red-50";
  };

  const sortedRegionales = [...regionales].sort((a, b) => {
    if (!sortColumn) return 0;

    let aValue: number;
    let bValue: number;

    switch (sortColumn) {
      case "borrador":
        aValue = a.data.borrador;
        bValue = b.data.borrador;
        break;
      case "cartera":
        aValue = a.data.cartera;
        bValue = b.data.cartera;
        break;
      case "enProceso":
        aValue = a.data.enProceso;
        bValue = b.data.enProceso;
        break;
      case "facturado":
        aValue = a.data.facturado;
        bValue = b.data.facturado;
        break;
      case "total":
        aValue = a.data.total;
        bValue = b.data.total;
        break;
      case "cuota":
        aValue = a.data.cuota;
        bValue = b.data.cuota;
        break;
      case "faltante":
        aValue = a.data.faltante;
        bValue = b.data.faltante;
        break;
      case "avance":
        aValue = a.data.avance;
        bValue = b.data.avance;
        break;
      default:
        return 0;
    }

    if (sortDirection === "asc") {
      return aValue - bValue;
    } else {
      return bValue - aValue;
    }
  });

  sortedRegionales.forEach((regional) => {
    if (sortColumn) {
      regional.vendedores.sort((a, b) => {
        let aValue: number;
        let bValue: number;

        switch (sortColumn) {
          case "borrador":
            aValue = a.data.borrador;
            bValue = b.data.borrador;
            break;
          case "cartera":
            aValue = a.data.cartera;
            bValue = b.data.cartera;
            break;
          case "enProceso":
            aValue = a.data.enProceso;
            bValue = b.data.enProceso;
            break;
          case "facturado":
            aValue = a.data.facturado;
            bValue = b.data.facturado;
            break;
          case "total":
            aValue = a.data.total;
            bValue = b.data.total;
            break;
          case "cuota":
            aValue = a.data.cuota;
            bValue = b.data.cuota;
            break;
          case "faltante":
            aValue = a.data.faltante;
            bValue = b.data.faltante;
            break;
          case "avance":
            aValue = a.data.avance;
            bValue = b.data.avance;
            break;
          default:
            return 0;
        }

        if (sortDirection === "asc") {
          return aValue - bValue;
        } else {
          return bValue - aValue;
        }
      });
    }
  });

  return (
    <Card className="bg-background border-0 shadow-sm">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-base sm:text-lg font-semibold">
          Resumen de ventas por regional y vendedor
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Ventas agrupadas por región con detalle de vendedores
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 sm:p-6">
        <div className="overflow-x-auto">
          <TooltipProvider>
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-cashport-black bg-gray-50">
                  <th className="text-center py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-cashport-black tracking-wider">
                    Regional / Vendedor
                  </th>
                  <th
                    className="hidden md:table-cell text-right py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-cashport-black tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort("borrador")}
                  >
                    Borrador {renderSortIcon("borrador")}
                  </th>
                  <th
                    className="hidden md:table-cell text-right py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-cashport-black tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort("cartera")}
                  >
                    Cartera {renderSortIcon("cartera")}
                  </th>
                  <th
                    className="hidden md:table-cell text-right py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-cashport-black tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort("enProceso")}
                  >
                    En proceso {renderSortIcon("enProceso")}
                  </th>
                  <th
                    className="hidden md:table-cell text-right py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-cashport-black tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort("facturado")}
                  >
                    Facturado {renderSortIcon("facturado")}
                  </th>
                  <th
                    className="text-right py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-cashport-black tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort("total")}
                  >
                    Total {renderSortIcon("total")}
                  </th>
                  <th
                    className="text-right py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-cashport-black tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort("cuota")}
                  >
                    Meta {renderSortIcon("cuota")}
                  </th>
                  <th
                    className="hidden lg:table-cell text-right py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-cashport-black tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort("faltante")}
                  >
                    Monto faltante {renderSortIcon("faltante")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedRegionales.map((regional) => (
                  <React.Fragment key={regional.nombre}>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <tr
                            className="bg-blue-50 border-b border-gray-200 cursor-pointer hover:bg-blue-100 transition-colors"
                            onClick={() => toggleRegion(regional.nombre)}
                          >
                            <td className="py-2 sm:py-3 px-2 sm:px-4 font-semibold text-xs sm:text-sm flex items-center">
                              {expandedRegions.has(regional.nombre) ? (
                                <ChevronDown className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                              ) : (
                                <ChevronRight className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                              )}
                              <span className="truncate">{regional.nombre}</span>
                            </td>
                            <td className="hidden md:table-cell py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-right">
                              {formatCurrency(regional.data.borrador)}
                            </td>
                            <td className="hidden md:table-cell py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-right">
                              {formatCurrency(regional.data.cartera)}
                            </td>
                            <td className="hidden md:table-cell py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-right">
                              {formatCurrency(regional.data.enProceso)}
                            </td>
                            <td className="hidden md:table-cell py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-right">
                              {formatCurrency(regional.data.facturado)}
                            </td>
                            <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-right">
                              {formatCurrency(regional.data.total)}
                            </td>
                            <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-right">
                              <div className="flex items-center justify-end gap-1 sm:gap-2">
                                <span className="hidden sm:inline">
                                  {formatCurrency(regional.data.cuota)}
                                </span>
                                <span className="sm:hidden text-xs">
                                  {formatCurrency(regional.data.cuota).replace(/\s/g, "")}
                                </span>
                                <span
                                  className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${getAvanceBgColor(regional.data.avance)}`}
                                >
                                  {regional.data.avance.toFixed(0)}%
                                </span>
                              </div>
                            </td>
                            <td className="hidden lg:table-cell py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-right">
                              {formatCurrency(regional.data.faltante)}
                            </td>
                          </tr>
                        </TooltipTrigger>
                        <TooltipContent
                          side="right"
                          align="start"
                          className="max-w-xs hidden sm:block"
                        >
                          <div className="space-y-2">
                            <p className="font-semibold">Top 5 Productos - {regional.nombre}</p>
                            {regional.data.topProducts.map((product, idx) => (
                              <div key={idx} className="flex justify-between text-sm">
                                <span>{product.name}</span>
                                <span className="font-medium">
                                  {formatCurrency(product.sales)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    {expandedRegions.has(regional.nombre) &&
                      regional.vendedores.map((vendedor) => (
                        <TooltipProvider key={vendedor.nombre}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer">
                                <td className="py-2 sm:py-3 px-2 sm:px-4 pl-6 sm:pl-12 text-xs sm:text-sm text-gray-700 truncate">
                                  {vendedor.nombre}
                                </td>
                                <td className="hidden md:table-cell py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-right">
                                  {formatCurrency(vendedor.data.borrador)}
                                </td>
                                <td className="hidden md:table-cell py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-right">
                                  {formatCurrency(vendedor.data.cartera)}
                                </td>
                                <td className="hidden md:table-cell py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-right">
                                  {formatCurrency(vendedor.data.enProceso)}
                                </td>
                                <td className="hidden md:table-cell py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-right">
                                  {formatCurrency(vendedor.data.facturado)}
                                </td>
                                <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-right">
                                  {formatCurrency(vendedor.data.total)}
                                </td>
                                <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-right">
                                  <div className="flex items-center justify-end gap-1 sm:gap-2">
                                    <span className="hidden sm:inline">
                                      {formatCurrency(vendedor.data.cuota)}
                                    </span>
                                    <span className="sm:hidden text-xs">
                                      {formatCurrency(vendedor.data.cuota).replace(/\s/g, "")}
                                    </span>
                                    <span
                                      className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${getAvanceBgColor(vendedor.data.avance)}`}
                                    >
                                      {vendedor.data.avance.toFixed(0)}%
                                    </span>
                                  </div>
                                </td>
                                <td className="hidden lg:table-cell py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-right">
                                  {formatCurrency(vendedor.data.faltante)}
                                </td>
                              </tr>
                            </TooltipTrigger>
                            <TooltipContent
                              side="right"
                              align="start"
                              className="max-w-xs hidden sm:block"
                            >
                              <div className="space-y-2">
                                <p className="font-semibold">
                                  Top 5 Productos - {vendedor.nombre}
                                </p>
                                {vendedor.data.topProducts.map((product, idx) => (
                                  <div key={idx} className="flex justify-between text-sm">
                                    <span>{product.name}</span>
                                    <span className="font-medium">
                                      {formatCurrency(product.sales)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}
                  </React.Fragment>
                ))}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <tr className="border-t-2 border-cashport-black bg-gray-100 font-bold cursor-pointer">
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">Total</td>
                        <td className="hidden md:table-cell py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-right">
                          {formatCurrency(iaTotal.borrador)}
                        </td>
                        <td className="hidden md:table-cell py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-right">
                          {formatCurrency(iaTotal.cartera)}
                        </td>
                        <td className="hidden md:table-cell py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-right">
                          {formatCurrency(iaTotal.enProceso)}
                        </td>
                        <td className="hidden md:table-cell py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-right">
                          {formatCurrency(iaTotal.facturado)}
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-right">
                          {formatCurrency(iaTotal.total)}
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-right">
                          <div className="flex items-center justify-end gap-1 sm:gap-2">
                            <span className="hidden sm:inline">
                              {formatCurrency(iaTotal.cuota)}
                            </span>
                            <span className="sm:hidden text-xs">
                              {formatCurrency(iaTotal.cuota).replace(/\s/g, "")}
                            </span>
                            <span
                              className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${getAvanceBgColor(iaTotal.avance)}`}
                            >
                              {iaTotal.avance.toFixed(0)}%
                            </span>
                          </div>
                        </td>
                        <td className="hidden lg:table-cell py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-right">
                          {formatCurrency(iaTotal.faltante)}
                        </td>
                      </tr>
                    </TooltipTrigger>
                    <TooltipContent
                      side="right"
                      align="start"
                      className="max-w-xs hidden sm:block"
                    >
                      <div className="space-y-2">
                        <p className="font-semibold">Top 5 Productos - Total General</p>
                        {iaTotal.topProducts.map((product, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span>{product.name}</span>
                            <span className="font-medium">{formatCurrency(product.sales)}</span>
                          </div>
                        ))}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </tbody>
            </table>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
}
