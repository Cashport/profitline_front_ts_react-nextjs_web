"use client";

import { useMemo, useState } from "react";
import type { Key } from "react";
import dayjs from "dayjs";
import useSWR from "swr";
import { Table } from "antd";
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
import { FilterDevolucionesTab } from "../FilterDevolucionesTab/FilterDevolucionesTab";
import { IDevolucionesFilter } from "../../types";
import { returnsColumns } from "./columns";

// Backend page size — the visits endpoint paginates with its own `page`/`limit`,
// so the table pagination mirrors `hasNext`/`hasPrev` instead of slicing the
// result client-side.
const PAGE_SIZE = 10;

// Flatten a visit's devoluciones into leaf ReturnRows. Each devolucion from the
// new endpoint maps 1:1 to the legacy ReturnRow shape the columns consume.
const mapDevolucionToRow = (visit: IProfit360Visit, dev: IProfit360VisitDevolucion): ReturnRow => {
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
    key: `dev-${dev.IdDevolucion}-visit-${visit.visitProjectId}`,
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
    pdfUrl: dev.PdfBoleto ?? undefined,
    // Stash the original dev so the actions column can navigate to the
    // approval detail using `IdDevolucion` as the approval id.
    originalDev: dev
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
  const resumen = (visit.devoluciones ?? []).reduce(
    (acc, dev) => {
      const { canal, lineaNegocio, unidades, monto } = acc;

      return {
        canal: [...canal.filter((c) => c != ""), dev.Canal],
        lineaNegocio: [...lineaNegocio.filter((c) => c != ""), dev.LineaNegocio],
        unidades: unidades + dev.Unidades,
        monto: monto + dev.MontoDocumento
      };
    },
    {
      unidades: 0,
      monto: 0,
      canal: [""],
      lineaNegocio: [""]
    }
  );
  const estado = visit.status as unknown as EstadoDevolucion;
  return {
    key: `visit-${visit.visitProjectId}`,
    isGroup: false,
    devCount: 0,
    id: 0,
    idBoleto: "",
    fecha,
    cliente: visit.clientName,
    direccionCliente: "",
    canal: resumen.canal.join(),
    lineaNegocio: resumen.lineaNegocio.join(),
    unidades: resumen.unidades,
    causal: undefined,
    monto: resumen.monto,
    estado,
    pdfUrl: undefined,
    calculatedStatus: visit.calculatedStatus
  };
};

export function DevolucionesTab() {
  // Default filter = today (fromDate = toDate = YYYY-MM-DD), matching the
  // endpoint contract and the user's spec for this tab.
  const today = dayjs().format("YYYY-MM-DD");
  const [filter, setFilter] = useState<IDevolucionesFilter>({
    clientId: null,
    fromDate: today,
    toDate: today
  });
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);

  // Any filter change invalidates the current page — the backend re-paginates
  // from scratch with the new query params.
  const handleFilterChange = (next: IDevolucionesFilter) => {
    setFilter(next);
    setPage(1);
  };

  const swrKey = [
    "reverse-logistics/profit360-visits",
    page,
    filter.fromDate,
    filter.toDate,
    filter.clientId
  ] as const;
  const { data, isLoading } = useSWR(swrKey, () =>
    getProfit360Visits({
      page,
      limit: PAGE_SIZE,
      fromDate: filter.fromDate,
      toDate: filter.toDate,
      clientId: filter.clientId
    })
  );

  const visits = data?.data ?? [];
  const total = data?.total ?? 0;

  // Flatten visits → rows. Each visit produces one row per devolución; if it
  // has none, we still emit a single fallback row so the scheduled visit
  // remains visible in the table.
  const allRows = useMemo<ReturnRow[]>(
    () =>
      visits.map<ReturnRow>((visit) => {
        return {
          ...mapVisitToFallbackRow(visit),
          isGroup: visit.devoluciones.length > 1,
          devCount: visit.devoluciones.length,
          children:
            visit.devoluciones.length > 0
              ? visit.devoluciones.map((d) => mapDevolucionToRow(visit, d))
              : undefined
        };
      }),
    [visits]
  );

  // Client-side search across the current page only — cliente, date range and
  // pagination are backend-driven.
  const filtered = useMemo(
    () =>
      allRows.filter((row) => {
        if (!searchTerm) return true;
        const q = searchTerm.toLowerCase();
        return (
          row.idBoleto.toLowerCase().includes(q) ||
          row.cliente.toLowerCase().includes(q) ||
          (row.causal ?? "").toLowerCase().includes(q)
        );
      }),
    [allRows, searchTerm]
  );

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <UiSearchInput placeholder="Buscar" onChange={(e) => setSearchTerm(e.target.value)} />

        <GenerateActionButton onClick={() => {}} />

        <FilterDevolucionesTab value={filter} onChange={handleFilterChange} />
      </div>

      {/* KPI stats bar — fed the flattened rows so the existing per-estado
          averages keep working. */}
      <DevolucionesStatsBar returns={allRows} loading={isLoading} />

      {/* Table — backend pagination */}
      <div className="w-full overflow-x-auto">
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
