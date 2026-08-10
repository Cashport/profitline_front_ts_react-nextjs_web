"use client";

import { useMemo, useState } from "react";
import type { Key } from "react";
import dayjs from "dayjs";
import useSWR from "swr";
import { Button, DatePicker, Table } from "antd";
import type { Dayjs } from "dayjs";
import { Filter, ChevronRight } from "lucide-react";
import UiSearchInput from "@/components/ui/search-input/search-input";
import { GenerateActionButton } from "@/components/atoms/GenerateActionButton";
import {
  CausalDevolucion,
  EstadoDevolucion,
  IProfit360Visit,
  IProfit360VisitDevolucion,
  ReturnRow
} from "@/types/reverseLogistics/IReverseLogistics";
import { getProfit360Visits } from "@/services/reverseLogistics/reverseLogistics";
import { DevolucionesStatsBar } from "../DevolucionesStatsBar/DevolucionesStatsBar";
import { returnsColumns } from "./columns";

// Backend page size — the visits endpoint paginates with its own `page`/`limit`,
// so the table pagination now mirrors `hasNext`/`hasPrev` instead of slicing
// the result client-side.
const PAGE_SIZE = 10;

// Flatten a visit's devoluciones into leaf ReturnRows. Each devolucion from the
// new endpoint maps 1:1 to the legacy ReturnRow shape the columns consume.
const mapDevolucionToRow = (
  visit: IProfit360Visit,
  dev: IProfit360VisitDevolucion
): ReturnRow => {
  // Parse the ISO timestamp into the "YYYY-MM-DD HH:mm" shape the legacy
  // `parseFechaReturn` helper expects.
  const fechaIso = dev.FechaInicioDevolucion ?? dev.FechaRegistro;
  const fecha = fechaIso ? dayjs(fechaIso).format("YYYY-MM-DD HH:mm") : "";

  // Causal / estado come as free-text strings on the new endpoint. Cast
  // through `unknown` so we don't lie about exhaustive matching — the column
  // renderer falls back gracefully for unknown values.
  const causal = dev.DescripcionCausalDev as unknown as CausalDevolucion;
  const estado = dev.Estado as unknown as EstadoDevolucion;

  return {
    key: `dev-${dev.IdDevolucion}`,
    isGroup: false,
    devCount: 1,
    id: 0,
    idBoleto: dev.IdBoleto ?? "",
    fecha,
    cliente: dev.Cliente,
    direccionCliente: dev.Sucursal,
    canal: dev.Canal,
    lineaNegocio: dev.LineaNegocio,
    unidades: dev.Unidades ?? dev.UnidadesRegistradas ?? dev.UnidadesDocumento ?? 0,
    causal,
    monto: dev.MontoDocumento ?? dev.ValorTotalDocumento ?? 0,
    estado,
    pdfUrl: dev.PdfBoleto ?? undefined
  };
};

// Fallback row emitted when a visit has no devoluciones — the visit itself
// still needs to be visible in the table so the user knows the scheduled
// visit existed (just no returns attached yet).
const mapVisitToFallbackRow = (visit: IProfit360Visit): ReturnRow => {
  const fecha = visit.scheduledDate
    ? dayjs(visit.scheduledDate).format("YYYY-MM-DD") +
      (visit.scheduledTime ? ` ${visit.scheduledTime}` : "")
    : "";
  const estado = visit.status as unknown as EstadoDevolucion;
  return {
    key: `visit-${visit.visitId}`,
    isGroup: false,
    devCount: 0,
    id: 0,
    idBoleto: "",
    fecha,
    cliente: visit.clientName,
    direccionCliente: "",
    canal: "",
    lineaNegocio: "",
    unidades: 0,
    causal: undefined,
    monto: 0,
    estado,
    pdfUrl: undefined
  };
};

