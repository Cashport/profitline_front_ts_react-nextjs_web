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
import {
  IDashboardSummaryClientStatus,
  IDashboardSummaryClientStatusClient,
  IDashboardSummaryClientStatusFile
} from "@/types/dataQuality/IDataQuality";

interface DashboardIngestionStatusProps {
  clientStatus?: IDashboardSummaryClientStatus[];
}

type ClientBadgeStatus = "Procesado" | "Novedad" | "Retraso" | "Pendiente";

const clientStatusBadge: Record<ClientBadgeStatus, { bg: string; text: string; dot: string }> = {
  Procesado: { bg: "rgba(48,234,3,0.1)", text: "#1a6600", dot: "#30EA03" },
  Novedad: { bg: "rgba(92,224,202,0.15)", text: "#1a6b5e", dot: "#5CE0CA" },
  Retraso: { bg: "rgba(173,123,255,0.1)", text: "#5a2db5", dot: "#AD7BFF" },
  Pendiente: { bg: "rgba(208,211,212,0.3)", text: "#8D979D", dot: "#D0D3D4" }
};

function deriveClientStatus(client: IDashboardSummaryClientStatusClient): ClientBadgeStatus {
  if (client.files_count > 0 && client.pendientes === client.files_count) return "Pendiente";
  if (client.novedades > 0) return "Novedad";
  if (client.pendientes > 0) return "Retraso";
  return "Procesado";
}

function DeliveryTimelineTable({ file }: { file: IDashboardSummaryClientStatusFile }) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayDay = today.getDate();
  const periodicity = (file.periodicity || "mensual").toLowerCase();
  const wasSent = file.sent != null && file.sent !== "";

  const entries: { date: Date; label: string }[] = [];

  if (periodicity === "diario") {
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const dow = date.getDay();
      if (dow !== 0 && dow !== 6)
        entries.push({
          date,
          label: date.toLocaleDateString("es-AR", {
            day: "2-digit",
            month: "short",
            weekday: "short"
          })
        });
    }
  } else if (periodicity === "semanal") {
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
      return wasSent ? "ok" : "retraso";
    }
    if (wasSent) return "ok";
    return d <= todayDay - 1 ? "retraso" : "pendiente";
  };

  const statusConfig: Record<
    DeliveryStatus,
    { label: string; bg: string; text: string; dot: string }
  > = {
    ok: { label: "OK", bg: "rgba(48,234,3,0.1)", text: "#1a6600", dot: "#30EA03" },
    retraso: { label: "Retraso", bg: "rgba(255,40,255,0.1)", text: "#a0008a", dot: "#FF28FF" },
    pendiente: { label: "Pendiente", bg: "rgba(141,151,157,0.1)", text: "#8D979D", dot: "#D0D3D4" }
  };

  return (
    <div>
      <p className="text-xs font-semibold mb-2" style={{ color: "#000000" }}>
        Historial de entregas — {file.type_archive} (
        {periodicity.charAt(0).toUpperCase() + periodicity.slice(1)})
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
                        <span
                          className="ml-1.5 text-[10px] font-semibold"
                          style={{ color: "#30EA03" }}
                        >
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
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: cfg.dot }}
                      />
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

interface SelectedClient {
  country: IDashboardSummaryClientStatus;
  client: IDashboardSummaryClientStatusClient;
}

