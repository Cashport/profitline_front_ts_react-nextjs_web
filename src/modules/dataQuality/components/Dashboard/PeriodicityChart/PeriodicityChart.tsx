"use client";

import { Card } from "@/modules/chat/ui/card";
import { useDataQualityDashboardContext } from "@/modules/dataQuality/context/DataQualityDashboardContext";

interface PeriodicityChartProps {
  mockData?: boolean;
}

type PeriodicityData = {
  label: string;
  count: number;
  processado: number;
  novedad: number;
  retraso: number;
  pendiente: number;
};

const COLORS = {
  processado: "#30EA03",
  novedad: "#FF28FF",
  retraso: "#AD7BFF",
  pendiente: "#D0D3D4"
};

const periodicityByFileType: Record<string, PeriodicityData[]> = {
  all: [
    { label: "Diario", count: 17, processado: 10, novedad: 3, retraso: 0, pendiente: 4 },
    { label: "Semanal", count: 10, processado: 4, novedad: 0, retraso: 3, pendiente: 3 },
    { label: "Mensual", count: 35, processado: 14, novedad: 0, retraso: 7, pendiente: 14 }
  ],
  Sales: [
    { label: "Diario", count: 8, processado: 5, novedad: 2, retraso: 0, pendiente: 1 },
    { label: "Semanal", count: 4, processado: 2, novedad: 0, retraso: 1, pendiente: 1 },
    { label: "Mensual", count: 12, processado: 5, novedad: 0, retraso: 3, pendiente: 4 }
  ],
  Stock: [
    { label: "Diario", count: 7, processado: 4, novedad: 1, retraso: 0, pendiente: 2 },
    { label: "Semanal", count: 4, processado: 1, novedad: 0, retraso: 2, pendiente: 1 },
    { label: "Mensual", count: 18, processado: 7, novedad: 0, retraso: 3, pendiente: 8 }
  ],
  "Stock in transit": [
    { label: "Diario", count: 2, processado: 1, novedad: 0, retraso: 0, pendiente: 1 },
    { label: "Semanal", count: 2, processado: 1, novedad: 0, retraso: 0, pendiente: 1 },
    { label: "Mensual", count: 5, processado: 2, novedad: 0, retraso: 1, pendiente: 2 }
  ]
};

export function PeriodicityChart({ mockData = false }: PeriodicityChartProps) {
  const { selectedFileType } = useDataQualityDashboardContext();
  const fileTypeKey =
    selectedFileType && periodicityByFileType[selectedFileType] ? selectedFileType : "all";
  const data = mockData ? periodicityByFileType[fileTypeKey] : [];

  const totals = {
    processado: data.reduce((sum, d) => sum + d.processado, 0),
    novedad: data.reduce((sum, d) => sum + d.novedad, 0),
    retraso: data.reduce((sum, d) => sum + d.retraso, 0),
    pendiente: data.reduce((sum, d) => sum + d.pendiente, 0)
  };

  return (
    <Card className="p-6" style={{ borderColor: "#E5E7EB" }}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold" style={{ color: "#000000" }}>
            Archivos por periodicidad
          </h3>
          {selectedFileType && selectedFileType !== "all" && (
            <span
              className="text-xs px-2 py-0.5 rounded-md font-medium"
              style={{ backgroundColor: "#F3F4F6", color: "#374151" }}
            >
              {selectedFileType}
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
          const total = item.count;
          const processadoWidth = (item.processado / total) * 100;
          const novedadWidth = (item.novedad / total) * 100;
          const retrasoWidth = (item.retraso / total) * 100;
          const pendienteWidth = (item.pendiente / total) * 100;

          return (
            <div key={item.label} className="flex items-center gap-4">
              <div className="w-16">
                <div className="text-xs font-semibold" style={{ color: "#111827" }}>
                  {item.label}
                </div>
                <div className="text-xs" style={{ color: "#9CA3AF" }}>
                  {item.count} arch.
                </div>
              </div>

              <div className="flex-1 flex items-center gap-3">
                <div
                  className="flex-1 h-7 rounded-lg overflow-hidden flex"
                  style={{ backgroundColor: "#F3F4F6" }}
                >
                  {item.processado > 0 && (
                    <div
                      className="h-full flex items-center justify-center text-xs font-semibold text-white relative"
                      style={{ width: `${processadoWidth}%`, backgroundColor: COLORS.processado }}
                    >
                      <span className="absolute">{item.processado}</span>
                    </div>
                  )}
                  {item.novedad > 0 && (
                    <div
                      className="h-full flex items-center justify-center text-xs font-semibold text-white relative"
                      style={{ width: `${novedadWidth}%`, backgroundColor: COLORS.novedad }}
                    >
                      <span className="absolute">{item.novedad}</span>
                    </div>
                  )}
                  {item.retraso > 0 && (
                    <div
                      className="h-full flex items-center justify-center text-xs font-semibold text-white relative"
                      style={{ width: `${retrasoWidth}%`, backgroundColor: COLORS.retraso }}
                    >
                      <span className="absolute">{item.retraso}</span>
                    </div>
                  )}
                  {item.pendiente > 0 && (
                    <div
                      className="h-full flex items-center justify-center text-xs font-semibold relative"
                      style={{ width: `${pendienteWidth}%`, backgroundColor: COLORS.pendiente, color: "#555" }}
                    >
                      <span className="absolute">{item.pendiente}</span>
                    </div>
                  )}
                </div>

                <div className="text-xs text-right" style={{ color: "#9CA3AF", minWidth: "60px" }}>
                  {item.count - item.processado} pend.
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
