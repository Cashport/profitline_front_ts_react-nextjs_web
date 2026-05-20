"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  DownloadCloud,
  Eye,
  FileText,
  Flag,
  MoreHorizontal,
  Package,
  RefreshCw,
  Search,
  XCircle
} from "lucide-react";

import { Card } from "@/modules/chat/ui/card";
import { Input } from "@/modules/chat/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/modules/chat/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/modules/chat/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/modules/chat/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/modules/chat/ui/dropdown-menu";
import { useDataQualityDashboardContext } from "@/modules/dataQuality/context/DataQualityDashboardContext";

interface DashboardIngestionStatusProps {
  mockData?: boolean;
}

type ClientTier = "oro" | "plata" | "bronce";

type ClientRow = {
  name: string;
  fileType: string;
  country: string;
  countryLabel: string;
  status: "received" | "pending";
  novedades: number;
  transformation: "transformado" | "no-transformado" | "na";
  curaduria: "curado" | "no-curado" | "na";
  sent: boolean;
  observation: string;
  tier: ClientTier;
  periodicity: "diario" | "semanal" | "mensual";
};

const countryLabels: Record<string, string> = {
  argentina: "Argentina",
  colombia: "Colombia",
  mexico: "México",
  peru: "Perú",
  chile: "Chile",
  ecuador: "Ecuador"
};

const tierMap: Record<string, ClientTier> = {
  Farmacity: "oro",
  Cencosud: "oro",
  Makro: "oro",
  Libertad: "oro",
  Dinosaurio: "plata",
  Cofasur: "plata",
  "Del Sud": "plata",
  Disval: "plata",
  Monroe: "plata",
  Kellerhoff: "plata",
  Suizo: "plata",
  Tadicor: "bronce",
  Herger: "bronce",
  "El Indio": "bronce",
  Farmalife: "bronce",
  "Global Med": "bronce",
  Interfarm: "bronce",
  Mandatos: "bronce",
  Maycar: "bronce",
  "Roberto Basualdo": "bronce",
  "Suiza Tucuman": "bronce",
  "Descartables Caromar": "bronce",
  "20 De Junio": "bronce",
  Asoprofarma: "bronce",
  "Cia. Farmaceutica": "bronce",
  Jufec: "bronce",
  Maxiconsumo: "plata",
  Medamax: "bronce",
  Millan: "bronce",
  Musacchio: "bronce",
  Yaguar: "bronce",
  Amazon: "oro",
  Walmart: "oro",
  Costco: "oro",
  Chedraui: "oro",
  "Sam's Club": "plata",
  Soriana: "plata",
  Nadro: "plata",
  Oxxo: "oro",
  Fanasa: "bronce",
  "Cruz Verde": "oro",
  Farmatodo: "oro",
  Cafam: "plata",
  Colsubsidio: "plata",
  Locatel: "plata",
  "Drogas La Rebaja": "bronce",
  "Drogueria Alemana": "bronce"
};

const periodicityMap: Record<string, "diario" | "semanal" | "mensual"> = {
  Farmacity: "diario",
  Cencosud: "diario",
  Walmart: "diario",
  Amazon: "diario",
  Makro: "semanal",
  Costco: "semanal",
  "Sam's Club": "semanal",
  "Cruz Verde": "semanal",
  Chedraui: "semanal",
  Soriana: "semanal",
  Oxxo: "diario",
  Fanasa: "semanal",
  "Drogas La Rebaja": "mensual",
  "Drogueria Alemana": "mensual",
  Cafam: "mensual",
  Colsubsidio: "mensual",
  Locatel: "mensual",
  Farmatodo: "mensual",
  Disval: "semanal",
  Cofasur: "semanal",
  "Del Sud": "semanal",
  Dinosaurio: "mensual",
  Libertad: "semanal",
  Nadro: "mensual",
  Jufec: "mensual",
  Maxiconsumo: "mensual"
};

const receivedByCountry: Record<string, { name: string; fileType: string }[]> = {
  argentina: [
    { name: "Cencosud", fileType: "Sales" },
    { name: "Cofasur", fileType: "Stock" },
    { name: "Del Sud", fileType: "Stock" },
    { name: "Del Sud", fileType: "Sales" },
    { name: "Descartables Caromar", fileType: "Sales" },
    { name: "Dinosaurio", fileType: "Stock" },
    { name: "Disval", fileType: "Stock" },
    { name: "Disval", fileType: "Sales" },
    { name: "El Indio", fileType: "Stock" },
    { name: "Farmacity", fileType: "Sales" },
    { name: "Farmacity", fileType: "Stock" },
    { name: "Farmalife", fileType: "Stock" },
    { name: "Global Med", fileType: "Stock" },
    { name: "Herger", fileType: "Sales" },
    { name: "Interfarm", fileType: "Stock" },
    { name: "Kellerhoff", fileType: "Stock" },
    { name: "Libertad", fileType: "Sales" },
    { name: "Makro", fileType: "Stock" },
    { name: "Mandatos", fileType: "Sales" },
    { name: "Maycar", fileType: "Stock" },
    { name: "Monroe", fileType: "Stock" },
    { name: "Monroe", fileType: "Sales" },
    { name: "Roberto Basualdo", fileType: "Sales" },
    { name: "Suizo", fileType: "Stock" },
    { name: "Suiza Tucuman", fileType: "Stock" },
    { name: "Tadicor", fileType: "Stock" }
  ],
  mexico: [
    { name: "Amazon", fileType: "Stock" },
    { name: "Amazon", fileType: "Sales" },
    { name: "Chedraui", fileType: "Sales" },
    { name: "Costco", fileType: "Sales" },
    { name: "Nadro", fileType: "Stock" },
    { name: "Nadro", fileType: "Sales" }
  ],
  colombia: [
    { name: "Cafam", fileType: "Sales" },
    { name: "Colsubsidio", fileType: "Sales" },
    { name: "Cruz Verde", fileType: "Stock" },
    { name: "Drogas La Rebaja", fileType: "Stock" },
    { name: "Drogueria Alemana", fileType: "Stock" },
    { name: "Farmatodo", fileType: "Stock" },
    { name: "Locatel", fileType: "Sales" }
  ]
};

