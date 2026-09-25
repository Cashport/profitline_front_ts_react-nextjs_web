"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Pagination } from "antd";
import { ChevronRight, Download, Search } from "lucide-react";

import { useAppStore } from "@/lib/store/store";
import { useDebounce } from "@/hooks/useDeabouce";
import { useRevenueTracking } from "@/modules/commerce/contexts/revenue-tracking-context";
import { useDashboardSalesPromotions } from "@/modules/commerce/hooks/revenue-tracking/useDashboardSalesPromotions";
import type { IDashboardSalesPromotionItem } from "@/types/dashboardSales/IDashboardSales";

import { Card, CardContent, CardHeader, CardTitle } from "@/modules/chat/ui/card";

const PAGE_SIZE = 25;

const rowKeyOf = (item: IDashboardSalesPromotionItem) =>
  `${item.promotion_id}-${item.seller_id ?? "sin-vendedor"}`;

// El CSV se aplana: una fila por cliente, repitiendo promoción y vendedor, para que sirva
// tal cual en una tabla dinámica.
const exportToCsv = (items: IDashboardSalesPromotionItem[]) => {
  const escape = (value: unknown) => {
    const str = value === null || value === undefined ? "" : String(value);
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  };
  const header = ["Promoción", "Vendedor", "Cliente", "Pedidos", "Unidades", "Monto"];
  const rows = [
    header.join(","),
    ...items.flatMap((item) =>
      item.clients.map((client) =>
        [
          escape(item.promotion_name),
          escape(item.seller_name),
          escape(client.client_name),
          client.orders,
          client.units,
          client.amount
        ].join(",")
      )
    )
  ];
  const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "informe-promociones.csv";
  link.click();
  URL.revokeObjectURL(url);
};

export default function DashboardPromotionsTable() {
  const formatMoney = useAppStore((state) => state.formatMoney);
  const { filters, includeIva } = useRevenueTracking();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);

  const filtersKey = useMemo(() => JSON.stringify(filters), [filters]);
  // Si cambian los filtros, las filas abiertas ya no se corresponden con los datos nuevos.
  useEffect(() => {
    setExpanded(new Set());
    setPage(1);
  }, [filtersKey, debouncedSearch]);

  const { data, isLoading } = useDashboardSalesPromotions(filters, debouncedSearch, includeIva);

  const items = data?.items ?? [];
  const total = items.length;

  // La paginación es en memoria: el back devuelve el informe completo (son decenas de filas,
  // una por promoción y vendedor) y así el Export y el detalle desplegado siguen teniendo
  // todo el conjunto, no sólo la página visible.
  const pageItems = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Si el conjunto se achica (por filtro o búsqueda), la página actual puede quedar fuera de rango.
  useEffect(() => {
    const lastPage = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (page > lastPage) setPage(lastPage);
  }, [total, page]);

  const toggleRow = (key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <Card className="bg-background border-0 shadow-sm py-0 gap-0">
      <CardHeader className="sm:p-6 !pb-0">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div>
            <CardTitle className="text-base sm:text-lg font-semibold">
              Informe de Promociones
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Un pedido con dos promociones cuenta en ambas, así que el total puede superar las
              ventas del período.
            </p>
          </div>
          <div className="flex items-center gap-2 sm:ml-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar promoción o vendedor..."
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
                    Promoción
                  </th>
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-foreground tracking-wider">
                    Vendedor
                  </th>
                  <th className="text-right py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-foreground tracking-wider">
                    Pedidos
                  </th>
                  <th className="text-right py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-foreground tracking-wider">
                    Unidades
                  </th>
                  <th className="text-right py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-foreground tracking-wider">
                    Monto
                  </th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((item) => {
                  const key = rowKeyOf(item);
                  const isOpen = expanded.has(key);

                  return (
                    <React.Fragment key={key}>
                      <tr
                        className="border-b border-gray-100 dark:border-border hover:bg-gray-50 dark:hover:bg-secondary/50 transition-colors cursor-pointer"
                        onClick={() => toggleRow(key)}
                      >
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold">
                          <button
                            type="button"
                            aria-expanded={isOpen}
                            aria-label={`${isOpen ? "Ocultar" : "Ver"} el detalle por cliente de ${item.promotion_name}`}
                            className="flex items-center gap-1.5 text-left"
                          >
                            <ChevronRight
                              className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
                                isOpen ? "rotate-90" : ""
                              }`}
                            />
                            <span className="truncate max-w-[220px]">{item.promotion_name}</span>
                          </button>
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm truncate max-w-[160px]">
                          {item.seller_name}
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-right">
                          {item.orders}
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-right">
                          {item.units.toLocaleString("es-CO")}
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-right font-semibold">
                          {formatMoney(item.amount, { hideDecimals: true })}
                        </td>
                      </tr>

                      {isOpen &&
                        item.clients.map((client) => (
                          <tr
                            key={`${key}-${client.client_id}`}
                            className="border-b border-gray-100 dark:border-border bg-gray-50/60 dark:bg-secondary/30"
                          >
                            <td
                              colSpan={2}
                              className="py-2 px-2 sm:px-4 pl-8 sm:pl-10 text-xs sm:text-sm text-muted-foreground truncate max-w-[380px]"
                            >
                              {client.client_name}
                            </td>
                            <td className="py-2 px-2 sm:px-4 text-xs sm:text-sm text-right text-muted-foreground">
                              {client.orders}
                            </td>
                            <td className="py-2 px-2 sm:px-4 text-xs sm:text-sm text-right text-muted-foreground">
                              {client.units.toLocaleString("es-CO")}
                            </td>
                            <td className="py-2 px-2 sm:px-4 text-xs sm:text-sm text-right text-muted-foreground">
                              {formatMoney(client.amount, { hideDecimals: true })}
                            </td>
                          </tr>
                        ))}
                    </React.Fragment>
                  );
                })}
                </tbody>
              </table>
            </div>
            {total > PAGE_SIZE && (
              <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-3 px-2 sm:px-0 pt-4 pb-4 sm:pb-0">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Mostrando {(page - 1) * PAGE_SIZE + 1} a {Math.min(page * PAGE_SIZE, total)} de{" "}
                  {total} resultados
                </p>
                <Pagination
                  current={page}
                  total={total}
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
