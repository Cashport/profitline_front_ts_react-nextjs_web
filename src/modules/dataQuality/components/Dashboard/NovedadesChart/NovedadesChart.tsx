"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from "recharts";

import { Card } from "@/modules/chat/ui/card";
import { IDashboardSummaryAlert } from "@/types/dataQuality/IDataQuality";

import { NovedadesAlertModal } from "../NovedadesAlertModal/NovedadesAlertModal";

interface NovedadesChartProps {
  alerts?: IDashboardSummaryAlert[];
}

export function NovedadesChart({ alerts }: NovedadesChartProps) {
  const [selectedAlert, setSelectedAlert] = useState<IDashboardSummaryAlert | null>(null);

  const data = alerts ?? [];
  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <>
      <Card className="bg-white p-5 flex flex-col h-full" style={{ borderColor: "#E5E7EB" }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold" style={{ color: "#000000" }}>
              Novedades
            </p>
            <span
              className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
              style={{ color: "#FF28FF", backgroundColor: "rgba(255,40,255,0.08)" }}
            >
              <AlertTriangle className="h-3 w-3" />
              {total} total
            </span>
          </div>
          <p className="text-xs" style={{ color: "#9CA3AF" }}>
            Clic en barra para ver clientes
          </p>
        </div>

        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 0, right: 40, left: 0, bottom: 0 }}>
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                width={130}
                tick={{ fontSize: 11, fill: "#8D979D" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: "rgba(0,0,0,0.04)" }}
                contentStyle={{
                  border: "1px solid #D0D3D4",
                  borderRadius: 8,
                  padding: "6px 10px",
                  fontSize: 12,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
                }}
                formatter={(value: number) => [`${value} casos`, ""]}
                labelStyle={{ fontWeight: 600, color: "#000000", marginBottom: 2 }}
              />
              <Bar
                dataKey="count"
                radius={[0, 4, 4, 0]}
                barSize={18}
                label={{ position: "right", fontSize: 11, fontWeight: 600, fill: "#000000" }}
                cursor="pointer"
                onClick={(entry) => setSelectedAlert(entry as unknown as IDashboardSummaryAlert)}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-3 pt-3 border-t" style={{ borderColor: "#E5E7EB" }}>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            {data.slice(0, 4).map((item) => (
              <button
                key={item.name}
                className="flex items-center gap-1.5 hover:opacity-70 transition-opacity"
                onClick={() => setSelectedAlert(item)}
              >
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-[11px]" style={{ color: "#8D979D" }}>
                  {item.name}
                </span>
                <span className="text-[11px] font-semibold" style={{ color: "#000000" }}>
                  {item.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </Card>

      <NovedadesAlertModal alert={selectedAlert} onClose={() => setSelectedAlert(null)} />
    </>
  );
}
