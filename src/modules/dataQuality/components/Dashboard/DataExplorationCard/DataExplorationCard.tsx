"use client";

import { useState, useMemo } from "react";
import { Search, AlertTriangle } from "lucide-react";

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
import { IDataExplorationTotals } from "@/types/dataQuality/IDataQuality";

const months = [
  { id: "2026-05", name: "Mayo 2026" },
  { id: "2026-04", name: "Abril 2026" },
  { id: "2026-03", name: "Marzo 2026" },
  { id: "2026-02", name: "Febrero 2026" },
  { id: "2026-01", name: "Enero 2026" },
  { id: "2025-12", name: "Diciembre 2025" }
];

const DAYS_IN_MONTH = 31;
const TOTAL_COLUMNS = 34;

export function DataExplorationCard() {
  const { selectedCountry } = useDataQualityDashboardContext();
  const [search, setSearch] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("2026-05");
  const debouncedSearch = useDebounce(search, 400);

  const { data, error, isLoading } = useDataExploration({
    id_country: selectedCountry || undefined,
    month: selectedMonth,
    search: debouncedSearch || undefined
  });

  const dayNumbers = useMemo(
    () => Array.from({ length: DAYS_IN_MONTH }, (_, i) => i + 1),
    []
  );

  const { rows, lastDataDayIdx } = useMemo(() => {
    const computedRows = (data?.clients ?? []).map((client) => {
      const dayMap = new Map<number, IDataExplorationTotals>();
      for (const d of client.dates) {
        const dayNum = Number(d.date.slice(-2));
        if (!Number.isNaN(dayNum)) dayMap.set(dayNum, d.totals);
      }
      const days = dayNumbers.map((n) => dayMap.get(n) ?? null);

      return {
        id_client: client.id_client,
        client_name: client.client_name,
        country: client.dates[0]?.rows[0]?.country ?? "",
        days,
        total: client.totals.total_registros,
        totalNovedades: client.totals.novedades
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
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
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
                className="w-3 h-3 rounded border border-dashed"
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
                  row.total > 0 ? Math.round((row.totalNovedades / row.total) * 100) : 0;
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
                        <span className="block truncate" style={{ maxWidth: "85px" }}>
                          {row.client_name}
                        </span>
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
                      if (dayTotals === null) {
                        const isMissing = dayIdx < lastDataDayIdx;
                        return (
                          <td
                            key={dayIdx}
                            className="text-center py-1 font-medium tabular-nums"
                            style={
                              isMissing
                                ? { backgroundColor: "#FEE2E2", color: "#991B1B" }
                                : { backgroundColor: "#ffffff", color: "#9CA3AF" }
                            }
                          >
                            {isMissing ? "-" : ""}
                          </td>
                        );
                      }

                      const hasNovedades = dayTotals.novedades > 0;
                      const bgColor = hasNovedades ? "#FEF3C7" : "#D1FAE5";
                      const textColor = hasNovedades ? "#92400E" : "#065F46";
                      const novedadesDayPct =
                        dayTotals.total_registros > 0
                          ? Math.round((dayTotals.novedades / dayTotals.total_registros) * 100)
                          : 0;

                      const cellContent = (
                        <td
                          key={dayIdx}
                          className="text-center py-1 font-medium tabular-nums relative"
                          style={{ backgroundColor: bgColor, color: textColor }}
                        >
                          {dayTotals.total_registros}
                          {hasNovedades && (
                            <div
                              className="absolute top-0 right-0 w-0 h-0"
                              style={{
                                borderLeft: "6px solid transparent",
                                borderTop: "6px solid #F59E0B"
                              }}
                            />
                          )}
                        </td>
                      );

                      if (hasNovedades) {
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
                                    {dayTotals.novedades} novedades ({novedadesDayPct}%)
                                  </span>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        );
                      }

                      return cellContent;
                    })}
                    <td
                      className="text-right px-2 py-1 font-semibold tabular-nums"
                      style={{ color: "#111827" }}
                    >
                      {row.total.toLocaleString()}
                    </td>
                    <td className="text-right px-2 py-1 tabular-nums">
                      {row.totalNovedades > 0 ? (
                        <div className="flex items-center justify-end gap-1">
                          <span className="font-semibold" style={{ color: "#F59E0B" }}>
                            {row.totalNovedades.toLocaleString()}
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
