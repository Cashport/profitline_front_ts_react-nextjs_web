"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Pagination } from "antd";
import { Download, Search, TrendingDown, TrendingUp } from "lucide-react";

import { useAppStore } from "@/lib/store/store";
import { useDebounce } from "@/hooks/useDeabouce";
import { useRevenueTracking } from "@/modules/commerce/contexts/revenue-tracking-context";
import { useDashboardSalesClientDetail } from "@/modules/commerce/hooks/revenue-tracking/useDashboardSalesClientDetail";
import type { IDashboardSalesClientDetailItem } from "@/types/dashboardSales/IDashboardSales";

import { Card, CardContent, CardHeader, CardTitle } from "@/modules/chat/ui/card";

const PAGE_SIZE = 25;

const PctBadge = ({ value }: { value: number | null }) => {
  if (value === null || value === undefined) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }
  const positive = value >= 0;
  return (
    <span
      className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${
        positive
          ? "bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-400"
          : "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-400"
      }`}
    >
      {positive ? "+" : ""}
      {value.toFixed(2)}%
    </span>
  );
};

const RoiCell = ({ value }: { value: number | null }) => {
  if (value === null || value === undefined) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }
  const positive = value >= 0;
  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold ${
        positive ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"
      }`}
    >
      {positive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
      {positive ? "+" : ""}
      {value.toFixed(2)}%
    </span>
  );
};

const CSV_COLUMNS: { header: string; getValue: (i: IDashboardSalesClientDetailItem) => unknown }[] =
  [
    { header: "Cliente", getValue: (i) => i.client_name },
    { header: "Ventas mes", getValue: (i) => i.ventas_mes },
    { header: "Meta", getValue: (i) => i.meta },
    { header: "Meta %", getValue: (i) => i.meta_pct },
    { header: "Prom. mensual", getValue: (i) => i.prom_mensual },
    { header: "Prom. mensual %", getValue: (i) => i.prom_mensual_pct },
    { header: "Mes anterior", getValue: (i) => i.mes_anterior },
    { header: "Mes anterior %", getValue: (i) => i.mes_anterior_pct },
    { header: "YTD anterior", getValue: (i) => i.ytd_anterior },
    { header: "YTD actual", getValue: (i) => i.ytd_actual },
    { header: "ROI YTD %", getValue: (i) => i.roi_ytd_pct }
  ];

const exportToCsv = (items: IDashboardSalesClientDetailItem[]) => {
  const escape = (value: unknown) => {
    const str = value === null || value === undefined ? "" : String(value);
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  };
  const rows = [
    CSV_COLUMNS.map((c) => c.header).join(","),
    ...items.map((item) => CSV_COLUMNS.map((c) => escape(c.getValue(item))).join(","))
  ];
  const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "detalle-cliente.csv";
  link.click();
  URL.revokeObjectURL(url);
};

export default function DashboardClientsDetailsTable() {
  const formatMoney = useAppStore((state) => state.formatMoney);
  const { filters } = useRevenueTracking();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const filtersKey = useMemo(() => JSON.stringify(filters), [filters]);
  useEffect(() => {
    setPage(1);
  }, [filtersKey, debouncedSearch]);

  const { data, isLoading } = useDashboardSalesClientDetail(
    filters,
    page,
    PAGE_SIZE,
    debouncedSearch
  );

  const items = data?.items ?? [];

  return (
    <Card className="bg-background border-0 shadow-sm py-0 gap-0">
      <CardHeader className="sm:p-6 !pb-0">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <CardTitle className="text-base sm:text-lg font-semibold">Detalle por Cliente</CardTitle>
          <div className="flex items-center gap-2 sm:ml-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar..."
                className="w-full sm:w-56 pl-9 pr-3 py-2 text-sm bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
              />
            </div>
            <button
              type="button"
              onClick={() => exportToCsv(items)}
              disabled={items.length === 0}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-background border border-border rounded-lg hover:bg-secondary/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 sm:p-6">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <p>Cargando datos...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <p>No hay datos disponibles</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-cashport-black dark:border-border bg-gray-50 dark:bg-secondary">
                    <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-foreground tracking-wider">
                      Cliente
                    </th>
                    <th className="text-right py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-foreground tracking-wider">
                      Ventas mes
                    </th>
                    <th className="hidden md:table-cell text-right py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-foreground tracking-wider">
                      Meta
                    </th>
                    <th className="hidden md:table-cell text-right py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-foreground tracking-wider">
                      Prom. mens.
                    </th>
                    <th className="hidden md:table-cell text-right py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-foreground tracking-wider">
                      Mes ant.
                    </th>
                    <th className="hidden lg:table-cell text-right py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-foreground tracking-wider">
                      YTD ant.
                    </th>
                    <th className="text-right py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-foreground tracking-wider">
                      YTD
                    </th>
                    <th className="text-right py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-foreground tracking-wider">
                      % YTD
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr
                      key={item.client_id}
                      className="border-b border-gray-100 dark:border-border hover:bg-gray-50 dark:hover:bg-secondary/50 transition-colors"
                    >
                      <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold truncate max-w-[180px]">
                        {item.client_name}
                      </td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-right font-semibold">
                        {formatMoney(item.ventas_mes, { hideDecimals: true })}
                      </td>
                      <td className="hidden md:table-cell py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-right">
                        <div className="flex items-center justify-end gap-1 sm:gap-2">
                          <span className="text-muted-foreground">
                            {formatMoney(item.meta, { hideDecimals: true })}
                          </span>
                          <PctBadge value={item.meta_pct} />
                        </div>
                      </td>
                      <td className="hidden md:table-cell py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-right">
                        <div className="flex items-center justify-end gap-1 sm:gap-2">
                          <span>{formatMoney(item.prom_mensual, { hideDecimals: true })}</span>
                          <PctBadge value={item.prom_mensual_pct} />
                        </div>
                      </td>
                      <td className="hidden md:table-cell py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-right">
                        <div className="flex items-center justify-end gap-1 sm:gap-2">
                          <span>{formatMoney(item.mes_anterior, { hideDecimals: true })}</span>
                          <PctBadge value={item.mes_anterior_pct} />
                        </div>
                      </td>
                      <td className="hidden lg:table-cell py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-right text-muted-foreground">
                        {formatMoney(item.ytd_anterior, { hideDecimals: true })}
                      </td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-right font-semibold">
                        {formatMoney(item.ytd_actual, { hideDecimals: true })}
                      </td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-right">
                        <RoiCell value={item.roi_ytd_pct} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {(data?.total ?? 0) > PAGE_SIZE && (
              <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-3 px-2 sm:px-0 pt-4 pb-4 sm:pb-0">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Mostrando {(page - 1) * PAGE_SIZE + 1} a{" "}
                  {Math.min(page * PAGE_SIZE, data?.total ?? 0)} de {data?.total ?? 0} resultados
                </p>
                <Pagination
                  current={page}
                  total={data?.total ?? 0}
                  pageSize={PAGE_SIZE}
                  onChange={setPage}
                  showSizeChanger={false}
                  disabled={isLoading}
                />
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
