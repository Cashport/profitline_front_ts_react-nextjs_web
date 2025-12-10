"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "antd";
import { ChevronDown, ChevronRight, TrendingUp } from "lucide-react";
import { CaretLeft } from "@phosphor-icons/react";

import { useAppStore } from "@/lib/store/store";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/modules/chat/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/modules/chat/ui/tooltip";
import {
  ISalesDashboardSellerLeader,
  ISalesDashboardSeller,
  ISalesDashboardTotal
} from "@/types/commerce/ICommerce";

type SortColumn =
  | "total_sales_in_process"
  | "total_sales_invoiced"
  | "total_sales"
  | "total_cuota"
  | "pending_cuota"
  | "percentage_cuota"
  | null;

type SortDirection = "asc" | "desc";

interface SalesTableProps {
  seller_leaders: ISalesDashboardSellerLeader[];
  iaTotal: ISalesDashboardTotal;
}

export default function SalesTable({ seller_leaders, iaTotal }: SalesTableProps) {
  const formatMoney = useAppStore((state) => state.formatMoney);

  const [expandedSellerLeaders, setExpandedSellerLeaders] = useState<Set<string>>(
    new Set(["regional 1", "regional 2", "regional 3"])
  );
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

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
    <Card className="bg-background border-0 shadow-sm py-0 gap-0">
      <Link href="/comercio" className="...">
        <Button
          type="text"
          className="!text-base !font-semibold !w-fit m-[24px] mb-0 !h-fit !p-[4px_6px] "
        >
          <CaretLeft size={20} /> Volver a mis ordenes
        </Button>
      </Link>

      <CardHeader className="sm:p-6 !pb-0">
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
                  <th className="hidden md:table-cell text-right py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-cashport-black tracking-wider">
                    Borrador
                  </th>
                  <th className="hidden md:table-cell text-right py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-cashport-black tracking-wider">
                    Cartera
                  </th>
                  <th
                    className="hidden md:table-cell text-right py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-cashport-black tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort("total_sales_in_process")}
                  >
                    En proceso {renderSortIcon("total_sales_in_process")}
                  </th>
                  <th
                    className="hidden md:table-cell text-right py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-cashport-black tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort("total_sales_invoiced")}
                  >
                    Facturado {renderSortIcon("total_sales_invoiced")}
                  </th>
                  <th
                    className="text-right py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-cashport-black tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort("total_sales")}
                  >
                    Total {renderSortIcon("total_sales")}
                  </th>
                  <th
                    className="text-right py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-cashport-black tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort("total_cuota")}
                  >
                    Meta {renderSortIcon("total_cuota")}
                  </th>
                  <th
                    className="hidden lg:table-cell text-right py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-cashport-black tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort("pending_cuota")}
                  >
                    Monto faltante {renderSortIcon("pending_cuota")}
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
                            className="bg-blue-50 border-b border-gray-200 cursor-pointer hover:bg-blue-100 transition-colors"
                            onClick={() => toggleSellerLeader(sellerLeader.seller_leader)}
                          >
                            <td className="py-2 sm:py-3 px-2 sm:px-4 font-semibold text-xs sm:text-sm flex items-center">
                              {expandedSellerLeaders.has(sellerLeader.seller_leader) ? (
                                <ChevronDown className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                              ) : (
                                <ChevronRight className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                              )}
                              <span className="truncate">{sellerLeader.seller_leader}</span>
                            </td>
                            <td className="hidden md:table-cell py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-right">
                              {formatMoney(sellerLeader.total_sales_pending, {
                                hideDecimals: true
                              })}
                            </td>
                            <td className="hidden md:table-cell py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-right">
                              {formatMoney(sellerLeader.total_sales_wallet, {
                                hideDecimals: true
                              })}
                            </td>
                            <td className="hidden md:table-cell py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-right">
                              {formatMoney(sellerLeader.total_sales_in_process, {
                                hideDecimals: true
                              })}
                            </td>
                            <td className="hidden md:table-cell py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-right">
                              {formatMoney(sellerLeader.total_sales_invoiced, {
                                hideDecimals: true
                              })}
                            </td>
                            <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-right">
                              {formatMoney(sellerLeader.total_sales, {
                                hideDecimals: true
                              })}
                            </td>
                            <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-right">
                              <div className="flex items-center justify-end gap-1 sm:gap-2">
                                <span className="hidden sm:inline">
                                  {formatMoney(sellerLeader.total_cuota, {
                                    hideDecimals: true
                                  })}
                                </span>
                                <span className="sm:hidden text-xs">
                                  {formatMoney(sellerLeader.total_cuota, {
                                    hideDecimals: true
                                  }).replace(/\s/g, "")}
                                </span>
                                <span
                                  className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${getAvanceBgColor(sellerLeader.percentage_cuota)}`}
                                >
                                  {sellerLeader.percentage_cuota.toFixed(0)}%
                                </span>
                              </div>
                            </td>
                            <td className="hidden lg:table-cell py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-right">
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
                              <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer">
                                <td className="py-2 sm:py-3 px-2 sm:px-4 pl-6 sm:pl-12 text-xs sm:text-sm text-gray-700 truncate">
                                  {seller.seller}
                                </td>
                                <td className="hidden md:table-cell py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-right">
                                  {formatMoney(seller.total_sales_pending, {
                                    hideDecimals: true
                                  })}
                                </td>
                                <td className="hidden md:table-cell py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-right">
                                  {formatMoney(seller.total_sales_wallet, {
                                    hideDecimals: true
                                  })}
                                </td>
                                <td className="hidden md:table-cell py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-right">
                                  {formatMoney(seller.total_sales_in_process, {
                                    hideDecimals: true
                                  })}
                                </td>
                                <td className="hidden md:table-cell py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-right">
                                  {formatMoney(seller.total_sales_invoiced, {
                                    hideDecimals: true
                                  })}
                                </td>
                                <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-right">
                                  {formatMoney(seller.total_sales, {
                                    hideDecimals: true
                                  })}
                                </td>
                                <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-right">
                                  <div className="flex items-center justify-end gap-1 sm:gap-2">
                                    <span className="hidden sm:inline">
                                      {formatMoney(seller.total_cuota, {
                                        hideDecimals: true
                                      })}
                                    </span>
                                    <span className="sm:hidden text-xs">
                                      {formatMoney(seller.total_cuota, {
                                        hideDecimals: true
                                      }).replace(/\s/g, "")}
                                    </span>
                                    <span
                                      className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${getAvanceBgColor(seller.percentage_cuota)}`}
                                    >
                                      {seller.percentage_cuota.toFixed(0)}%
                                    </span>
                                  </div>
                                </td>
                                <td className="hidden lg:table-cell py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-right">
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
                      <tr className="border-t-2 border-cashport-black bg-gray-100 font-bold cursor-pointer">
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">Total</td>
                        <td className="hidden md:table-cell py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-right">
                          {formatMoney(iaTotal.total_sales_pending, {
                            hideDecimals: true
                          })}
                        </td>
                        <td className="hidden md:table-cell py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-right">
                          {formatMoney(iaTotal.total_sales_wallet, {
                            hideDecimals: true
                          })}
                        </td>
                        <td className="hidden md:table-cell py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-right">
                          {formatMoney(iaTotal.total_sales_in_process, {
                            hideDecimals: true
                          })}
                        </td>
                        <td className="hidden md:table-cell py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-right">
                          {formatMoney(iaTotal.total_sales_invoiced, {
                            hideDecimals: true
                          })}
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-right">
                          {formatMoney(iaTotal.total_sales, {
                            hideDecimals: true
                          })}
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-right">
                          <div className="flex items-center justify-end gap-1 sm:gap-2">
                            <span className="hidden sm:inline">
                              {formatMoney(iaTotal.total_cuota, {
                                hideDecimals: true
                              })}
                            </span>
                            <span className="sm:hidden text-xs">
                              {formatMoney(iaTotal.total_cuota, {
                                hideDecimals: true
                              }).replace(/\s/g, "")}
                            </span>
                            <span
                              className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${getAvanceBgColor(iaTotal.percentage_cuota)}`}
                            >
                              {iaTotal.percentage_cuota.toFixed(0)}%
                            </span>
                          </div>
                        </td>
                        <td className="hidden lg:table-cell py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-right">
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
