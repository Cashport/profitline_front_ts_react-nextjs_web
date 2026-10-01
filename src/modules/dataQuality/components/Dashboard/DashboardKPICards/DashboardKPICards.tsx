"use client";

import { useState } from "react";

import { Card } from "@/modules/chat/ui/card";
import { IDashboardSummaryKpis } from "@/types/dataQuality/IDataQuality";

interface DashboardKPICardsProps {
  kpis?: IDashboardSummaryKpis;
}

type ViewMode = "tipo" | "pais";

export function DashboardKPICards({ kpis }: DashboardKPICardsProps) {
  const [view, setView] = useState<ViewMode>("pais");

  const rows = view === "tipo" ? kpis?.byTypeArchive ?? [] : kpis?.byRegion ?? [];
  // TODO: connect to dashboardSummary.globalStatus.estado (or aggregate of current view)
  const receivedPercent = 0;

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
              <tr key={String(row.key)} className="border-b" style={{ borderColor: "#F3F4F6" }}>
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
