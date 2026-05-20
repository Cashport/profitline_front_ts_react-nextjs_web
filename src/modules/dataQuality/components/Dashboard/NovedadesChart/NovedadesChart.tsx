"use client";

import { useState } from "react";
import { AlertTriangle, Eye } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from "recharts";

import { Card } from "@/modules/chat/ui/card";
import { Button } from "@/modules/chat/ui/button";
import { Dialog, DialogContent } from "@/modules/chat/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/modules/chat/ui/table";
import { useDataQualityDashboardContext } from "@/modules/dataQuality/context/DataQualityDashboardContext";

interface NovedadesChartProps {
  mockData?: boolean;
}

type ClientEntry = {
  name: string;
  country: string;
  fileType: string;
  tier?: "oro" | "plata" | "bronce";
  status: "Pendiente" | "Procesado" | "Retraso";
  date: string;
};

type NovedadType = {
  name: string;
  count: number;
  color: string;
  clients: ClientEntry[];
};

const allNovedades: NovedadType[] = [
  {
    name: "Archivo pendiente",
    count: 23,
    color: "#FF28FF",
    clients: [
      { name: "20 De Junio", country: "Argentina", fileType: "Stock", tier: "bronce", status: "Pendiente", date: "2026-04-05" },
      { name: "Asoprofarma", country: "Argentina", fileType: "Sales", tier: "bronce", status: "Pendiente", date: "2026-04-06" },
      { name: "Asoprofarma", country: "Argentina", fileType: "Stock", tier: "bronce", status: "Pendiente", date: "2026-04-06" },
      { name: "Jufec", country: "Argentina", fileType: "Sales", tier: "bronce", status: "Pendiente", date: "2026-04-07" },
      { name: "Maxiconsumo", country: "Argentina", fileType: "Stock", tier: "plata", status: "Pendiente", date: "2026-04-07" },
      { name: "Chedraui", country: "Mexico", fileType: "Stock", tier: "oro", status: "Pendiente", date: "2026-04-06" },
      { name: "Walmart", country: "Mexico", fileType: "Sales", tier: "oro", status: "Pendiente", date: "2026-04-08" },
      { name: "Walmart", country: "Mexico", fileType: "Stock", tier: "oro", status: "Pendiente", date: "2026-04-08" },
      { name: "Oxxo", country: "Mexico", fileType: "Stock", tier: "oro", status: "Pendiente", date: "2026-04-07" },
      { name: "Sam's Club", country: "Mexico", fileType: "Stock", tier: "plata", status: "Pendiente", date: "2026-04-06" },
      { name: "Cafam", country: "Colombia", fileType: "Stock", tier: "plata", status: "Pendiente", date: "2026-04-08" },
      { name: "Farmatodo", country: "Colombia", fileType: "Sales", tier: "oro", status: "Pendiente", date: "2026-04-08" },
      { name: "Locatel", country: "Colombia", fileType: "Stock", tier: "plata", status: "Pendiente", date: "2026-04-07" }
    ]
  },
  {
    name: "Error en curaduria",
    count: 12,
    color: "#AD7BFF",
    clients: [
      { name: "Disval", country: "Argentina", fileType: "Sales", tier: "plata", status: "Retraso", date: "2026-04-06" },
      { name: "El Indio", country: "Argentina", fileType: "Stock", tier: "bronce", status: "Retraso", date: "2026-04-07" },
      { name: "Farmacity", country: "Argentina", fileType: "Stock", tier: "oro", status: "Retraso", date: "2026-04-08" },
      { name: "Makro", country: "Argentina", fileType: "Stock", tier: "oro", status: "Retraso", date: "2026-04-05" },
      { name: "Nadro", country: "Mexico", fileType: "Stock", tier: "plata", status: "Retraso", date: "2026-04-07" },
      { name: "Drogueria Alemana", country: "Colombia", fileType: "Stock", tier: "bronce", status: "Retraso", date: "2026-04-06" }
    ]
  },
  {
    name: "SKUs sin mapear",
    count: 9,
    color: "#5CE0CA",
    clients: [
      { name: "Farmacity", country: "Argentina", fileType: "Stock", tier: "oro", status: "Procesado", date: "2026-04-08" },
      { name: "Disval", country: "Argentina", fileType: "Sales", tier: "plata", status: "Procesado", date: "2026-04-07" },
      { name: "Nadro", country: "Mexico", fileType: "Stock", tier: "plata", status: "Procesado", date: "2026-04-06" },
      { name: "Drogueria Alemana", country: "Colombia", fileType: "Stock", tier: "bronce", status: "Procesado", date: "2026-04-05" }
    ]
  },
  {
    name: "Formato inesperado",
    count: 7,
    color: "#FF28FF",
    clients: [
      { name: "Cia. Farmaceutica", country: "Argentina", fileType: "Stock", tier: "bronce", status: "Retraso", date: "2026-04-07" },
      { name: "Colsubsidio", country: "Colombia", fileType: "Sales", tier: "plata", status: "Retraso", date: "2026-04-08" },
      { name: "Walmart", country: "Mexico", fileType: "Sales", tier: "oro", status: "Retraso", date: "2026-04-06" }
    ]
  },
  {
    name: "Columnas faltantes",
    count: 5,
    color: "#AD7BFF",
    clients: [
      { name: "Musacchio", country: "Argentina", fileType: "Stock", tier: "bronce", status: "Pendiente", date: "2026-04-05" },
      { name: "Millan", country: "Argentina", fileType: "Stock", tier: "bronce", status: "Pendiente", date: "2026-04-06" },
      { name: "Fanasa", country: "Mexico", fileType: "Stock", tier: "bronce", status: "Pendiente", date: "2026-04-07" }
    ]
  },
  {
    name: "Datos duplicados",
    count: 4,
    color: "#5CE0CA",
    clients: [
      { name: "Tadicor", country: "Argentina", fileType: "Stock", tier: "bronce", status: "Procesado", date: "2026-04-08" },
      { name: "Soriana", country: "Mexico", fileType: "Sales", tier: "plata", status: "Procesado", date: "2026-04-07" }
    ]
  },
  {
    name: "Periodo incorrecto",
    count: 3,
    color: "#8D979D",
    clients: [
      { name: "Nadro", country: "Mexico", fileType: "Stock", tier: "plata", status: "Retraso", date: "2026-04-06" },
      { name: "Soriana", country: "Mexico", fileType: "Stock", tier: "plata", status: "Retraso", date: "2026-04-07" }
    ]
  }
];