export function DevolucionesTab() {
  // Default filter = today (fromDate = toDate = YYYY-MM-DD), matching the
  // endpoint contract and the user's spec for this tab.
  const today = dayjs().format("YYYY-MM-DD");
  const [fromDate, setFromDate] = useState<string>(today);
  const [toDate, setToDate] = useState<string>(today);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);

  const swrKey = ["reverse-logistics/profit360-visits", page, fromDate, toDate] as const;
  const { data, isLoading } = useSWR(swrKey, () =>
    getProfit360Visits({ page, fromDate, toDate, limit: PAGE_SIZE })
  );

  const visits = data?.data ?? [];
  const total = data?.total ?? 0;

  // Flatten visits → rows. Each visit produces one row per devolución; if it
  // has none, we still emit a single fallback row so the scheduled visit
  // remains visible in the table.
  const allRows = useMemo<ReturnRow[]>(
    () =>
      visits.flatMap<ReturnRow>((visit) =>
        visit.devoluciones.length > 0
          ? visit.devoluciones.map((d) => mapDevolucionToRow(visit, d))
          : [mapVisitToFallbackRow(visit)]
      ),
    [visits]
  );

  // Client-side search across the current page only — date range + pagination
  // is backend-driven.
  const filtered = useMemo(
    () =>
      searchTerm
        ? allRows.filter((row) => {
            const q = searchTerm.toLowerCase();
            return (
              row.idBoleto.toLowerCase().includes(q) ||
              row.cliente.toLowerCase().includes(q) ||
              (row.causal ?? "").toLowerCase().includes(q)
            );
          })
        : allRows,
    [allRows, searchTerm]
  );

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-cashport-gray-light">
        <UiSearchInput
          placeholder="Buscar"
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <GenerateActionButton onClick={() => {}} />

        <Button
          icon={<Filter className="h-3.5 w-3.5" />}
          onClick={() => setShowFilters((v) => !v)}
          className="flex items-center gap-1.5"
        >
          Filtros
          <ChevronRight
            className={`h-3.5 w-3.5 transition-transform ${showFilters ? "rotate-90" : ""}`}
          />
        </Button>
      </div>

      {/* Expanded filter panel — fecha range bound to fromDate/toDate */}
      {showFilters && (
        <div className="px-4 py-3 border-b border-cashport-gray-light bg-gray-50/60">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">Fecha inicial</label>
              <DatePicker
                format="YYYY-MM-DD"
                value={fromDate ? (dayjs(fromDate) as Dayjs) : null}
                onChange={(_d, dateString) => {
                  setFromDate(Array.isArray(dateString) ? "" : dateString);
                  setPage(1);
                }}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">Fecha final</label>
              <DatePicker
                format="YYYY-MM-DD"
                value={toDate ? (dayjs(toDate) as Dayjs) : null}
                onChange={(_d, dateString) => {
                  setToDate(Array.isArray(dateString) ? "" : dateString);
                  setPage(1);
                }}
              />
            </div>
            <Button
              size="small"
              onClick={() => {
                setFromDate(today);
                setToDate(today);
                setPage(1);
              }}
            >
              Hoy
            </Button>
          </div>
        </div>
      )}

      {/* KPI stats bar — fed the flattened rows so the existing per-estado
          averages keep working. */}
      <DevolucionesStatsBar returns={allRows} />

      {/* Table — backend pagination */}
      <div className="w-full overflow-x-auto px-4">
        <Table<ReturnRow>
          rowKey="key"
          columns={returnsColumns}
          dataSource={filtered}
          loading={isLoading}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys
          }}
          pagination={{
            current: page,
            pageSize: PAGE_SIZE,
            total,
            showSizeChanger: false,
            position: ["none", "bottomRight"],
            onChange: setPage,
            showTotal: (t, range) => `Mostrando ${range[0]} a ${range[1]} de ${t} resultados`
          }}
          scroll={{ x: 960 }}
        />
      </div>
    </>
  );
}