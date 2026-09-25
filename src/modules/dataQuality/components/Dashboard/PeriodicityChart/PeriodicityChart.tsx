"use client";

import { Card } from "@/modules/chat/ui/card";
import { useDataQualityDashboardContext } from "@/modules/dataQuality/context/DataQualityDashboardContext";
import { useFileTypes } from "@/modules/dataQuality/hooks/useFileTypes";
import { IDashboardSummaryPeriodicity } from "@/types/dataQuality/IDataQuality";

interface PeriodicityChartProps {
  periodicity?: IDashboardSummaryPeriodicity[];
}

const COLORS = {
  processado: "#30EA03",
  novedad: "#FF28FF",
  retraso: "#AD7BFF",
  pendiente: "#D0D3D4"
};

export function PeriodicityChart({ periodicity }: PeriodicityChartProps) {
  const { selectedFileType } = useDataQualityDashboardContext();
  const { data: fileTypesData } = useFileTypes();
  const data = periodicity ?? [];

  const selectedFileTypeLabel =
    selectedFileType && selectedFileType !== "all"
      ? fileTypesData?.find((t) => String(t.id) === selectedFileType)?.description
      : undefined;

  const totals = {
    processado: data.reduce((sum, d) => sum + d.procesados, 0),
    novedad: data.reduce((sum, d) => sum + d.novedades, 0),
    retraso: data.reduce((sum, d) => sum + d.retrasados, 0),
    pendiente: data.reduce((sum, d) => sum + d.pendientes, 0)
  };

  return (
    <Card className="p-6" style={{ borderColor: "#E5E7EB" }}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold" style={{ color: "#000000" }}>
            Archivos por periodicidad
          </h3>
          {selectedFileTypeLabel && (
            <span
              className="text-xs px-2 py-0.5 rounded-md font-medium"
              style={{ backgroundColor: "#F3F4F6", color: "#374151" }}
            >
              {selectedFileTypeLabel}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS.processado }} />
            <span style={{ color: "#6B7280" }}>Processado</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS.novedad }} />
            <span style={{ color: "#6B7280" }}>Novedad</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS.retraso }} />
            <span style={{ color: "#6B7280" }}>Retraso</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS.pendiente }} />
            <span style={{ color: "#6B7280" }}>Pendiente</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {data.map((item) => {
          const total = item.total_archivos;
          const processadoWidth = total > 0 ? (item.procesados / total) * 100 : 0;
          const novedadWidth = total > 0 ? (item.novedades / total) * 100 : 0;
          const retrasoWidth = total > 0 ? (item.retrasados / total) * 100 : 0;
          const pendienteWidth = total > 0 ? (item.pendientes / total) * 100 : 0;

          return (
            <div key={item.periodicity} className="flex items-center gap-4">
              <div className="w-16">
                <div className="text-xs font-semibold" style={{ color: "#111827" }}>
                  {item.periodicity}
                </div>
                <div className="text-xs" style={{ color: "#9CA3AF" }}>
                  {item.total_archivos} arch.
                </div>
              </div>

              <div className="flex-1 flex items-center gap-3">
                <div
                  className="flex-1 h-7 rounded-lg overflow-hidden flex"
                  style={{ backgroundColor: "#F3F4F6" }}
                >
                  {item.procesados > 0 && (
                    <div
                      className="h-full flex items-center justify-center text-xs font-semibold text-white relative"
                      style={{ width: `${processadoWidth}%`, backgroundColor: COLORS.processado }}
                    >
                      <span className="absolute">{item.procesados}</span>
                    </div>
                  )}
                  {item.novedades > 0 && (
                    <div
                      className="h-full flex items-center justify-center text-xs font-semibold text-white relative"
                      style={{ width: `${novedadWidth}%`, backgroundColor: COLORS.novedad }}
                    >
                      <span className="absolute">{item.novedades}</span>
                    </div>
                  )}
                  {item.retrasados > 0 && (
                    <div
                      className="h-full flex items-center justify-center text-xs font-semibold text-white relative"
                      style={{ width: `${retrasoWidth}%`, backgroundColor: COLORS.retraso }}
                    >
                      <span className="absolute">{item.retrasados}</span>
                    </div>
                  )}
                  {item.pendientes > 0 && (
                    <div
                      className="h-full flex items-center justify-center text-xs font-semibold relative"
                      style={{ width: `${pendienteWidth}%`, backgroundColor: COLORS.pendiente, color: "#555" }}
                    >
                      <span className="absolute">{item.pendientes}</span>
                    </div>
                  )}
                </div>

                <div className="text-xs text-right" style={{ color: "#9CA3AF", minWidth: "60px" }}>
                  {item.total_archivos - item.procesados} pend.
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div
        className="flex items-center gap-4 mt-5 pt-4 border-t text-xs"
        style={{ borderColor: "#E5E7EB" }}
      >
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS.processado }} />
          <span style={{ color: "#6B7280" }}>
            Processado: <strong style={{ color: "#111827" }}>{totals.processado}</strong>
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS.novedad }} />
          <span style={{ color: "#6B7280" }}>
            Novedad: <strong style={{ color: "#111827" }}>{totals.novedad}</strong>
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS.retraso }} />
          <span style={{ color: "#6B7280" }}>
            Retraso: <strong style={{ color: "#111827" }}>{totals.retraso}</strong>
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS.pendiente }} />
          <span style={{ color: "#6B7280" }}>
            Pendiente: <strong style={{ color: "#111827" }}>{totals.pendiente}</strong>
          </span>
        </div>
      </div>
    </Card>
  );
}
