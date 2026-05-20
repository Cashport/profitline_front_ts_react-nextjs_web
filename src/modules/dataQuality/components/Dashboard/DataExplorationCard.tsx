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

const months = [
  { id: "2026-05", name: "Mayo 2026" },
  { id: "2026-04", name: "Abril 2026" },
  { id: "2026-03", name: "Marzo 2026" },
  { id: "2026-02", name: "Febrero 2026" },
  { id: "2026-01", name: "Enero 2026" },
  { id: "2025-12", name: "Diciembre 2025" }
];

type DayData = {
  value: number | null;
  novedades: number;
  status: "received" | "missing" | "not-expected" | "future-expected";
};

type ClientDataRow = {
  client: string;
  country: string;
  periodicidad: "Diario" | "Semanal" | "Mensual";
  fileType: string;
  days: DayData[];
  total: number;
  totalNovedades: number;
};

const TODAY = 20;

const HARDCODED_COUNTRY = "all";
const HARDCODED_FILE_TYPE = "all";

function generateSampleData(): ClientDataRow[] {
  const clients = [
    { client: "Oxxo", country: "Mexico", periodicidad: "Semanal" as const, fileType: "Sales" },
    { client: "Soriana", country: "Mexico", periodicidad: "Diario" as const, fileType: "Stock" },
    { client: "Femsa", country: "Mexico", periodicidad: "Diario" as const, fileType: "Sales" },
    { client: "Fanasa", country: "Mexico", periodicidad: "Mensual" as const, fileType: "Stock" },
    {
      client: "Chedraui",
      country: "Mexico",
      periodicidad: "Semanal" as const,
      fileType: "Stock in transit"
    },
    { client: "Walmart", country: "Mexico", periodicidad: "Diario" as const, fileType: "Sales" },
    {
      client: "Farmacity",
      country: "Argentina",
      periodicidad: "Diario" as const,
      fileType: "Stock"
    },
    {
      client: "Disval",
      country: "Argentina",
      periodicidad: "Semanal" as const,
      fileType: "Sales"
    },
    {
      client: "Maxiconsumo",
      country: "Argentina",
      periodicidad: "Diario" as const,
      fileType: "Stock"
    },
    {
      client: "Farmatodo",
      country: "Colombia",
      periodicidad: "Diario" as const,
      fileType: "Sales"
    },
    { client: "Cafam", country: "Colombia", periodicidad: "Semanal" as const, fileType: "Stock" },
    {
      client: "Locatel",
      country: "Colombia",
      periodicidad: "Mensual" as const,
      fileType: "Stock in transit"
    },
    { client: "Nadro", country: "Mexico", periodicidad: "Mensual" as const, fileType: "Sales" }
  ];

  return clients.map((c) => {
    const days: DayData[] = [];
    let total = 0;
    let totalNovedades = 0;

    for (let d = 1; d <= 31; d++) {
      let expected = false;

      if (c.periodicidad === "Diario") {
        expected = true;
      } else if (c.periodicidad === "Semanal") {
        expected = [1, 8, 15, 22, 29].includes(d);
      } else if (c.periodicidad === "Mensual") {
        expected = d === 31;
      }

      if (!expected) {
        days.push({ value: null, novedades: 0, status: "not-expected" });
      } else if (d > TODAY) {
        days.push({ value: null, novedades: 0, status: "future-expected" });
      } else {
        const received = Math.random() > 0.15;
        if (received) {
          const value = Math.floor(200 + Math.random() * 400);
          const hasNovedades = Math.random() > 0.7;
          const novedades = hasNovedades ? Math.floor(value * (0.05 + Math.random() * 0.2)) : 0;
          days.push({ value, novedades, status: "received" });
          total += value;
          totalNovedades += novedades;
        } else {
          days.push({ value: 0, novedades: 0, status: "missing" });
        }
      }
    }

    return { ...c, days, total, totalNovedades };
  });
}

const allData = generateSampleData();

