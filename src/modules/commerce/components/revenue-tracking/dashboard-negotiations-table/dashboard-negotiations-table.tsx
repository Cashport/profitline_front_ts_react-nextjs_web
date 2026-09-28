"use client";

import React, { useEffect, useMemo, useState } from "react";
import { message, Pagination, Switch } from "antd";
import { Download, Search } from "lucide-react";
import dayjs from "dayjs";

import { useAppStore } from "@/lib/store/store";
import { useDebounce } from "@/hooks/useDeabouce";
import { useMessageApi } from "@/context/MessageContext";
import { useRevenueTracking } from "@/modules/commerce/contexts/revenue-tracking-context";
import {
  buildNegotiationsParams,
  useDashboardSalesNegotiations
} from "@/modules/commerce/hooks/revenue-tracking/useDashboardSalesNegotiations";
import { downloadNegotiationsExcel } from "@/services/dashboardSales/dashboardSales";

import { Card, CardContent, CardHeader, CardTitle } from "@/modules/chat/ui/card";

const PAGE_SIZE = 25;

const formatDate = (value: string | null, withTime = false) =>
  value ? dayjs(value).format(withTime ? "DD/MM/YYYY HH:mm" : "DD/MM/YYYY") : "—";

const thClass =
  "py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-foreground tracking-wider";
const tdClass = "py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm";

export default function DashboardNegotiationsTable() {
  const formatMoney = useAppStore((state) => state.formatMoney);
  const { filters, includeIva } = useRevenueTracking();
  const { showMessage } = useMessageApi();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [includeExpired, setIncludeExpired] = useState(false);
  const [page, setPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);

  const filtersKey = useMemo(() => JSON.stringify(filters), [filters]);
  useEffect(() => {
    setPage(1);
  }, [filtersKey, debouncedSearch, includeExpired, includeIva]);

  const { data, isLoading, error } = useDashboardSalesNegotiations(
    filters,
    debouncedSearch,
    includeIva,
    includeExpired,
    page,
    PAGE_SIZE
  );

  const items = data?.negotiations ?? [];
  const total = data?.pagination.total_count ?? 0;
  const averageMonths = data?.periods.average_months;

  const handleExport = async () => {
    setIsExporting(true);
    const hide = message.open({
      type: "loading",
      content: "Generando informe de negociaciones...",
      duration: 0
    });
    try {
      const params = buildNegotiationsParams(filters, includeIva, debouncedSearch, includeExpired);
      const res = await downloadNegotiationsExcel(params);
      const link = document.createElement("a");
      link.href = res.url;
      link.download = res.filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      showMessage("success", "Descarga exitosa");
    } catch (err) {
      showMessage("error", err instanceof Error ? err.message : "Error al descargar el archivo");
    } finally {
      hide();
      setIsExporting(false);
    }
  };

  return (
    <Card className="bg-background border-0 shadow-sm py-0 gap-0">
      <CardHeader className="sm:p-6 !pb-0">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div>
            <CardTitle className="text-base sm:text-lg font-semibold">
              Informe de Negociaciones
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Clientes con descuento negociado (Plan Anual). Promedio de venta facturada de
              {averageMonths
                ? ` los últimos ${averageMonths} meses cerrados`
                : " los meses cerrados"}
              ; solo clientes con promedio mayor a cero.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
            <label className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <Switch size="small" checked={includeExpired} onChange={setIncludeExpired} />
              Incluir vencidas
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar cliente o NIT..."
                className="w-full sm:w-56 pl-9 pr-3 py-2 text-sm bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
              />
            </div>
            <button
              type="button"
              onClick={handleExport}
              disabled={total === 0 || isExporting}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-background border border-border rounded-lg hover:bg-secondary/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 sm:p-6">
        {isLoading && !data ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <p>Cargando datos...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <p>{error.message || "Error al cargar las negociaciones"}</p>
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
                    <th className={`text-left ${thClass}`}>Cliente</th>
                    <th className={`hidden md:table-cell text-left ${thClass}`}>Inicio</th>
                    <th className={`text-left ${thClass}`}>Fin</th>
                    <th className={`text-right ${thClass}`}>Negociación</th>
                    <th className={`text-right ${thClass}`}>Promedio mes</th>
                    <th className={`text-right ${thClass}`}>Último mes</th>
                    <th className={`hidden md:table-cell text-right ${thClass}`}>Última compra</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr
                      key={item.discount_id}
                      className="border-b border-gray-100 dark:border-border hover:bg-gray-50 dark:hover:bg-secondary/50 transition-colors"
                    >
                      <td className={tdClass}>
                        <div className="font-semibold truncate max-w-[260px]">
                          {item.client_name}
                        </div>
                        <div className="text-xs text-muted-foreground">{item.client_id}</div>
                      </td>
                      <td className={`hidden md:table-cell text-muted-foreground ${tdClass}`}>
                        {formatDate(item.start_date)}
                      </td>
                      <td className={`text-muted-foreground ${tdClass}`}>
                        {formatDate(item.end_date)}
                      </td>
                      <td className={`text-right ${tdClass}`}>{item.negotiation.label || "—"}</td>
                      <td className={`text-right font-semibold ${tdClass}`}>
                        {formatMoney(item.avg_month, { hideDecimals: true })}
                      </td>
                      <td className={`text-right ${tdClass}`}>
                        {formatMoney(item.last_month, { hideDecimals: true })}
                      </td>
                      <td
                        className={`hidden md:table-cell text-right text-muted-foreground ${tdClass}`}
                      >
                        {formatDate(item.last_purchase, true)}
                      </td>
                    </tr>
                  ))}
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