const pendingByCountry: Record<string, { name: string; fileType: string }[]> = {
  argentina: [
    { name: "20 De Junio", fileType: "Stock" },
    { name: "Asoprofarma", fileType: "Stock" },
    { name: "Asoprofarma", fileType: "Sales" },
    { name: "Cia. Farmaceutica", fileType: "Stock" },
    { name: "Jufec", fileType: "Sales" },
    { name: "Maxiconsumo", fileType: "Stock" },
    { name: "Medamax", fileType: "Sales" },
    { name: "Millan", fileType: "Stock" },
    { name: "Musacchio", fileType: "Stock" },
    { name: "Suizo", fileType: "Sales" },
    { name: "Yaguar", fileType: "Stock" }
  ],
  mexico: [
    { name: "Chedraui", fileType: "Stock" },
    { name: "Fanasa", fileType: "Stock" },
    { name: "Oxxo", fileType: "Stock" },
    { name: "Sam's Club", fileType: "Stock" },
    { name: "Sam's Club", fileType: "Sales" },
    { name: "Soriana", fileType: "Stock" },
    { name: "Soriana", fileType: "Sales" },
    { name: "Walmart", fileType: "Stock" },
    { name: "Walmart", fileType: "Sales" }
  ],
  colombia: [
    { name: "Cafam", fileType: "Stock" },
    { name: "Farmatodo", fileType: "Sales" },
    { name: "Locatel", fileType: "Stock" }
  ]
};

const statusMap: Record<
  string,
  {
    transformation: ClientRow["transformation"];
    curaduria: ClientRow["curaduria"];
    sent: boolean;
    observation: string;
  }
> = {
  "Tadicor|Stock": { transformation: "transformado", curaduria: "curado", sent: true, observation: "" },
  "Cofasur|Stock": { transformation: "transformado", curaduria: "curado", sent: true, observation: "*Cambia nombre de columna" },
  "Del Sud|Stock": { transformation: "transformado", curaduria: "curado", sent: true, observation: "" },
  "Del Sud|Sales": { transformation: "transformado", curaduria: "curado", sent: true, observation: "" },
  "Disval|Stock": { transformation: "transformado", curaduria: "curado", sent: true, observation: "" },
  "Disval|Sales": { transformation: "transformado", curaduria: "no-curado", sent: false, observation: "Pendiente revision de SKUs nuevos" },
  "Kellerhoff|Stock": { transformation: "transformado", curaduria: "curado", sent: true, observation: "" },
  "Monroe|Stock": { transformation: "transformado", curaduria: "curado", sent: true, observation: "" },
  "Monroe|Sales": { transformation: "transformado", curaduria: "curado", sent: true, observation: "" },
  "Suiza Tucuman|Stock": { transformation: "transformado", curaduria: "curado", sent: true, observation: "" },
  "Farmacity|Sales": { transformation: "transformado", curaduria: "curado", sent: true, observation: "" },
  "Farmacity|Stock": { transformation: "transformado", curaduria: "no-curado", sent: false, observation: "3 SKUs sin mapear" },
  "Cencosud|Sales": { transformation: "transformado", curaduria: "curado", sent: true, observation: "" },
  "Descartables Caromar|Sales": { transformation: "transformado", curaduria: "curado", sent: true, observation: "" },
  "Dinosaurio|Stock": { transformation: "transformado", curaduria: "curado", sent: true, observation: "" },
  "El Indio|Stock": { transformation: "transformado", curaduria: "no-curado", sent: false, observation: "Productos nuevos sin equivalencia" },
  "Farmalife|Stock": { transformation: "transformado", curaduria: "curado", sent: true, observation: "" },
  "Global Med|Stock": { transformation: "transformado", curaduria: "curado", sent: true, observation: "" },
  "Herger|Sales": { transformation: "transformado", curaduria: "curado", sent: true, observation: "" },
  "Interfarm|Stock": { transformation: "transformado", curaduria: "curado", sent: true, observation: "" },
  "Libertad|Sales": { transformation: "transformado", curaduria: "curado", sent: true, observation: "" },
  "Makro|Stock": { transformation: "transformado", curaduria: "no-curado", sent: false, observation: "Factor de conversion pendiente" },
  "Mandatos|Sales": { transformation: "transformado", curaduria: "curado", sent: true, observation: "" },
  "Maycar|Stock": { transformation: "transformado", curaduria: "curado", sent: true, observation: "" },
  "Roberto Basualdo|Sales": { transformation: "transformado", curaduria: "curado", sent: true, observation: "" },
  "Suizo|Stock": { transformation: "transformado", curaduria: "curado", sent: true, observation: "" },
  "Cruz Verde|Stock": { transformation: "transformado", curaduria: "curado", sent: true, observation: "" },
  "Colsubsidio|Sales": { transformation: "no-transformado", curaduria: "na", sent: false, observation: "Formato de archivo no coincide con la plantilla esperada" },
  "Costco|Sales": { transformation: "transformado", curaduria: "curado", sent: true, observation: "" },
  "Amazon|Sales": { transformation: "transformado", curaduria: "curado", sent: true, observation: "" },
  "Amazon|Stock": { transformation: "transformado", curaduria: "curado", sent: true, observation: "" },
  "Cia. Farmaceutica|Stock": { transformation: "no-transformado", curaduria: "na", sent: false, observation: "*Se reporto cambio en el archivo base desde diciembre 2024" },
  "Walmart|Sales": { transformation: "no-transformado", curaduria: "na", sent: false, observation: "Pendiente validacion de formato nuevo" },
  "Farmatodo|Stock": { transformation: "transformado", curaduria: "curado", sent: true, observation: "" },
  "Nadro|Sales": { transformation: "transformado", curaduria: "curado", sent: true, observation: "" },
  "Nadro|Stock": { transformation: "transformado", curaduria: "no-curado", sent: false, observation: "2 codigos reciclados sin periodo" },
  "Chedraui|Sales": { transformation: "transformado", curaduria: "curado", sent: true, observation: "" },
  "Locatel|Sales": { transformation: "transformado", curaduria: "curado", sent: true, observation: "" },
  "Drogas La Rebaja|Stock": { transformation: "transformado", curaduria: "curado", sent: true, observation: "" },
  "Drogueria Alemana|Stock": { transformation: "transformado", curaduria: "no-curado", sent: false, observation: "5 materiales nuevos sin equivalencia" },
  "Cafam|Sales": { transformation: "transformado", curaduria: "curado", sent: true, observation: "" }
};

