"use client";

import { useState } from "react";

import { Card } from "@/modules/chat/ui/card";
import { useDataQualityDashboardContext } from "@/modules/dataQuality/context/DataQualityDashboardContext";

interface DashboardKPICardsProps {
  mockData?: boolean;
}

type ViewMode = "tipo" | "pais";

const byTipo = [
  { label: "Sales", esperados: 62, transformados: 31, novedades: 8, pendientes: 23 },
  { label: "Stock", esperados: 50, transformados: 25, novedades: 5, pendientes: 20 },
  { label: "Stock in transit", esperados: 50, transformados: 25, novedades: 5, pendientes: 20 }
];

const byPais = [
  { label: "Argentina", esperados: 37, transformados: 22, novedades: 56, pendientes: 11 },
  { label: "Colombia", esperados: 10, transformados: 5, novedades: 27, pendientes: 3 },
  { label: "Mexico", esperados: 15, transformados: 5, novedades: 32, pendientes: 9 },
  { label: "Peru", esperados: 6, transformados: 3, novedades: 1, pendientes: 2 },
  { label: "Chile", esperados: 5, transformados: 3, novedades: 0, pendientes: 2 },
  { label: "Ecuador", esperados: 5, transformados: 2, novedades: 1, pendientes: 2 }
];

export function DashboardKPICards({ mockData = false }: DashboardKPICardsProps) {
  const { selectedFileType } = useDataQualityDashboardContext();
  const [view, setView] = useState<ViewMode>("pais");

  const baseRows = view === "tipo" ? byTipo : byPais;
  const filteredBase =
    view === "tipo" && selectedFileType && selectedFileType !== "all"
      ? baseRows.filter((r) => r.label === selectedFileType)
      : baseRows;
  const rows = mockData ? filteredBase : [];
  const totalEsperados = rows.reduce((s, r) => s + r.esperados, 0);
  const totalTransformados = rows.reduce((s, r) => s + r.transformados, 0);
  const receivedPercent =
    totalEsperados > 0 ? Math.round((totalTransformados / totalEsperados) * 100) : 0;

  return (
    <Card className="bg-white overflow-hidden flex flex-col p-6" style={{ borderColor: "#E5E7EB" }}>
      <div className="flex items-center mb-5">
        <h3 className="text-sm font-semibold flex-1" style={{ color: "#000000" }}>
          Estado de archivos
        </h3>

        <div className="flex items-center rounded-lg p-0.5" style={{ backgroundColor: "#F3F4F6" }}>
          {(["tipo", "pais"] as ViewMode[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className="px-3 py-1 text-xs font-medium rounded-md transition-all"
              style={{
                backgroundColor: view === v ? "#ffffff" : "transparent",
                color: view === v ? "#111827" : "#6B7280",
                boxShadow: view === v ? "0 1px 3px rgba(0,0,0,0.08)" : "none"
              }}
            >
              {v === "tipo" ? "Por tipo" : "Por país"}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-1 justify-end">
          <span className="text-xs" style={{ color: "#9CA3AF" }}>
            Estado general
          </span>
          <div
            className="h-1 w-14 rounded-full overflow-hidden"
            style={{ backgroundColor: "#E5E7EB" }}
          >
            <div
              className="h-full transition-all"
              style={{ width: `${receivedPercent}%`, backgroundColor: "#30EA03" }}
            />
          </div>
          <span className="text-sm font-bold" style={{ color: "#30EA03" }}>
            {receivedPercent}%
          </span>
        </div>
      </div>

      <table className="w-full">
        <thead>
          <tr className="border-b" style={{ borderColor: "#E5E7EB" }}>
            <th
              className="text-left px-3 py-3 text-xs font-medium"
              style={{ color: "#6B7280" }}
            >
              {view === "tipo" ? "Tipo" : "País"}
            </th>
            <th
              className="text-left px-3 py-3 text-xs font-medium w-40"
              style={{ color: "#6B7280" }}
            >
              Estado
            </th>
            <th
              className="text-center px-3 py-3 text-xs font-medium"
              style={{ color: "#6B7280" }}
            >
              Esperados
            </th>
            <th
              className="text-center px-3 py-3 text-xs font-medium"
              style={{ color: "#6B7280" }}
            >
              Transformados
            </th>
            <th
              className="text-center px-3 py-3 text-xs font-medium"
              style={{ color: "#6B7280" }}
            >
              Novedades
            </th>
            <th
              className="text-center px-3 py-3 text-xs font-medium"
              style={{ color: "#6B7280" }}
            >
              Pendientes
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const pct =
              row.esperados > 0 ? Math.round((row.transformados / row.esperados) * 100) : 0;
            return (
              <tr key={row.label} className="border-b" style={{ borderColor: "#F3F4F6" }}>
                <td className="px-3 py-3 text-sm font-medium" style={{ color: "#111827" }}>
                  {row.label}
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="flex-1 h-1.5 rounded-full overflow-hidden"
                      style={{ backgroundColor: "#E5E7EB" }}
                    >
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: "#30EA03" }}
                      />
                    </div>
                    <span
                      className="text-xs font-semibold tabular-nums w-8 text-right"
                      style={{ color: "#111827" }}
                    >
                      {pct}%
                    </span>
                  </div>
                </td>
                <td className="px-3 py-3 text-center">
                  <span className="text-sm font-medium" style={{ color: "#6B7280" }}>
                    {row.esperados}
                  </span>
                </td>
                <td className="px-3 py-3 text-center">
                  <span className="text-sm font-semibold" style={{ color: "#10B981" }}>
                    {row.transformados}
                  </span>
                </td>
                <td className="px-3 py-3 text-center">
                  <span className="text-sm font-semibold" style={{ color: "#EC4899" }}>
                    {row.novedades}
                  </span>
                </td>
                <td className="px-3 py-3 text-center">
                  <span className="text-sm font-semibold" style={{ color: "#F59E0B" }}>
                    {row.pendientes}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}