export function NovedadesChart({ mockData = false }: NovedadesChartProps) {
  const { selectedFileType } = useDataQualityDashboardContext();
  const [sheetData, setSheetData] = useState<
    { title: string; clients: ClientEntry[]; color: string } | null
  >(null);

  const data = mockData
    ? allNovedades
        .map((n) => ({
          ...n,
          clients:
            !selectedFileType || selectedFileType === "all"
              ? n.clients
              : n.clients.filter((c) => c.fileType === selectedFileType)
        }))
        .map((n) => ({ ...n, count: n.clients.length }))
        .filter((n) => n.count > 0)
    : [];
  const total = data.reduce((sum, d) => sum + d.count, 0);

  const handleBarClick = (entry: NovedadType) => {
    setSheetData({ title: entry.name, clients: entry.clients, color: entry.color });
  };

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
                onClick={(entry) => handleBarClick(entry as unknown as NovedadType)}
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
                onClick={() => handleBarClick(item)}
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

      {sheetData && (
        <Dialog open={!!sheetData} onOpenChange={() => setSheetData(null)}>
          <DialogContent
            className="sm:max-w-[900px] p-0 gap-0 overflow-hidden"
            style={{ backgroundColor: "#FFFFFF" }}
          >
            <div
              className="flex items-center gap-3 px-6 pt-6 pb-5 border-b"
              style={{ borderColor: "#EEEEEE" }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: sheetData.color + "22" }}
              >
                <AlertTriangle className="w-4 h-4" style={{ color: sheetData.color }} />
              </div>
              <div className="flex-1">
                <h2 className="text-base font-semibold" style={{ color: "#141414" }}>
                  {sheetData.title}
                </h2>
                <p className="text-sm mt-0.5" style={{ color: "#888" }}>
                  {sheetData.clients.length} caso{sheetData.clients.length !== 1 ? "s" : ""}{" "}
                  detectado{sheetData.clients.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            <div className="px-6 pt-3 pb-2 overflow-auto max-h-[480px]">
              <Table>
                <TableHeader>
                  <TableRow style={{ borderColor: "#EEEEEE" }}>
                    <TableHead className="text-xs font-medium" style={{ color: "#6B7280" }}>
                      Cliente
                    </TableHead>
                    <TableHead className="text-xs font-medium" style={{ color: "#6B7280" }}>
                      País
                    </TableHead>
                    <TableHead className="text-xs font-medium" style={{ color: "#6B7280" }}>
                      Tipo de archivo
                    </TableHead>
                    <TableHead className="text-xs font-medium" style={{ color: "#6B7280" }}>
                      Estado
                    </TableHead>
                    <TableHead className="text-xs font-medium" style={{ color: "#6B7280" }}>
                      Fecha
                    </TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sheetData.clients.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-sm py-8" style={{ color: "#888" }}>
                        No hay registros.
                      </TableCell>
                    </TableRow>
                  )}
                  {sheetData.clients.map((client, i) => {
                    const statusColor =
                      client.status === "Pendiente"
                        ? { bg: "#FFF7ED", text: "#F59E0B" }
                        : client.status === "Retraso"
                          ? { bg: "#F5F3FF", text: "#AD7BFF" }
                          : { bg: "#F0FDF4", text: "#10B981" };
                    const fileTypeColor: Record<string, { bg: string; text: string }> = {
                      Sales: { bg: "#EA580C", text: "#ffffff" },
                      Stock: { bg: "#1a1a1a", text: "#ffffff" },
                      "Stock in transit": { bg: "#CA8A04", text: "#ffffff" }
                    };
                    const ftColor = fileTypeColor[client.fileType] ?? { bg: "#6B7280", text: "#ffffff" };
                    return (
                      <TableRow
                        key={i}
                        className="hover:bg-gray-50 transition-colors"
                        style={{ borderColor: "#F3F3F3" }}
                      >
                        <TableCell className="py-3">
                          <span className="text-sm font-medium" style={{ color: "#141414" }}>
                            {client.name}
                          </span>
                        </TableCell>
                        <TableCell className="py-3">
                          <span className="text-sm" style={{ color: "#6B7280" }}>
                            {client.country}
                          </span>
                        </TableCell>
                        <TableCell className="py-3">
                          <span
                            className="inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold"
                            style={{ backgroundColor: ftColor.bg, color: ftColor.text }}
                          >
                            {client.fileType}
                          </span>
                        </TableCell>
                        <TableCell className="py-3">
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                            style={{ backgroundColor: statusColor.bg, color: statusColor.text }}
                          >
                            {client.status}
                          </span>
                        </TableCell>
                        <TableCell className="py-3">
                          <span className="text-sm" style={{ color: "#6B7280" }}>
                            {client.date}
                          </span>
                        </TableCell>
                        <TableCell className="py-3 text-right">
                          <button
                            className="inline-flex items-center justify-center w-7 h-7 rounded-md transition-colors hover:bg-gray-100"
                            title={`Ver cliente ${client.name}`}
                            style={{ color: "#9CA3AF" }}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <div
              className="px-6 py-3 border-t flex items-center justify-end"
              style={{ borderColor: "#EEEEEE" }}
            >
              <Button
                variant="outline"
                size="sm"
                className="text-sm h-8 px-4"
                onClick={() => setSheetData(null)}
              >
                Cerrar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