const novedadesMap: Record<string, number> = {
  "20 De Junio|Stock": 1,
  "Asoprofarma|Sales": 2,
  "Asoprofarma|Stock": 2,
  "Cia. Farmaceutica|Stock": 3,
  "Jufec|Sales": 5,
  "Maxiconsumo|Stock": 7,
  "Medamax|Sales": 1,
  "Millan|Stock": 1,
  "Musacchio|Stock": 2,
  "Suizo|Sales": 1,
  "Yaguar|Stock": 1,
  "Chedraui|Stock": 8,
  "Fanasa|Stock": 2,
  "Oxxo|Stock": 3,
  "Sam's Club|Stock": 2,
  "Sam's Club|Sales": 1,
  "Soriana|Stock": 3,
  "Soriana|Sales": 1,
  "Walmart|Stock": 6,
  "Walmart|Sales": 4,
  "Cafam|Stock": 1,
  "Farmatodo|Sales": 6,
  "Locatel|Stock": 4,
  "Colsubsidio|Sales": 11,
  "Disval|Sales": 9,
  "El Indio|Stock": 4,
  "Farmacity|Stock": 12,
  "Makro|Stock": 5,
  "Nadro|Stock": 2,
  "Drogueria Alemana|Stock": 5
};

function buildAllRows(): ClientRow[] {
  const rows: ClientRow[] = [];
  for (const [countryKey, clients] of Object.entries(receivedByCountry)) {
    for (const c of clients) {
      const key = `${c.name}|${c.fileType}`;
      const s = statusMap[key];
      rows.push({
        name: c.name,
        fileType: c.fileType,
        country: countryKey,
        countryLabel: countryLabels[countryKey] || countryKey,
        status: "received",
        novedades: novedadesMap[key] || 0,
        transformation: s?.transformation || "na",
        curaduria: s?.curaduria || "na",
        sent: s?.sent ?? false,
        observation: s?.observation || "",
        tier: tierMap[c.name] || "bronce",
        periodicity: periodicityMap[c.name] || "mensual"
      });
    }
  }
  for (const [countryKey, clients] of Object.entries(pendingByCountry)) {
    for (const c of clients) {
      const key = `${c.name}|${c.fileType}`;
      const s = statusMap[key];
      rows.push({
        name: c.name,
        fileType: c.fileType,
        country: countryKey,
        countryLabel: countryLabels[countryKey] || countryKey,
        status: "pending",
        novedades: novedadesMap[key] || 0,
        transformation: s?.transformation || "na",
        curaduria: s?.curaduria || "na",
        sent: s?.sent ?? false,
        observation: s?.observation || "",
        tier: tierMap[c.name] || "bronce",
        periodicity: periodicityMap[c.name] || "mensual"
      });
    }
  }
  rows.sort((a, b) => {
    const countryCompare = a.countryLabel.localeCompare(b.countryLabel, "es", { sensitivity: "base" });
    if (countryCompare !== 0) return countryCompare;
    const nameCompare = a.name.localeCompare(b.name, "es", { sensitivity: "base" });
    if (nameCompare !== 0) return nameCompare;
    return a.fileType.localeCompare(b.fileType);
  });
  return rows;
}

const mockRows = buildAllRows();

const tierConfig: Record<ClientTier, { label: string; bg: string; text: string; dot: string }> = {
  oro: { label: "Oro", bg: "#FEF3C7", text: "#92400E", dot: "#F59E0B" },
  plata: { label: "Plata", bg: "#F1F5F9", text: "#475569", dot: "#94A3B8" },
  bronce: { label: "Bronce", bg: "#FDF2EE", text: "#9A3412", dot: "#EA580C" }
};

function TierBadge({ tier }: { tier: ClientTier }) {
  const c = tierConfig[tier];
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full"
      style={{ backgroundColor: c.bg, color: c.text }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.dot }} />
      {c.label}
    </span>
  );
}

