"use client";

import React, { useState } from "react";
import useSWR from "swr";
import { ChevronDown, ChevronRight } from "lucide-react";

import { useAppStore } from "@/lib/store/store";
import { getSalesDashboard } from "@/services/commerce/commerce";

import SortArrows from "@/components/ui/sort-arrows/sort-arrows";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/modules/chat/ui/card";
import { Tooltip, TooltipProvider, TooltipTrigger } from "@/modules/chat/ui/tooltip";
import { useRevenueTracking } from "@/modules/commerce/contexts/revenue-tracking-context";
import { appendSalesFilterParams } from "@/modules/commerce/hooks/revenue-tracking/salesFilterParams";

type SortColumn =
  | "total_sales_in_process"
  | "total_sales_invoiced"
  | "total_sales"
  | "total_cuota"
  | "pending_cuota"
  | "percentage_cuota"
  | null;

type SortDirection = "asc" | "desc";

export default function SalesTable() {
  const formatMoney = useAppStore((state) => state.formatMoney);

  const { filters } = useRevenueTracking();
  const { data: salesData, isLoading } = useSWR(
    () => {
      const params = new URLSearchParams();
      appendSalesFilterParams(params, filters);
      return `/galderma-dashboard/sellers?${params.toString()}`;
    },
    (_key: string) => getSalesDashboard(filters)
  );

  const [expandedSellerLeaders, setExpandedSellerLeaders] = useState<Set<string>>(
    new Set(["regional 1", "regional 2", "regional 3"])
  );
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  if (isLoading) {
    return (
      <Card className="cp-card gap-0 rounded-[var(--card-radius)] border-0 bg-cp-surface py-0 shadow-none">
        <div className="flex items-center justify-center min-h-[400px]">
          <p>Cargando datos...</p>
        </div>
      </Card>
    );
  }

  if (!salesData) {
    return (
      <Card className="cp-card gap-0 rounded-[var(--card-radius)] border-0 bg-cp-surface py-0 shadow-none">
        <div className="flex items-center justify-center min-h-[400px]">
          <p>No hay datos disponibles</p>
        </div>
      </Card>
    );
  }

  const { total: iaTotal, seller_leaders } = salesData;

  const toggleSellerLeader = (sellerLeaderName: string) => {
    setExpandedSellerLeaders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sellerLeaderName)) {
        newSet.delete(sellerLeaderName);
      } else {
        newSet.add(sellerLeaderName);
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

  // Rótulo ordenable: columnas a la derecha, flechas a la izquierda del texto
  const renderSortLabel = (label: string, column: SortColumn) => (
    <span className="inline-flex flex-row-reverse items-center gap-1">
      {label}
      <SortArrows dir={sortColumn === column ? sortDirection : null} />
    </span>
  );

  const getAvanceBgColor = (avance: number) => {
    if (avance >= 100) return "bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-400";
    if (avance >= 70) return "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400";
    if (avance >= 40)
      return "bg-yellow-50 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-400";
    return "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-400";
  };

  const sortedSellerLeaders = [...seller_leaders].sort((a, b) => {
    if (!sortColumn) return 0;

    let aValue: number;
    let bValue: number;

    switch (sortColumn) {
      case "total_sales_in_process":
        aValue = a.total_sales_in_process;
        bValue = b.total_sales_in_process;
        break;
      case "total_sales_invoiced":
        aValue = a.total_sales_invoiced;
        bValue = b.total_sales_invoiced;
        break;
      case "total_sales":
        aValue = a.total_sales;
        bValue = b.total_sales;
        break;
      case "total_cuota":
        aValue = a.total_cuota;
        bValue = b.total_cuota;
        break;
      case "pending_cuota":
        aValue = a.pending_cuota;
        bValue = b.pending_cuota;
        break;
      case "percentage_cuota":
        aValue = a.percentage_cuota;
        bValue = b.percentage_cuota;
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

  sortedSellerLeaders.forEach((sellerLeader) => {
    if (sortColumn) {
      sellerLeader.sellers.sort((a, b) => {
        let aValue: number;
        let bValue: number;

        switch (sortColumn) {
          case "total_sales_in_process":
            aValue = a.total_sales_in_process;
            bValue = b.total_sales_in_process;
            break;
          case "total_sales_invoiced":
            aValue = a.total_sales_invoiced;
            bValue = b.total_sales_invoiced;
            break;
          case "total_sales":
            aValue = a.total_sales;
            bValue = b.total_sales;
            break;
          case "total_cuota":
            aValue = a.total_cuota;
            bValue = b.total_cuota;
            break;
          case "pending_cuota":
            aValue = a.pending_cuota;
            bValue = b.pending_cuota;
            break;
          case "percentage_cuota":
            aValue = a.percentage_cuota;
            bValue = b.percentage_cuota;
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
    <Card className="cp-card gap-0 rounded-[var(--card-radius)] border-0 bg-cp-surface py-0 shadow-none">
      <CardHeader className="sm:px-[18px] sm:pt-[14px] !pb-0">
        <CardTitle className="text-base sm:text-lg font-semibold">
          Resumen de ventas por regional y vendedor
        </CardTitle>
        <CardDescription className="text-[13px] sm:text-sm">
          Ventas agrupadas por región con detalle de vendedores
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 sm:px-[18px] sm:py-[14px]">
        <div className="overflow-x-auto">
          <TooltipProvider>
            <table className="w-full">
              <thead>
                <tr className="border-b border-cp-line bg-cp-surface">
                  <th className="text-center py-3 px-2 sm:px-4 text-[13.5px] font-semibold text-cp-ink">
                    Regional / Vendedor
                  </th>
                  <th className="hidden md:table-cell text-right py-3 px-2 sm:px-4 text-[13.5px] font-semibold text-cp-ink">
                    Borrador
                  </th>
                  <th className="hidden md:table-cell text-right py-3 px-2 sm:px-4 text-[13.5px] font-semibold text-cp-ink">
                    Cartera
                  </th>
                  <th
                    className="hidden md:table-cell text-right py-3 px-2 sm:px-4 text-[13.5px] font-semibold text-cp-ink cursor-pointer select-none"
                    onClick={() => handleSort("total_sales_in_process")}
                  >
                    {renderSortLabel("En proceso", "total_sales_in_process")}
                  </th>
                  <th
                    className="hidden md:table-cell text-right py-3 px-2 sm:px-4 text-[13.5px] font-semibold text-cp-ink cursor-pointer select-none"
                    onClick={() => handleSort("total_sales_invoiced")}
                  >
                    {renderSortLabel("Facturado", "total_sales_invoiced")}
                  </th>
                  <th
                    className="text-right py-3 px-2 sm:px-4 text-[13.5px] font-semibold text-cp-ink cursor-pointer select-none"
                    onClick={() => handleSort("total_sales")}
                  >
                    {renderSortLabel("Total", "total_sales")}
                  </th>
                  <th
                    className="text-right py-3 px-2 sm:px-4 text-[13.5px] font-semibold text-cp-ink cursor-pointer select-none"
                    onClick={() => handleSort("total_cuota")}
                  >
                    {renderSortLabel("Meta", "total_cuota")}
                  </th>
                  <th
                    className="hidden lg:table-cell text-right py-3 px-2 sm:px-4 text-[13.5px] font-semibold text-cp-ink cursor-pointer select-none"
                    onClick={() => handleSort("pending_cuota")}
                  >
                    {renderSortLabel("Monto faltante", "pending_cuota")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedSellerLeaders.map((sellerLeader) => (
                  <React.Fragment key={sellerLeader.seller_leader}>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <tr
                            className="bg-blue-50 dark:bg-secondary border-b border-gray-200 dark:border-border cursor-pointer hover:bg-blue-100 dark:hover:bg-secondary/80 transition-colors"
                            onClick={() => toggleSellerLeader(sellerLeader.seller_leader)}
                          >
                            <td className="py-2 sm:py-3 px-2 sm:px-4 font-semibold text-[13px] sm:text-sm flex items-center">
                              {expandedSellerLeaders.has(sellerLeader.seller_leader) ? (
                                <ChevronDown className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                              ) : (
                                <ChevronRight className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                              )}
                              <span className="truncate">{sellerLeader.seller_leader}</span>
                            </td>
                            <td className="hidden md:table-cell py-2 sm:py-3 px-2 sm:px-4 text-[13px] sm:text-sm text-right">
                              {formatMoney(sellerLeader.total_sales_pending, {
                                hideDecimals: true
                              })}
                            </td>
                            <td className="hidden md:table-cell py-2 sm:py-3 px-2 sm:px-4 text-[13px] sm:text-sm text-right">
                              {formatMoney(sellerLeader.total_sales_wallet, {
                                hideDecimals: true
                              })}
                            </td>
                            <td className="hidden md:table-cell py-2 sm:py-3 px-2 sm:px-4 text-[13px] sm:text-sm text-right">
                              {formatMoney(sellerLeader.total_sales_in_process, {
                                hideDecimals: true
                              })}
                            </td>
                            <td className="hidden md:table-cell py-2 sm:py-3 px-2 sm:px-4 text-[13px] sm:text-sm text-right">
                              {formatMoney(sellerLeader.total_sales_invoiced, {
                                hideDecimals: true
                              })}
                            </td>
                            <td className="py-2 sm:py-3 px-2 sm:px-4 text-[13px] sm:text-sm text-right">
                              {formatMoney(sellerLeader.total_sales, {
                                hideDecimals: true
                              })}
                            </td>
                            <td className="py-2 sm:py-3 px-2 sm:px-4 text-[13px] sm:text-sm text-right">
                              <div className="flex items-center justify-end gap-1 sm:gap-2">
                                <span className="hidden sm:inline">
                                  {formatMoney(sellerLeader.total_cuota, {
                                    hideDecimals: true
                                  })}
                                </span>
                                <span className="sm:hidden text-[13px]">
                                  {formatMoney(sellerLeader.total_cuota, {
                                    hideDecimals: true
                                  }).replace(/\s/g, "")}
                                </span>
                                <span
                                  className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[13px] font-medium ${getAvanceBgColor(sellerLeader.percentage_cuota)}`}
                                >
                                  {sellerLeader.percentage_cuota.toFixed(0)}%
                                </span>
                              </div>
                            </td>
                            <td className="hidden lg:table-cell py-2 sm:py-3 px-2 sm:px-4 text-[13px] sm:text-sm text-right">
                              {formatMoney(sellerLeader.pending_cuota, {
                                hideDecimals: true
                              })}
                            </td>
                          </tr>
                        </TooltipTrigger>
                        {/* <TooltipContent className="max-w-xs hidden sm:block">
                          <div className="space-y-2">
                            <p className="font-semibold">
                              Top 5 Productos - {sellerLeader.seller_leader}
                            </p>
                            {sellerLeader.units_by_category.slice(0, 5).map((product, idx) => (
                              <div key={idx} className="flex justify-between text-sm">
                                <span>{product.producto}</span>
                                <span className="font-medium">{formatMoney(product.monto)}</span>
                              </div>
                            ))}
                          </div>
                        </TooltipContent> */}
                      </Tooltip>
                    </TooltipProvider>

                    {expandedSellerLeaders.has(sellerLeader.seller_leader) &&
                      sellerLeader.sellers.map((seller) => (
                        <TooltipProvider key={seller.seller}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <tr className="border-b border-gray-100 dark:border-border hover:bg-gray-50 dark:hover:bg-secondary/50 transition-colors cursor-pointer">
                                <td className="py-2 sm:py-3 px-2 sm:px-4 pl-6 sm:pl-12 text-[13px] sm:text-sm text-gray-700 dark:text-gray-300 truncate">
                                  {seller.seller}
                                </td>
                                <td className="hidden md:table-cell py-2 sm:py-3 px-2 sm:px-4 text-[13px] sm:text-sm text-right">
                                  {formatMoney(seller.total_sales_pending, {
                                    hideDecimals: true
                                  })}
                                </td>
                                <td className="hidden md:table-cell py-2 sm:py-3 px-2 sm:px-4 text-[13px] sm:text-sm text-right">
                                  {formatMoney(seller.total_sales_wallet, {
                                    hideDecimals: true
                                  })}
                                </td>
                                <td className="hidden md:table-cell py-2 sm:py-3 px-2 sm:px-4 text-[13px] sm:text-sm text-right">
                                  {formatMoney(seller.total_sales_in_process, {
                                    hideDecimals: true
                                  })}
                                </td>
                                <td className="hidden md:table-cell py-2 sm:py-3 px-2 sm:px-4 text-[13px] sm:text-sm text-right">
                                  {formatMoney(seller.total_sales_invoiced, {
                                    hideDecimals: true
                                  })}
                                </td>
                                <td className="py-2 sm:py-3 px-2 sm:px-4 text-[13px] sm:text-sm text-right">
                                  {formatMoney(seller.total_sales, {
                                    hideDecimals: true
                                  })}
                                </td>
                                <td className="py-2 sm:py-3 px-2 sm:px-4 text-[13px] sm:text-sm text-right">
                                  <div className="flex items-center justify-end gap-1 sm:gap-2">
                                    <span className="hidden sm:inline">
                                      {formatMoney(seller.total_cuota, {
                                        hideDecimals: true
                                      })}
                                    </span>
                                    <span className="sm:hidden text-[13px]">
                                      {formatMoney(seller.total_cuota, {
                                        hideDecimals: true
                                      }).replace(/\s/g, "")}
                                    </span>
                                    <span
                                      className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[13px] font-medium ${getAvanceBgColor(seller.percentage_cuota)}`}
                                    >
                                      {seller.percentage_cuota.toFixed(0)}%
                                    </span>
                                  </div>
                                </td>
                                <td className="hidden lg:table-cell py-2 sm:py-3 px-2 sm:px-4 text-[13px] sm:text-sm text-right">
                                  {formatMoney(seller.pending_cuota, {
                                    hideDecimals: true
                                  })}
                                </td>
                              </tr>
                            </TooltipTrigger>
                            {/* <TooltipContent className="max-w-xs hidden sm:block">
                              <div className="space-y-2">
                                <p className="font-semibold">Top 5 Productos - {seller.seller}</p>
                                {seller.units_by_category.slice(0, 5).map((product, idx) => (
                                  <div key={idx} className="flex justify-between text-sm">
                                    <span>{product.producto}</span>
                                    <span className="font-medium">
                                      {formatMoney(product.monto)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </TooltipContent> */}
                          </Tooltip>
                        </TooltipProvider>
                      ))}
                  </React.Fragment>
                ))}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <tr className="border-t-2 border-cashport-black dark:border-border bg-gray-100 dark:bg-secondary font-bold cursor-pointer">
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-[13px] sm:text-sm">Total</td>
                        <td className="hidden md:table-cell py-2 sm:py-3 px-2 sm:px-4 text-[13px] sm:text-sm text-right">
                          {formatMoney(iaTotal.total_sales_pending, {
                            hideDecimals: true
                          })}
                        </td>
                        <td className="hidden md:table-cell py-2 sm:py-3 px-2 sm:px-4 text-[13px] sm:text-sm text-right">
                          {formatMoney(iaTotal.total_sales_wallet, {
                            hideDecimals: true
                          })}
                        </td>
                        <td className="hidden md:table-cell py-2 sm:py-3 px-2 sm:px-4 text-[13px] sm:text-sm text-right">
                          {formatMoney(iaTotal.total_sales_in_process, {
                            hideDecimals: true
                          })}
                        </td>
                        <td className="hidden md:table-cell py-2 sm:py-3 px-2 sm:px-4 text-[13px] sm:text-sm text-right">
                          {formatMoney(iaTotal.total_sales_invoiced, {
                            hideDecimals: true
                          })}
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-[13px] sm:text-sm text-right">
                          {formatMoney(iaTotal.total_sales, {
                            hideDecimals: true
                          })}
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-[13px] sm:text-sm text-right">
                          <div className="flex items-center justify-end gap-1 sm:gap-2">
                            <span className="hidden sm:inline">
                              {formatMoney(iaTotal.total_cuota, {
                                hideDecimals: true
                              })}
                            </span>
                            <span className="sm:hidden text-[13px]">
                              {formatMoney(iaTotal.total_cuota, {
                                hideDecimals: true
                              }).replace(/\s/g, "")}
                            </span>
                            <span
                              className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[13px] font-medium ${getAvanceBgColor(iaTotal.percentage_cuota)}`}
                            >
                              {iaTotal.percentage_cuota.toFixed(0)}%
                            </span>
                          </div>
                        </td>
                        <td className="hidden lg:table-cell py-2 sm:py-3 px-2 sm:px-4 text-[13px] sm:text-sm text-right">
                          {formatMoney(iaTotal.pending_cuota, {
                            hideDecimals: true
                          })}
                        </td>
                      </tr>
                    </TooltipTrigger>
                    {/* <TooltipContent className="max-w-xs hidden sm:block">
                      <div className="space-y-2">
                        <p className="font-semibold">Top 5 Productos - Total General</p>
                        {iaTotal.units_by_category.slice(0, 5).map((product, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span>{product.producto}</span>
                            <span className="font-medium">{formatMoney(product.monto)}</span>
                          </div>
                        ))}
                      </div>
                    </TooltipContent> */}
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