interface DataExplorationCardProps {
  idCountry?: number | string;
}

export function DataExplorationCard({ idCountry }: DataExplorationCardProps = {}) {
  const [search, setSearch] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("2026-05");
  const debouncedSearch = useDebounce(search, 400);

  const { data, error, isLoading } = useDataExploration(idCountry, {
    month: selectedMonth,
    search: debouncedSearch || undefined
  });

  console.log("Data Exploration - data:", data, "error:", error, "isLoading:", isLoading);

  const filteredData = useMemo(() => {
    return allData.filter((row) => {
      if (HARDCODED_COUNTRY !== "all" && row.country.toLowerCase() !== HARDCODED_COUNTRY)
        return false;
      if (HARDCODED_FILE_TYPE !== "all" && row.fileType !== HARDCODED_FILE_TYPE) return false;
      if (search) {
        const q = search.toLowerCase();
        return row.client.toLowerCase().includes(q) || row.country.toLowerCase().includes(q);
      }
      return true;
    });
  }, [search]);

  const daysInMonth = 31;
  const dayNumbers = Array.from({ length: daysInMonth }, (_, i) => i + 1);

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
              <th
                className="text-left px-2 py-1.5 font-medium sticky left-[90px] bg-[#F9FAFB] z-10"
                style={{ color: "#374151", minWidth: "65px" }}
              >
                Periodicidad
              </th>
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
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={35} className="text-center py-8 text-xs" style={{ color: "#6B7280" }}>
                  No se encontraron datos con los filtros actuales.
                </td>
              </tr>
            ) : (
              filteredData.map((row, idx) => {
                const novedadesPct =
                  row.total > 0 ? Math.round((row.totalNovedades / row.total) * 100) : 0;
                return (
                  <tr
                    key={`${row.client}-${row.fileType}-${idx}`}
                    className="border-b hover:bg-gray-50 transition-colors"
                    style={{ borderColor: "#F3F4F6" }}
                  >
                    <td
                      className="px-2 py-1 font-medium sticky left-0 bg-white z-10"
                      style={{ color: "#111827" }}
                    >
                      <div className="leading-tight">
                        <span className="block truncate" style={{ maxWidth: "85px" }}>
                          {row.client}
                        </span>
                        <span className="block" style={{ color: "#9CA3AF", fontSize: "9px" }}>
                          {row.country}
                        </span>
                      </div>
                    </td>
                    <td
                      className="px-2 py-1 sticky left-[90px] bg-white z-10"
                      style={{ color: "#6B7280" }}
                    >
                      {row.periodicidad}
                    </td>
                    {row.days.map((day, dayIdx) => {
                      let bgColor = "#ffffff";
                      let textColor = "#9CA3AF";
                      let borderStyle = "none";
                      const hasNovedades = day.novedades > 0;
                      const novedadesDayPct = day.value
                        ? Math.round((day.novedades / day.value) * 100)
                        : 0;

                      if (day.status === "received") {
                        if (hasNovedades) {
                          bgColor = "#FEF3C7";
                          textColor = "#92400E";
                        } else {
                          bgColor = "#D1FAE5";
                          textColor = "#065F46";
                        }
                      } else if (day.status === "missing") {
                        bgColor = "#FEE2E2";
                        textColor = "#991B1B";
                      } else if (day.status === "future-expected") {
                        bgColor = "#F9FAFB";
                        textColor = "#D1D5DB";
                        borderStyle = "1px dashed #E5E7EB";
                      }

                      const cellContent = (
                        <td
                          key={dayIdx}
                          className="text-center py-1 font-medium tabular-nums relative"
                          style={{
                            backgroundColor: bgColor,
                            color: textColor,
                            border: borderStyle
                          }}
                        >
                          {day.status === "received"
                            ? day.value
                            : day.status === "missing"
                              ? "-"
                              : day.status === "future-expected"
                                ? "..."
                                : ""}
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
                                    {day.novedades} novedades ({novedadesDayPct}%)
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