function DeliveryTimelineTable({ row }: { row: ClientRow }) {
  const today = new Date(2026, 2, 11);
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayDay = today.getDate();

  const entries: { date: Date; label: string }[] = [];

  if (row.periodicity === "diario") {
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const dow = date.getDay();
      if (dow !== 0 && dow !== 6)
        entries.push({
          date,
          label: date.toLocaleDateString("es-AR", { day: "2-digit", month: "short", weekday: "short" })
        });
    }
  } else if (row.periodicity === "semanal") {
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      if (date.getDay() === 1)
        entries.push({
          date,
          label: `Semana del ${date.toLocaleDateString("es-AR", { day: "2-digit", month: "short" })}`
        });
    }
  } else {
    entries.push({
      date: new Date(year, month, 1),
      label: `${today.toLocaleDateString("es-AR", { month: "long", year: "numeric" })}`
    });
  }

  type DeliveryStatus = "ok" | "retraso" | "pendiente";

  const getStatus = (date: Date): DeliveryStatus => {
    const d = date.getDate();
    if (date > today) return "pendiente";
    if (date.toDateString() === today.toDateString()) {
      return row.status === "received" ? "ok" : "retraso";
    }
    if (row.status === "received") return "ok";
    return d <= todayDay - 1 ? "retraso" : "pendiente";
  };

  const statusConfig: Record<DeliveryStatus, { label: string; bg: string; text: string; dot: string }> = {
    ok: { label: "OK", bg: "rgba(48,234,3,0.1)", text: "#1a6600", dot: "#30EA03" },
    retraso: { label: "Retraso", bg: "rgba(255,40,255,0.1)", text: "#a0008a", dot: "#FF28FF" },
    pendiente: { label: "Pendiente", bg: "rgba(141,151,157,0.1)", text: "#8D979D", dot: "#D0D3D4" }
  };

  return (
    <div>
      <p className="text-xs font-semibold mb-2" style={{ color: "#000000" }}>
        Historial de entregas — {row.fileType} (
        {row.periodicity.charAt(0).toUpperCase() + row.periodicity.slice(1)})
      </p>
      <div className="rounded-lg border overflow-hidden" style={{ borderColor: "#D0D3D4" }}>
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50" style={{ borderColor: "#D0D3D4" }}>
              <TableHead className="text-[11px] font-semibold pl-3" style={{ color: "#000000" }}>
                Fecha
              </TableHead>
              <TableHead className="text-[11px] font-semibold" style={{ color: "#000000" }}>
                Estado
              </TableHead>
              <TableHead className="w-8 pr-2" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry, i) => {
              const status = getStatus(entry.date);
              const cfg = statusConfig[status];
              const isToday = entry.date.toDateString() === today.toDateString();
              return (
                <TableRow
                  key={i}
                  style={{
                    borderColor: "#F3F3F3",
                    backgroundColor: isToday ? "rgba(48,234,3,0.03)" : undefined
                  }}
                >
                  <TableCell className="pl-3 py-2">
                    <span
                      className="text-[11px]"
                      style={{
                        color: status === "pendiente" ? "#8D979D" : "#000000",
                        fontWeight: isToday ? 600 : 400
                      }}
                    >
                      {entry.label}
                      {isToday && (
                        <span className="ml-1.5 text-[10px] font-semibold" style={{ color: "#30EA03" }}>
                          hoy
                        </span>
                      )}
                    </span>
                  </TableCell>
                  <TableCell className="py-2">
                    <span
                      className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: cfg.bg, color: cfg.text }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: cfg.dot }} />
                      {cfg.label}
                    </span>
                  </TableCell>
                  <TableCell className="pr-2 py-2 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className="w-6 h-6 rounded flex items-center justify-center hover:bg-gray-100 transition-colors"
                          style={{ color: "#8D979D" }}
                        >
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="text-xs">
                        <DropdownMenuItem className="text-xs gap-2">
                          <DownloadCloud className="h-3.5 w-3.5" /> Descargar archivo
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-xs gap-2">
                          <RefreshCw className="h-3.5 w-3.5" /> Reprocesar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-xs gap-2 text-red-600">
                          <Flag className="h-3.5 w-3.5" /> Reportar problema
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function ClientDetailPanel({
  row,
  open,
  onClose,
  allClientRows
}: {
  row: ClientRow;
  open: boolean;
  onClose: () => void;
  allClientRows: ClientRow[];
}) {
  const clientRows = allClientRows.filter((r) => r.name === row.name && r.country === row.country);
  const totalNovedades = clientRows.reduce((sum, r) => sum + r.novedades, 0);

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <SheetContent className="w-[420px] sm:max-w-[420px] overflow-y-auto p-0">
        <SheetHeader className="px-5 py-4 border-b" style={{ borderColor: "#D0D3D4" }}>
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "#30EA03" }}
            >
              <Package className="h-4 w-4" style={{ color: "#000000" }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <SheetTitle className="text-base font-semibold" style={{ color: "#000000" }}>
                  {row.name}
                </SheetTitle>
                <TierBadge tier={row.tier} />
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{row.countryLabel}</p>
            </div>
          </div>
        </SheetHeader>

        <div className="px-5 py-4 flex flex-col gap-5">
          <div>
            <p className="text-xs font-semibold mb-2" style={{ color: "#000000" }}>
              Detalle por tipo
            </p>
            <div className="rounded-lg border overflow-hidden" style={{ borderColor: "#D0D3D4" }}>
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50" style={{ borderColor: "#D0D3D4" }}>
                    <TableHead className="text-[11px] font-semibold pl-3" style={{ color: "#333F48" }}>
                      Tipo
                    </TableHead>
                    <TableHead className="text-[11px] font-semibold text-center" style={{ color: "#333F48" }}>
                      %
                    </TableHead>
                    <TableHead className="text-[11px] font-semibold text-center" style={{ color: "#333F48" }}>
                      Esperados
                    </TableHead>
                    <TableHead className="text-[11px] font-semibold text-center" style={{ color: "#333F48" }}>
                      Transformados
                    </TableHead>
                    <TableHead className="text-[11px] font-semibold text-center" style={{ color: "#333F48" }}>
                      Novedades
                    </TableHead>
                    <TableHead className="text-[11px] font-semibold text-center pr-3" style={{ color: "#333F48" }}>
                      Pendientes
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientRows.map((r, i) => (
                    <TableRow key={i} style={{ borderColor: "#F3F3F3" }}>
                      <TableCell className="text-xs pl-3 py-2" style={{ color: "#000000" }}>
                        {r.fileType}
                      </TableCell>
                      <TableCell className="text-center py-2">
                        <span className="text-xs font-bold" style={{ color: "#000000" }}>
                          {r.sent ? "100" : "0"}%
                        </span>
                      </TableCell>
                      <TableCell className="text-center py-2">
                        <span className="text-xs font-semibold" style={{ color: "#8D979D" }}>
                          1
                        </span>
                      </TableCell>
                      <TableCell className="text-center py-2">
                        <span className="text-xs font-semibold" style={{ color: "#30EA03" }}>
                          {r.sent ? "1" : "0"}
                        </span>
                      </TableCell>
                      <TableCell className="text-center py-2">
                        <span className="text-xs font-semibold" style={{ color: "#FF28FF" }}>
                          {r.novedades}
                        </span>
                      </TableCell>
                      <TableCell className="text-center pr-3 py-2">
                        <span className="text-xs font-semibold" style={{ color: "#FFA500" }}>
                          {r.status === "pending" ? "1" : "0"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {totalNovedades > 0 && (
            <div className="rounded-lg p-3" style={{ backgroundColor: "#FEF2F2" }}>
              <p className="text-xs font-semibold text-red-700 mb-1.5">
                {totalNovedades} novedades detectadas
              </p>
              <ul className="space-y-1">
                {clientRows
                  .filter((r) => r.observation)
                  .map((r, i) => (
                    <li key={i} className="text-[11px] text-red-600 flex items-start gap-1.5">
                      <XCircle className="h-3 w-3 mt-0.5 shrink-0" />
                      <span>
                        <span className="font-medium">{r.fileType}:</span> {r.observation}
                      </span>
                    </li>
                  ))}
                {clientRows
                  .filter((r) => r.novedades > 0 && !r.observation && r.status === "pending")
                  .map((r, i) => (
                    <li key={`p-${i}`} className="text-[11px] text-red-600 flex items-start gap-1.5">
                      <XCircle className="h-3 w-3 mt-0.5 shrink-0" />
                      <span>
                        <span className="font-medium">{r.fileType}:</span> Archivo pendiente de recepcion
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          )}

          {totalNovedades === 0 && (
            <div className="rounded-lg p-3" style={{ backgroundColor: "rgba(48,234,3,0.08)" }}>
              <p className="text-xs font-medium" style={{ color: "#1a6600" }}>
                Sin novedades. Todos los procesos completados.
              </p>
            </div>
          )}

          {clientRows.map((r, i) => (
            <DeliveryTimelineTable key={i} row={r} />
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function NovedadDetailPanel({
  row,
  open,
  onClose,
  allClientRows
}: {
  row: ClientRow;
  open: boolean;
  onClose: () => void;
  allClientRows: ClientRow[];
}) {
  const clientRows = allClientRows.filter(
    (r) => r.name === row.name && r.country === row.country && r.novedades > 0
  );
  const totalNovedades = clientRows.reduce((sum, r) => sum + r.novedades, 0);

  const novedadItems = clientRows.map((r) => {
    let tipo = "";
    let descripcion = "";
    let etapa = "";
    if (r.status === "pending") {
      tipo = "Archivo pendiente";
      descripcion = `El archivo ${r.fileType} no ha sido recibido para este periodo.`;
      etapa = "Ingesta";
    } else if (r.transformation === "no-transformado") {
      tipo = "Error de transformacion";
      descripcion = r.observation || `El archivo ${r.fileType} no pudo ser transformado.`;
      etapa = "Transformacion";
    } else if (r.curaduria === "no-curado") {
      tipo = "Error de curaduria";
      descripcion = r.observation || `El archivo ${r.fileType} presenta inconsistencias en curaduria.`;
      etapa = "Curaduria";
    } else if (r.observation) {
      tipo = "Observacion";
      descripcion = r.observation;
      etapa = "Pipeline";
    } else {
      tipo = "Novedad general";
      descripcion = `Se detectaron ${r.novedades} novedad(es) en el archivo ${r.fileType}.`;
      etapa = "Pipeline";
    }
    return { fileType: r.fileType, tipo, descripcion, etapa, count: r.novedades };
  });

  const etapaColor: Record<string, { bg: string; text: string }> = {
    Ingesta: { bg: "rgba(255,40,255,0.08)", text: "#FF28FF" },
    Transformacion: { bg: "rgba(173,123,255,0.1)", text: "#AD7BFF" },
    Curaduria: { bg: "rgba(92,224,202,0.1)", text: "#2A9D8F" },
    Pipeline: { bg: "rgba(48,234,3,0.08)", text: "#1a7a00" }
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-[420px] sm:max-w-[420px] p-0 gap-0 overflow-y-auto"
        style={{ borderColor: "#D0D3D4" }}
      >
        <SheetHeader className="px-5 pt-5 pb-4 border-b" style={{ borderColor: "#D0D3D4" }}>
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "rgba(255,40,255,0.1)" }}
            >
              <AlertTriangle className="h-4 w-4" style={{ color: "#FF28FF" }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <SheetTitle className="text-base font-semibold" style={{ color: "#000000" }}>
                  {row.name}
                </SheetTitle>
                <TierBadge tier={row.tier} />
              </div>
              <p className="text-xs mt-0.5" style={{ color: "#8D979D" }}>
                {row.countryLabel} · {totalNovedades} novedad{totalNovedades !== 1 ? "es" : ""}{" "}
                detectada{totalNovedades !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </SheetHeader>

        <div className="px-5 py-4 flex flex-col gap-3">
          {novedadItems.map((item, i) => {
            const colors = etapaColor[item.etapa] || etapaColor.Pipeline;
            return (
              <div
                key={i}
                className="rounded-lg border p-4 flex flex-col gap-2"
                style={{ borderColor: "#D0D3D4" }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold" style={{ color: "#000000" }}>
                      {item.fileType}
                    </span>
                    <span
                      className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: colors.bg, color: colors.text }}
                    >
                      {item.etapa}
                    </span>
                  </div>
                  <span className="inline-flex items-center justify-center min-w-[22px] h-5 px-1.5 rounded-full text-[11px] font-bold text-red-700 bg-red-100">
                    {item.count}
                  </span>
                </div>
                <p className="text-xs font-medium" style={{ color: "#333F48" }}>
                  {item.tipo}
                </p>
                <p className="text-[11px] leading-relaxed" style={{ color: "#8D979D" }}>
                  {item.descripcion}
                </p>
              </div>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function DashboardIngestionStatus({ mockData = false }: DashboardIngestionStatusProps) {
  const { selectedFileType } = useDataQualityDashboardContext();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "received" | "pending">("all");
  const [selectedRow, setSelectedRow] = useState<ClientRow | null>(null);
  const [novedadRow, setNovedadRow] = useState<ClientRow | null>(null);
  const [expandedCountries, setExpandedCountries] = useState<Set<string>>(new Set());
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());

  const allRows = mockData ? mockRows : [];

  const filtered = useMemo(() => {
    return allRows.filter((row) => {
      if (selectedFileType && selectedFileType !== "all" && row.fileType !== selectedFileType)
        return false;
      if (statusFilter !== "all" && row.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          row.name.toLowerCase().includes(q) ||
          row.fileType.toLowerCase().includes(q) ||
          row.countryLabel.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allRows, selectedFileType, statusFilter, search]);

  const grouped = useMemo(() => {
    const byCountry: Record<string, { countryLabel: string; clients: Record<string, ClientRow[]> }> = {};
    for (const row of filtered) {
      if (!byCountry[row.country])
        byCountry[row.country] = { countryLabel: row.countryLabel, clients: {} };
      if (!byCountry[row.country].clients[row.name])
        byCountry[row.country].clients[row.name] = [];
      byCountry[row.country].clients[row.name].push(row);
    }
    return byCountry;
  }, [filtered]);

  const toggleCountry = (c: string) => {
    setExpandedCountries((prev) => {
      const s = new Set(prev);
      if (s.has(c)) s.delete(c);
      else s.add(c);
      return s;
    });
  };
  const toggleClient = (key: string) => {
    setExpandedClients((prev) => {
      const s = new Set(prev);
      if (s.has(key)) s.delete(key);
      else s.add(key);
      return s;
    });
  };

  const totalClients = Object.values(grouped).reduce(
    (sum, g) => sum + Object.keys(g.clients).length,
    0
  );

  return (
    <Card className="overflow-hidden" style={{ borderColor: "#D0D3D4" }}>
      <div
        className="bg-white px-5 py-3 flex items-center justify-between border-b"
        style={{ borderColor: "#D0D3D4" }}
      >
        <h3 className="text-sm font-semibold" style={{ color: "#000000" }}>
          Estado de Archivos por Cliente
        </h3>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <Input
              placeholder="Buscar cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 w-48 text-xs"
              style={{ borderColor: "#D0D3D4" }}
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as "all" | "received" | "pending")}
          >
            <SelectTrigger
              className="w-[140px] h-8 text-xs"
              style={{ borderColor: "#D0D3D4", color: "#000000" }}
            >
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="received">Recibidos</SelectItem>
              <SelectItem value="pending">Pendientes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="max-h-[520px] overflow-y-auto relative">
        <Table>
          <TableHeader className="sticky top-0 z-10">
            <TableRow className="bg-white border-b" style={{ borderColor: "#E5E7EB" }}>
              <TableHead
                className="text-xs font-medium bg-white pl-6 w-[280px]"
                style={{ color: "#6B7280" }}
              >
                Pais / Cliente / Archivo
              </TableHead>
              <TableHead className="text-xs font-medium bg-white w-32" style={{ color: "#6B7280" }}>
                Estado
              </TableHead>
              <TableHead className="text-xs font-medium bg-white w-28" style={{ color: "#6B7280" }}>
                Categoria
              </TableHead>
              <TableHead
                className="text-xs font-medium text-center bg-white w-20"
                style={{ color: "#6B7280" }}
              >
                %
              </TableHead>
              <TableHead
                className="text-xs font-medium text-center bg-white w-24"
                style={{ color: "#6B7280" }}
              >
                Esperados
              </TableHead>
              <TableHead
                className="text-xs font-medium text-center bg-white w-28"
                style={{ color: "#6B7280" }}
              >
                Transformados
              </TableHead>
              <TableHead
                className="text-xs font-medium text-center bg-white w-24"
                style={{ color: "#6B7280" }}
              >
                Novedades
              </TableHead>
              <TableHead
                className="text-xs font-medium text-center bg-white w-24"
                style={{ color: "#6B7280" }}
              >
                Pendientes
              </TableHead>
              <TableHead
                className="text-xs font-medium bg-white w-24 pr-6"
                style={{ color: "#6B7280" }}
              >
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-sm text-gray-500 py-8">
                  No se encontraron resultados.
                </TableCell>
              </TableRow>
            )}
            {Object.entries(grouped).map(([countryKey, { countryLabel, clients }]) => {
              const isCountryOpen = expandedCountries.has(countryKey);
              const countryFiles = Object.values(clients).flat();
              const countryNovedades = countryFiles.reduce((s, r) => s + r.novedades, 0);

              return [
                <TableRow
                  key={`country-${countryKey}`}
                  className="cursor-pointer select-none hover:bg-gray-50 transition-colors"
                  style={{ borderColor: "#F3F4F6" }}
                  onClick={() => toggleCountry(countryKey)}
                >
                  <TableCell className="pl-6 py-3" colSpan={1}>
                    <div className="flex items-center gap-2.5">
                      <span style={{ color: "#9CA3AF" }}>
                        {isCountryOpen ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </span>
                      <span
                        className="text-xs font-semibold uppercase tracking-wide"
                        style={{ color: "#111827" }}
                      >
                        {countryLabel}
                      </span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-md"
                        style={{ backgroundColor: "#F3F4F6", color: "#6B7280" }}
                      >
                        {Object.keys(clients).length} clientes · {countryFiles.length} archivos
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-2.5" />
                  <TableCell className="py-2.5" />
                  <TableCell className="text-center py-2.5">
                    <span className="text-xs font-bold" style={{ color: "#000000" }}>
                      {countryFiles.length > 0
                        ? Math.round(
                            (countryFiles.filter((r) => r.sent).length / countryFiles.length) * 100
                          )
                        : 0}
                      %
                    </span>
                  </TableCell>
                  <TableCell className="text-center py-2.5">
                    <span className="text-xs font-semibold" style={{ color: "#8D979D" }}>
                      {countryFiles.length}
                    </span>
                  </TableCell>
                  <TableCell className="text-center py-2.5">
                    <span className="text-xs font-semibold" style={{ color: "#30EA03" }}>
                      {countryFiles.filter((r) => r.sent).length}
                    </span>
                  </TableCell>
                  <TableCell className="text-center py-2.5">
                    <span className="text-xs font-semibold" style={{ color: "#FF28FF" }}>
                      {countryNovedades}
                    </span>
                  </TableCell>
                  <TableCell className="text-center py-2.5">
                    <span className="text-xs font-semibold" style={{ color: "#FFA500" }}>
                      {countryFiles.filter((r) => r.status === "pending").length}
                    </span>
                  </TableCell>
                  <TableCell className="pr-6" />
                </TableRow>,

                ...(!isCountryOpen
                  ? []
                  : Object.entries(clients).flatMap(([clientName, fileRows]) => {
                      const clientKey = `${countryKey}-${clientName}`;
                      const isClientOpen = expandedClients.has(clientKey);
                      const clientNovedades = fileRows.reduce((s, r) => s + r.novedades, 0);
                      const clientAllSent = fileRows.every((r) => r.sent);
                      const firstRow = fileRows[0];

                      const clientStatus: "Procesado" | "Novedad" | "Retraso" | "Pendiente" = (() => {
                        if (fileRows.every((r) => r.status === "pending")) return "Pendiente";
                        if (clientNovedades > 0) return "Novedad";
                        if (fileRows.some((r) => r.status === "pending" && r.periodicity === "diario"))
                          return "Retraso";
                        if (clientAllSent) return "Procesado";
                        return "Retraso";
                      })();

                      const statusBadge: Record<string, { bg: string; text: string; dot: string }> = {
                        Procesado: { bg: "rgba(48,234,3,0.1)", text: "#1a6600", dot: "#30EA03" },
                        Novedad: { bg: "rgba(92,224,202,0.15)", text: "#1a6b5e", dot: "#5CE0CA" },
                        Retraso: { bg: "rgba(173,123,255,0.1)", text: "#5a2db5", dot: "#AD7BFF" },
                        Pendiente: { bg: "rgba(208,211,212,0.3)", text: "#8D979D", dot: "#D0D3D4" }
                      };

                      return [
                        <TableRow
                          key={`client-${clientKey}`}
                          className="cursor-pointer hover:bg-gray-50 select-none"
                          style={{ borderColor: "#D0D3D4" }}
                          onClick={() => toggleClient(clientKey)}
                        >
                          <TableCell className="pl-8 py-2.5">
                            <div className="flex items-center gap-2">
                              <span style={{ color: "#8D979D" }}>
                                {isClientOpen ? (
                                  <ChevronDown className="h-3.5 w-3.5" />
                                ) : (
                                  <ChevronRight className="h-3.5 w-3.5" />
                                )}
                              </span>
                              <span className="text-sm font-medium" style={{ color: "#000000" }}>
                                {clientName}
                              </span>
                              <span className="text-[11px]" style={{ color: "#8D979D" }}>
                                · {fileRows.length} archivo{fileRows.length !== 1 ? "s" : ""}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="py-2.5">
                            <span
                              className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full"
                              style={{
                                backgroundColor: statusBadge[clientStatus].bg,
                                color: statusBadge[clientStatus].text
                              }}
                            >
                              <span
                                className="w-1.5 h-1.5 rounded-full shrink-0"
                                style={{ backgroundColor: statusBadge[clientStatus].dot }}
                              />
                              {clientStatus}
                            </span>
                          </TableCell>
                          <TableCell className="py-2.5">
                            <TierBadge tier={firstRow.tier} />
                          </TableCell>
                          <TableCell className="text-center py-2.5">
                            <span className="text-xs font-bold" style={{ color: "#000000" }}>
                              {fileRows.length > 0
                                ? Math.round(
                                    (fileRows.filter((r) => r.sent).length / fileRows.length) * 100
                                  )
                                : 0}
                              %
                            </span>
                          </TableCell>
                          <TableCell className="text-center py-2.5">
                            <span className="text-xs font-semibold" style={{ color: "#8D979D" }}>
                              {fileRows.length}
                            </span>
                          </TableCell>
                          <TableCell className="text-center py-2.5">
                            <span className="text-xs font-semibold" style={{ color: "#30EA03" }}>
                              {fileRows.filter((r) => r.sent).length}
                            </span>
                          </TableCell>
                          <TableCell className="text-center py-2.5">
                            <span className="text-xs font-semibold" style={{ color: "#FF28FF" }}>
                              {clientNovedades}
                            </span>
                          </TableCell>
                          <TableCell className="text-center py-2.5">
                            <span className="text-xs font-semibold" style={{ color: "#FFA500" }}>
                              {fileRows.filter((r) => r.status === "pending").length}
                            </span>
                          </TableCell>
                          <TableCell className="text-center py-2.5 pr-6">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedRow(firstRow);
                              }}
                              className="inline-flex items-center justify-center w-7 h-7 rounded-md transition-colors text-gray-400 hover:text-[#000000] hover:bg-gray-100"
                              title={`Ver detalle de ${clientName}`}
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </TableCell>
                        </TableRow>,

                        ...(!isClientOpen
                          ? []
                          : fileRows.map((row, fi) => (
                              <TableRow
                                key={`file-${clientKey}-${fi}`}
                                className="hover:bg-gray-50"
                                style={{
                                  borderColor: "#F3F3F3",
                                  backgroundColor: "rgba(248,249,250,0.4)"
                                }}
                              >
                                <TableCell className="pl-16 py-2">
                                  <div className="flex items-center gap-2">
                                    <FileText className="h-3.5 w-3.5 shrink-0" style={{ color: "#8D979D" }} />
                                    <span className="text-xs font-medium" style={{ color: "#333F48" }}>
                                      {row.fileType}
                                    </span>
                                    <span
                                      className="text-[10px] px-1.5 py-0.5 rounded-full capitalize"
                                      style={{ backgroundColor: "rgba(48,234,3,0.08)", color: "#1a6600" }}
                                    >
                                      {row.periodicity}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="py-2" />
                                <TableCell className="py-2" />
                                <TableCell className="text-center py-2">
                                  <span className="text-xs font-bold" style={{ color: "#000000" }}>
                                    {row.sent ? "100" : "0"}%
                                  </span>
                                </TableCell>
                                <TableCell className="text-center py-2">
                                  <span className="text-xs font-semibold" style={{ color: "#8D979D" }}>
                                    1
                                  </span>
                                </TableCell>
                                <TableCell className="text-center py-2">
                                  <span className="text-xs font-semibold" style={{ color: "#30EA03" }}>
                                    {row.sent ? "1" : "0"}
                                  </span>
                                </TableCell>
                                <TableCell className="text-center py-2">
                                  <span className="text-xs font-semibold" style={{ color: "#FF28FF" }}>
                                    {row.novedades}
                                  </span>
                                </TableCell>
                                <TableCell className="text-center py-2">
                                  <span className="text-xs font-semibold" style={{ color: "#FFA500" }}>
                                    {row.status === "pending" ? "1" : "0"}
                                  </span>
                                </TableCell>
                                <TableCell className="text-center py-2 pr-6">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <button className="inline-flex items-center justify-center w-7 h-7 rounded-md transition-colors text-gray-400 hover:text-[#000000] hover:bg-gray-100">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="text-xs">
                                      <DropdownMenuItem
                                        className="text-xs gap-2"
                                        onClick={() => setSelectedRow(row)}
                                      >
                                        <Eye className="h-3.5 w-3.5" /> Ver detalle
                                      </DropdownMenuItem>
                                      <DropdownMenuItem className="text-xs gap-2">
                                        <DownloadCloud className="h-3.5 w-3.5" /> Descargar archivo
                                      </DropdownMenuItem>
                                      <DropdownMenuItem className="text-xs gap-2">
                                        <RefreshCw className="h-3.5 w-3.5" /> Reprocesar
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        className="text-xs gap-2 text-red-600"
                                        onClick={() => setNovedadRow(row)}
                                      >
                                        <Flag className="h-3.5 w-3.5" /> Reportar problema
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            )))
                      ];
                    }))
              ];
            })}
          </TableBody>
        </Table>
      </div>
      <div
        className="px-5 py-3 border-t text-xs text-gray-500 flex items-center gap-4"
        style={{ borderColor: "#D0D3D4" }}
      >
        <span>{Object.keys(grouped).length} paises</span>
        <span style={{ color: "#D0D3D4" }}>·</span>
        <span>{totalClients} clientes</span>
        <span style={{ color: "#D0D3D4" }}>·</span>
        <span>{filtered.length} archivos</span>
      </div>

      {selectedRow && (
        <ClientDetailPanel
          row={selectedRow}
          open={!!selectedRow}
          onClose={() => setSelectedRow(null)}
          allClientRows={allRows}
        />
      )}

      {novedadRow && (
        <NovedadDetailPanel
          row={novedadRow}
          open={!!novedadRow}
          onClose={() => setNovedadRow(null)}
          allClientRows={allRows}
        />
      )}
    </Card>
  );
}