function ClientDetailPanel({
  selection,
  open,
  onClose
}: {
  selection: SelectedClient;
  open: boolean;
  onClose: () => void;
}) {
  const { country, client } = selection;
  const totalNovedades = client.novedades;

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
              <SheetTitle className="text-base font-semibold" style={{ color: "#000000" }}>
                {client.client_name}
              </SheetTitle>
              <p className="text-xs text-gray-500 mt-0.5">{country.country_name}</p>
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
                    <TableHead
                      className="text-[11px] font-semibold pl-3"
                      style={{ color: "#333F48" }}
                    >
                      Tipo
                    </TableHead>
                    <TableHead
                      className="text-[11px] font-semibold text-center"
                      style={{ color: "#333F48" }}
                    >
                      %
                    </TableHead>
                    <TableHead
                      className="text-[11px] font-semibold text-center"
                      style={{ color: "#333F48" }}
                    >
                      Esperados
                    </TableHead>
                    <TableHead
                      className="text-[11px] font-semibold text-center"
                      style={{ color: "#333F48" }}
                    >
                      Transformados
                    </TableHead>
                    <TableHead
                      className="text-[11px] font-semibold text-center"
                      style={{ color: "#333F48" }}
                    >
                      Novedades
                    </TableHead>
                    <TableHead
                      className="text-[11px] font-semibold text-center pr-3"
                      style={{ color: "#333F48" }}
                    >
                      Pendientes
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {client.files.map((file) => (
                    <TableRow key={file.id_client_data_archives} style={{ borderColor: "#F3F3F3" }}>
                      <TableCell className="text-xs pl-3 py-2" style={{ color: "#000000" }}>
                        {file.type_archive}
                      </TableCell>
                      <TableCell className="text-center py-2" />
                      <TableCell className="text-center py-2" />
                      <TableCell className="text-center py-2" />
                      <TableCell className="text-center py-2" />
                      <TableCell className="text-center pr-3 py-2" />
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
                {client.files
                  .filter((f) => f.observation)
                  .map((f) => (
                    <li
                      key={`o-${f.id_client_data_archives}`}
                      className="text-[11px] text-red-600 flex items-start gap-1.5"
                    >
                      <XCircle className="h-3 w-3 mt-0.5 shrink-0" />
                      <span>
                        <span className="font-medium">{f.type_archive}:</span> {f.observation}
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

          {client.files.map((f) => (
            <DeliveryTimelineTable key={f.id_client_data_archives} file={f} />
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function NovedadDetailPanel({
  selection,
  file,
  open,
  onClose
}: {
  selection: SelectedClient;
  file: IDashboardSummaryClientStatusFile;
  open: boolean;
  onClose: () => void;
}) {
  const { country, client } = selection;

  const tipo = file.observation
    ? "Observacion"
    : file.transformation && file.transformation.toLowerCase().includes("no")
      ? "Error de transformacion"
      : "Novedad general";

  const descripcion =
    file.observation || `Se detectaron novedades en el archivo ${file.type_archive}.`;

  const etapa = file.observation
    ? "Pipeline"
    : file.transformation && file.transformation.toLowerCase().includes("no")
      ? "Transformacion"
      : "Pipeline";

  const etapaColor: Record<string, { bg: string; text: string }> = {
    Ingesta: { bg: "rgba(255,40,255,0.08)", text: "#FF28FF" },
    Transformacion: { bg: "rgba(173,123,255,0.1)", text: "#AD7BFF" },
    Curaduria: { bg: "rgba(92,224,202,0.1)", text: "#2A9D8F" },
    Pipeline: { bg: "rgba(48,234,3,0.08)", text: "#1a7a00" }
  };
  const colors = etapaColor[etapa] || etapaColor.Pipeline;

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
              <SheetTitle className="text-base font-semibold" style={{ color: "#000000" }}>
                {client.client_name}
              </SheetTitle>
              <p className="text-xs mt-0.5" style={{ color: "#8D979D" }}>
                {country.country_name} · {file.type_archive}
              </p>
            </div>
          </div>
        </SheetHeader>

        <div className="px-5 py-4 flex flex-col gap-3">
          <div
            className="rounded-lg border p-4 flex flex-col gap-2"
            style={{ borderColor: "#D0D3D4" }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold" style={{ color: "#000000" }}>
                  {file.type_archive}
                </span>
                <span
                  className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: colors.bg, color: colors.text }}
                >
                  {etapa}
                </span>
              </div>
            </div>
            <p className="text-xs font-medium" style={{ color: "#333F48" }}>
              {tipo}
            </p>
            <p className="text-[11px] leading-relaxed" style={{ color: "#8D979D" }}>
              {descripcion}
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function DashboardIngestionStatus({ clientStatus }: DashboardIngestionStatusProps) {
  const { selectedFileType } = useDataQualityDashboardContext();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "received" | "pending">("all");
  const [selectedClient, setSelectedClient] = useState<SelectedClient | null>(null);
  const [novedadTarget, setNovedadTarget] = useState<
    (SelectedClient & { file: IDashboardSummaryClientStatusFile }) | null
  >(null);
  const [expandedCountries, setExpandedCountries] = useState<Set<number>>(new Set());
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());

  const sourceClientStatus = clientStatus ?? [];

  const filtered = useMemo<IDashboardSummaryClientStatus[]>(() => {
    const q = search.trim().toLowerCase();
    const typeFilterId =
      selectedFileType && selectedFileType !== "all" ? Number(selectedFileType) : undefined;

    const result: IDashboardSummaryClientStatus[] = [];

    for (const country of sourceClientStatus) {
      const countryMatches = q ? country.country_name.toLowerCase().includes(q) : false;
      const filteredClients: IDashboardSummaryClientStatusClient[] = [];

      for (const client of country.clients) {
        const clientMatches = q ? client.client_name.toLowerCase().includes(q) : false;
        const filteredFiles = client.files.filter((file) => {
          if (typeFilterId !== undefined && file.id_type_archive !== typeFilterId) return false;
          if (!q) return true;
          if (countryMatches || clientMatches) return true;
          return file.type_archive.toLowerCase().includes(q);
        });

        if (filteredFiles.length === 0) continue;
        filteredClients.push({ ...client, files: filteredFiles });
      }

      if (filteredClients.length === 0) continue;
      result.push({ ...country, clients: filteredClients });
    }

    return result;
  }, [sourceClientStatus, selectedFileType, search]);

  const toggleCountry = (id: number) => {
    setExpandedCountries((prev) => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id);
      else s.add(id);
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

  const totalClients = filtered.reduce((sum, c) => sum + c.clients.length, 0);
  const totalFiles = filtered.reduce(
    (sum, c) => sum + c.clients.reduce((s, cl) => s + cl.files.length, 0),
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
            disabled
          >
            <SelectTrigger
              className="w-[140px] h-8 text-xs"
              style={{ borderColor: "#D0D3D4", color: "#000000" }}
              disabled
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
            {filtered.map((country) => {
              const isCountryOpen = expandedCountries.has(country.id_country);

              return [
                <TableRow
                  key={`country-${country.id_country}`}
                  className="cursor-pointer select-none hover:bg-gray-50 transition-colors"
                  style={{ borderColor: "#F3F4F6" }}
                  onClick={() => toggleCountry(country.id_country)}
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
                        {country.country_name}
                      </span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-md"
                        style={{ backgroundColor: "#F3F4F6", color: "#6B7280" }}
                      >
                        {country.clients_count} clientes · {country.files_count} archivos
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-2.5" />
                  <TableCell className="py-2.5" />
                  <TableCell className="text-center py-2.5">
                    <span className="text-xs font-bold" style={{ color: "#000000" }}>
                      {country.estado}%
                    </span>
                  </TableCell>
                  <TableCell className="text-center py-2.5">
                    <span className="text-xs font-semibold" style={{ color: "#8D979D" }}>
                      {country.esperados}
                    </span>
                  </TableCell>
                  <TableCell className="text-center py-2.5">
                    <span className="text-xs font-semibold" style={{ color: "#30EA03" }}>
                      {country.transformados}
                    </span>
                  </TableCell>
                  <TableCell className="text-center py-2.5">
                    <span className="text-xs font-semibold" style={{ color: "#FF28FF" }}>
                      {country.novedades}
                    </span>
                  </TableCell>
                  <TableCell className="text-center py-2.5">
                    <span className="text-xs font-semibold" style={{ color: "#FFA500" }}>
                      {country.pendientes}
                    </span>
                  </TableCell>
                  <TableCell className="pr-6" />
                </TableRow>,

                ...(!isCountryOpen
                  ? []
                  : country.clients.flatMap((client) => {
                      const clientKey = `${country.id_country}-${client.id_client}`;
                      const isClientOpen = expandedClients.has(clientKey);
                      const badge = deriveClientStatus(client);
                      const badgeCfg = clientStatusBadge[badge];

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
                                {client.client_name}
                              </span>
                              <span className="text-[11px]" style={{ color: "#8D979D" }}>
                                · {client.files_count} archivo{client.files_count !== 1 ? "s" : ""}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="py-2.5">
                            <span
                              className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full"
                              style={{ backgroundColor: badgeCfg.bg, color: badgeCfg.text }}
                            >
                              <span
                                className="w-1.5 h-1.5 rounded-full shrink-0"
                                style={{ backgroundColor: badgeCfg.dot }}
                              />
                              {badge}
                            </span>
                          </TableCell>
                          <TableCell className="py-2.5" />
                          <TableCell className="text-center py-2.5">
                            <span className="text-xs font-bold" style={{ color: "#000000" }}>
                              {client.estado}%
                            </span>
                          </TableCell>
                          <TableCell className="text-center py-2.5">
                            <span className="text-xs font-semibold" style={{ color: "#8D979D" }}>
                              {client.esperados}
                            </span>
                          </TableCell>
                          <TableCell className="text-center py-2.5">
                            <span className="text-xs font-semibold" style={{ color: "#30EA03" }}>
                              {client.transformados}
                            </span>
                          </TableCell>
                          <TableCell className="text-center py-2.5">
                            <span className="text-xs font-semibold" style={{ color: "#FF28FF" }}>
                              {client.novedades}
                            </span>
                          </TableCell>
                          <TableCell className="text-center py-2.5">
                            <span className="text-xs font-semibold" style={{ color: "#FFA500" }}>
                              {client.pendientes}
                            </span>
                          </TableCell>
                          <TableCell className="text-center py-2.5 pr-6">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedClient({ country, client });
                              }}
                              className="inline-flex items-center justify-center w-7 h-7 rounded-md transition-colors text-gray-400 hover:text-[#000000] hover:bg-gray-100"
                              title={`Ver detalle de ${client.client_name}`}
                              disabled
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </TableCell>
                        </TableRow>,

                        ...(!isClientOpen
                          ? []
                          : client.files.map((file) => (
                              <TableRow
                                key={`file-${clientKey}-${file.id_client_data_archives}`}
                                className="hover:bg-gray-50"
                                style={{
                                  borderColor: "#F3F3F3",
                                  backgroundColor: "rgba(248,249,250,0.4)"
                                }}
                              >
                                <TableCell className="pl-16 py-2">
                                  <div className="flex items-center gap-2">
                                    <FileText
                                      className="h-3.5 w-3.5 shrink-0"
                                      style={{ color: "#8D979D" }}
                                    />
                                    <span
                                      className="text-xs font-medium"
                                      style={{ color: "#333F48" }}
                                    >
                                      {file.type_archive}
                                    </span>
                                    {file.periodicity && (
                                      <span
                                        className="text-[10px] px-1.5 py-0.5 rounded-full capitalize"
                                        style={{
                                          backgroundColor: "rgba(48,234,3,0.08)",
                                          color: "#1a6600"
                                        }}
                                      >
                                        {file.periodicity}
                                      </span>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="py-2" />
                                <TableCell className="py-2" />
                                <TableCell className="text-center py-2" />
                                <TableCell className="text-center py-2" />
                                <TableCell className="text-center py-2" />
                                <TableCell className="text-center py-2" />
                                <TableCell className="text-center py-2" />
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
                                        onClick={() => setSelectedClient({ country, client })}
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
                                        onClick={() => setNovedadTarget({ country, client, file })}
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
        <span>{filtered.length} paises</span>
        <span style={{ color: "#D0D3D4" }}>·</span>
        <span>{totalClients} clientes</span>
        <span style={{ color: "#D0D3D4" }}>·</span>
        <span>{totalFiles} archivos</span>
      </div>

      {selectedClient && (
        <ClientDetailPanel
          selection={selectedClient}
          open={!!selectedClient}
          onClose={() => setSelectedClient(null)}
        />
      )}

      {novedadTarget && (
        <NovedadDetailPanel
          selection={{ country: novedadTarget.country, client: novedadTarget.client }}
          file={novedadTarget.file}
          open={!!novedadTarget}
          onClose={() => setNovedadTarget(null)}
        />
      )}
    </Card>
  );
}
