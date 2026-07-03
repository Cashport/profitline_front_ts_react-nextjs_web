"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, AlertTriangle, ArrowUpRight } from "lucide-react";

import { Card } from "@/modules/chat/ui/card";
import { Input } from "@/modules/chat/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/modules/chat/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/modules/chat/ui/select";
import { useDebounce } from "@/hooks/useDeabouce";
import { useDataExploration } from "@/modules/dataQuality/hooks/useDataExploration";
import { useDataQualityDashboardContext } from "@/modules/dataQuality/context/DataQualityDashboardContext";
import { buildLastSixMonths } from "@/modules/dataQuality/utils/months";
import { formatNumber } from "@/utils/utils";
import { formatThousandNum } from "@/modules/dataQuality/utils/utils";
import { IDataExplorationTotals } from "@/types/dataQuality/IDataQuality";

const DAYS_IN_MONTH = 31;
const TOTAL_COLUMNS = 35;

type DayCell = IDataExplorationTotals & { novedades_percent: number };

export function DataExplorationCard() {
  const { selectedCountry, selectedPeriod, setSelectedPeriod, selectedFileType } =
    useDataQualityDashboardContext();
  const [search, setSearch] = useState("");
  const months = useMemo(buildLastSixMonths, []);
  const debouncedSearch = useDebounce(search, 400);

  const { data, error, isLoading } = useDataExploration({
    id_country: selectedCountry || undefined,
    month: selectedPeriod,
    id_type_archive: selectedFileType && selectedFileType !== "all" ? selectedFileType : undefined,
    search: debouncedSearch || undefined
  });

  const dayNumbers = useMemo(() => Array.from({ length: DAYS_IN_MONTH }, (_, i) => i + 1), []);

  const { rows, lastDataDayIdx } = useMemo(() => {
    const computedRows = (data?.clients ?? []).map((client) => {
      const dayMap = new Map<number, DayCell>();
      for (const d of client.dates) {
        const dayNum = Number(d.date.slice(-2));
        if (!Number.isNaN(dayNum)) {
          dayMap.set(dayNum, { ...d.totals, novedades_percent: d.novedades_percent ?? 0 });
        }
      }
      const days = dayNumbers.map((n) => dayMap.get(n) ?? null);

      return {
        id_client: client.id_client,
        client_name: client.client_name,
        country: client.dates[0]?.rows[0]?.country ?? "",
        country_client_id: client.country_client_id,
        days,
        total: client.totals.units_haleon,
        totalRegistros: client.totals.total_registros,
        totalNovedades: client.totals.novedades,
        lastMonth: client.last_month
      };
    });

    let lastDataDayIdx = -1;
    for (const row of computedRows) {
      for (let i = row.days.length - 1; i >= 0; i--) {
        if (row.days[i] !== null) {
          if (i > lastDataDayIdx) lastDataDayIdx = i;
          break;
        }
      }
    }

    return { rows: computedRows, lastDataDayIdx };
  }, [data, dayNumbers]);

  const todayDayCutoff = useMemo(() => {
    const [year, month] = selectedPeriod.split("-").map(Number);
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      return Infinity;
    }
    if (year > currentYear || (year === currentYear && month > currentMonth)) {
      return 0;
    }
    return today.getDate();
  }, [selectedPeriod]);

  return (
    <Card
      className="bg-white overflow-hidden border-0 shadow-none"
      style={{ border: "none", boxShadow: "none", textShadow: "none" }}
    >
      <div
        className="px-6 py-4 flex items-center justify-between"
        style={{ borderColor: "#E5E7EB" }}
      >
        <div className="flex items-center gap-4">
          <div>
            <h3 className="text-sm font-semibold" style={{ color: "#000000" }}>
              Exploración de Datos
            </h3>
            <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>
              Unidades recibidas por día del mes
            </p>
          </div>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[150px] h-8 text-xs" style={{ borderColor: "#E5E7EB" }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((m) => (
                <SelectItem key={m.id} value={m.id} className="text-xs">
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 text-xs" style={{ color: "#6B7280" }}>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: "#D1FAE5" }} />
              <span>Recibido</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: "#FEF3C7" }} />
              <span>Con novedades</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: "#FEE2E2" }} />
              <span>Faltante</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded border"
                style={{ backgroundColor: "#F9FAFB", borderColor: "#E5E7EB" }}
              />
              <span>Esperado</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded border"
                style={{ backgroundColor: "#ffffff", borderColor: "#E5E7EB" }}
              />
              <span>No esperado</span>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 w-48 text-sm rounded-lg"
              style={{ borderColor: "#E5E7EB" }}
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full" style={{ fontSize: "10px" }}>
          <thead>
            <tr className="border-b" style={{ borderColor: "#E5E7EB", backgroundColor: "#F9FAFB" }}>
              <th
                className="text-left px-2 py-1.5 font-medium sticky left-0 bg-[#F9FAFB] z-10"
                style={{ color: "#374151", minWidth: "90px" }}
              >
                Cliente
              </th>
              {/* TODO: re-enable Periodicidad column once API exposes per-client periodicity */}
              {/*
              <th
                className="text-left px-2 py-1.5 font-medium sticky left-[90px] bg-[#F9FAFB] z-10"
                style={{ color: "#374151", minWidth: "65px" }}
              >
                Periodicidad
              </th>
              */}
              {dayNumbers.map((d) => (
                <th
                  key={d}
                  className="text-center py-1.5 font-medium"
                  style={{ color: "#374151", minWidth: "28px", width: "28px" }}
                >
                  {d}
                </th>
              ))}
              <th
                className="text-right px-2 py-1.5 font-semibold"
                style={{ color: "#374151", minWidth: "50px" }}
              >
                Total
              </th>
              <th
                className="text-right px-2 py-1.5 font-semibold"
                style={{ color: "#374151", minWidth: "55px" }}
              >
                Novedades
              </th>
              <th
                className="text-right px-2 py-1.5 font-semibold"
                style={{ color: "#374151", minWidth: "70px" }}
              >
                Total mes ant.
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={TOTAL_COLUMNS}
                  className="text-center py-8 text-xs"
                  style={{ color: "#6B7280" }}
                >
                  Cargando…
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td
                  colSpan={TOTAL_COLUMNS}
                  className="text-center py-8 text-xs"
                  style={{ color: "#991B1B" }}
                >
                  Error al cargar los datos.
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={TOTAL_COLUMNS}
                  className="text-center py-8 text-xs"
                  style={{ color: "#6B7280" }}
                >
                  No se encontraron datos con los filtros actuales.
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => {
                const novedadesPct =
                  row.totalRegistros > 0
                    ? Math.round((row.totalNovedades / row.totalRegistros) * 100)
                    : 0;
                return (
                  <tr
                    key={`${row.id_client}-${idx}`}
                    className="border-b hover:bg-gray-50 transition-colors"
                    style={{ borderColor: "#F3F4F6" }}
                  >
                    <td
                      className="px-2 py-1 font-medium sticky left-0 bg-white z-10"
                      style={{ color: "#111827" }}
                    >
                      <div className="leading-tight">
                        <Link
                          href={`/data-quality/client/${row.id_client}`}
                          className="block truncate hover:underline"
                          style={{ maxWidth: "85px" }}
                          title={row.client_name}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {row.client_name}
                        </Link>
                        <span className="block" style={{ color: "#9CA3AF", fontSize: "9px" }}>
                          {row.country}
                        </span>
                      </div>
                    </td>
                    {/* TODO: re-enable Periodicidad column once API exposes per-client periodicity */}
                    {/*
                    <td
                      className="px-2 py-1 sticky left-[90px] bg-white z-10"
                      style={{ color: "#6B7280" }}
                    >
                      {row.periodicidad}
                    </td>
                    */}
                    {row.days.map((dayTotals, dayIdx) => {
                      const dayNumber = dayIdx + 1;
                      const isFutureDay = dayNumber > todayDayCutoff;
                      const isWithinReportedRange = dayIdx < lastDataDayIdx;

                      if (dayTotals === null) {
                        const showAsExpected = isFutureDay || isWithinReportedRange;
                        return (
                          <td
                            key={dayIdx}
                            className="text-center py-1 font-medium tabular-nums"
                            style={
                              showAsExpected
                                ? { backgroundColor: "#F9FAFB", color: "#9CA3AF" }
                                : { backgroundColor: "#ffffff", color: "#9CA3AF" }
                            }
                          >
                            {showAsExpected ? "⋯" : ""}
                          </td>
                        );
                      }

                      if (dayTotals.novedades > 0) {
                        const catalogHref = row.country_client_id
                          ? `/data-quality/catalogs/${row.id_client}/${row.country_client_id}` +
                            `?clientName=${encodeURIComponent(row.client_name)}` +
                            `&countryName=${encodeURIComponent(row.country)}`
                          : null;
                        const cellContent = (
                          <td
                            key={dayIdx}
                            className="text-center py-1 font-medium tabular-nums relative"
                            style={{ backgroundColor: "#FEF3C7", color: "#92400E" }}
                          >
                            {formatThousandNum(dayTotals.units_haleon)}
                            <div
                              className="absolute top-0 right-0 w-0 h-0"
                              style={{
                                borderLeft: "6px solid transparent",
                                borderTop: "6px solid #F59E0B"
                              }}
                            />
                          </td>
                        );

                        return (
                          <TooltipProvider key={dayIdx} delayDuration={100}>
                            <Tooltip>
                              <TooltipTrigger asChild>{cellContent}</TooltipTrigger>
                              <TooltipContent
                                side="top"
                                className="text-xs px-2 py-1.5"
                                style={{ backgroundColor: "#1F2937", color: "#fff" }}
                              >
                                <div className="flex items-center gap-1.5">
                                  <AlertTriangle className="w-3 h-3" style={{ color: "#FBBF24" }} />
                                  <span>
                                    {formatNumber(dayTotals.novedades)} novedades (
                                    {dayTotals.novedades_percent}%)
                                  </span>
                                  {catalogHref && (
                                    <Link
                                      href={catalogHref}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      title="Ir al catálogo del cliente"
                                      className="ml-1 inline-flex hover:opacity-80"
                                    >
                                      <ArrowUpRight
                                        className="w-3.5 h-3.5"
                                        style={{ color: "#FBBF24" }}
                                      />
                                    </Link>
                                  )}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        );
                      }

                      if (dayTotals.units_haleon === 0) {
                        if (isFutureDay) {
                          return (
                            <td
                              key={dayIdx}
                              className="text-center py-1 font-medium tabular-nums"
                              style={{ backgroundColor: "#F9FAFB", color: "#9CA3AF" }}
                            >
                              ⋯
                            </td>
                          );
                        }
                        return (
                          <td
                            key={dayIdx}
                            className="text-center py-1 font-medium tabular-nums"
                            style={
                              isWithinReportedRange
                                ? { backgroundColor: "#FEE2E2", color: "#991B1B" }
                                : { backgroundColor: "#ffffff", color: "#9CA3AF" }
                            }
                          >
                            {isWithinReportedRange ? "-" : ""}
                          </td>
                        );
                      }

                      return (
                        <td
                          key={dayIdx}
                          className="text-center py-1 font-medium tabular-nums"
                          style={{ backgroundColor: "#D1FAE5", color: "#065F46" }}
                        >
                          {formatThousandNum(dayTotals.units_haleon)}
                        </td>
                      );
                    })}
                    <td
                      className="text-right px-2 py-1 font-semibold tabular-nums"
                      style={{ color: "#111827" }}
                    >
                      {formatNumber(row.total)}
                    </td>
                    <td className="text-right px-2 py-1 tabular-nums">
                      {row.totalNovedades > 0 ? (
                        <div className="flex items-center justify-end gap-1">
                          <span className="font-semibold" style={{ color: "#F59E0B" }}>
                            {formatNumber(row.totalNovedades)}
                          </span>
                          <span
                            className="text-[9px] px-1 py-0.5 rounded"
                            style={{ backgroundColor: "#FEF3C7", color: "#92400E" }}
                          >
                            {novedadesPct}%
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: "#9CA3AF" }}>-</span>
                      )}
                    </td>
                    {(() => {
                      const lastMonth = row.lastMonth;

                      if (lastMonth == null) {
                        return (
                          <td
                            className="text-center px-2 py-1 font-semibold tabular-nums"
                            style={{ backgroundColor: "#F9FAFB", color: "#9CA3AF" }}
                          >
                            ⋯
                          </td>
                        );
                      }

                      if (lastMonth.units_haleon === 0 && lastMonth.novedades === 0) {
                        return (
                          <td
                            className="text-center px-2 py-1 font-semibold tabular-nums"
                            style={{ backgroundColor: "#FEE2E2", color: "#991B1B" }}
                          >
                            -
                          </td>
                        );
                      }

                      if (lastMonth.novedades > 0) {
                        const cellContent = (
                          <td
                            className="text-right px-2 py-1 font-semibold tabular-nums relative"
                            style={{ backgroundColor: "#FEF3C7", color: "#92400E" }}
                          >
                            {formatThousandNum(lastMonth.units_haleon)}
                            <div
                              className="absolute top-0 right-0 w-0 h-0"
                              style={{
                                borderLeft: "6px solid transparent",
                                borderTop: "6px solid #F59E0B"
                              }}
                            />
                          </td>
                        );

                        return (
                          <TooltipProvider delayDuration={100}>
                            <Tooltip>
                              <TooltipTrigger asChild>{cellContent}</TooltipTrigger>
                              <TooltipContent
                                side="top"
                                className="text-xs px-2 py-1.5"
                                style={{ backgroundColor: "#1F2937", color: "#fff" }}
                              >
                                <div className="flex items-center gap-1.5">
                                  <AlertTriangle className="w-3 h-3" style={{ color: "#FBBF24" }} />
                                  <span>
                                    {formatNumber(lastMonth.novedades)} novedades (
                                    {lastMonth.novedades_percent}%)
                                  </span>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        );
                      }

                      return (
                        <td
                          className="text-right px-2 py-1 font-semibold tabular-nums"
                          style={{ backgroundColor: "#D1FAE5", color: "#065F46" }}
                        >
                          {formatThousandNum(lastMonth.units_haleon)}
                        </td>
                      );
                    })()}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
