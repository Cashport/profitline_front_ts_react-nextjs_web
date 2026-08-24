"use client";

import { useMemo, useState } from "react";
import type { Key } from "react";
import dayjs from "dayjs";
import useSWR from "swr";
import { Table } from "antd";
import UiSearchInput from "@/components/ui/search-input/search-input";
import { GenerateActionButton } from "@/components/atoms/GenerateActionButton";
import {
  EstadoDevolucion,
  IProfit360Causal,
  IProfit360Visit,
  IProfit360VisitDevolucion,
  ReturnRow
} from "@/types/reverseLogistics/IReverseLogistics";
import { getProfit360Visits } from "@/services/reverseLogistics/reverseLogistics";
import { DevolucionesStatsBar } from "../DevolucionesStatsBar/DevolucionesStatsBar";
import { FilterDevolucionesTab } from "../FilterDevolucionesTab/FilterDevolucionesTab";
import { resolveDatePreset } from "../FilterDateTab/FilterDateTab";
import { IDevolucionesFilter } from "../../types";
import { parseCausales } from "../../utils/causales";
import { returnsColumns } from "./columns";
import { highestFaseLabel } from "../../constants";

// Backend page size — the visits endpoint paginates with its own `page`/`limit`,
// so the table pagination mirrors `hasNext`/`hasPrev` instead of slicing the
// result client-side.
const PAGE_SIZE = 10;

// Causales arrive as a JSON blob carrying label + backend color. Older payloads
// only expose the flat `DescripcionCausalDev` / `ColorCausal` pair, so fall back
// to those rather than rendering an empty cell.
const devCausales = (dev: IProfit360VisitDevolucion): IProfit360Causal[] => {
  const parsed = parseCausales(dev.Causales);
  if (parsed.length > 0) return parsed;
  if (!dev.DescripcionCausalDev) return [];
  return [
    {
      Id: dev.IdCausalDevolucion ?? "",
      causal: dev.DescripcionCausalDev,
      RGB: dev.ColorCausal ?? ""
    }
  ];
};

// Distinct causales across a visit's devoluciones, so the parent row summarizes
// what its children carry. Deduped by GUID, falling back to the label when the
// backend leaves `Id` blank.
const uniqueCausales = (devs: IProfit360VisitDevolucion[]): IProfit360Causal[] => {
  const byKey = new Map<string, IProfit360Causal>();
  devs.forEach((dev) =>
    devCausales(dev).forEach((c) => {
      const key = c.Id || c.causal;
      if (!byKey.has(key)) byKey.set(key, c);
    })
  );
  return Array.from(byKey.values());
};

// Flatten a visit's devoluciones into leaf ReturnRows. Each devolucion from the
// new endpoint maps 1:1 to the legacy ReturnRow shape the columns consume.
// `index` es la posición dentro de la visita y solo se usa para la key.
const mapDevolucionToRow = (
  visit: IProfit360Visit,
  dev: IProfit360VisitDevolucion,
  index: number
): ReturnRow => {
  // Parse the ISO timestamp into the "YYYY-MM-DD HH:mm" shape the legacy
  // `parseFechaReturn` helper expects.
  const fechaIso = dev.FechaInicioDevolucion ?? dev.FechaRegistro;
  const fecha = fechaIso ? dayjs(fechaIso).format("YYYY-MM-DD HH:mm") : "";

  // Si la devolución trae fases (F1..F4), gana la más alta (F4 sobre F3 sobre
  // F2 sobre F1). Si no hay fases, caemos al `Estado` libre que devuelve el
  // endpoint. Cast a `unknown` para no mentir sobre el match exhaustivo: el
  // renderer de la columna se defiende si el valor no está en `estadoConfig`.
  const faseLabel = highestFaseLabel(dev.fases);
  const estado = (faseLabel ?? dev.Estado) as EstadoDevolucion;

  const causales = devCausales(dev);

  return {
    // `IdDevolucion` se repite cuando una devolución trae varios documentos, así
    // que el índice dentro de la visita es lo único que garantiza unicidad. Con
    // keys duplicadas React deja filas huérfanas al cerrar el desplegable.
    key: `visit-${visit.visitProjectId}-dev-${index}-${dev.Id}`,
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
    causales,
    monto: dev.MontoDocumento ?? dev.ValorTotalDocumento ?? 0,
    estado,
    haveApprove: !!dev.IdAprobacion,
    idDevolucion: dev.Id,
    pdfUrl: dev.PdfBoleto ?? undefined,
    // Stash the original dev so the actions column can navigate to the
    // approval detail using `IdDevolucion` as the approval id.
    originalDev: dev
  };
};

// Fallback row emitted when a visit has no devoluciones — the visit itself
// still needs to be visible in the table so the user knows the scheduled
// visit existed (just no returns attached yet).
const mapVisitToFallbackRow = (visit: IProfit360Visit, visitIndex: number): ReturnRow => {
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
    // Igual que en las hijas: el índice en la página garantiza que la key sea
    // única aunque el backend repita `visitProjectId`.
    key: `visit-${visitIndex}-${visit.visitProjectId}`,
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
    causales: uniqueCausales(visit.devoluciones ?? []),
    monto: resumen.monto,
    estado,
    pdfUrl: undefined,
    calculatedStatus: visit.calculatedStatus,
    haveApprove: false
  };
};

export function DevolucionesTab() {
  // Default filter = the "Este mes" preset, resolved from the same definitions the
  // date panel uses so the Fecha tag opens naming that period.
  const defaultDates = resolveDatePreset("este_mes");
  const [filter, setFilter] = useState<IDevolucionesFilter>({
    clientId: null,
    fromDate: defaultDates.from,
    toDate: defaultDates.to
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

  // Flatten visits → rows. Una visita con 2+ devoluciones es un grupo con hijos
  // desplegables; con una sola, la fila ES la devolución (sin desplegable) para
  // que boleto, sucursal, hora y acciones se vean de una. Sin devoluciones,
  // igual emitimos la fila de la visita para que la programada siga visible.
  const allRows = useMemo<ReturnRow[]>(
    () =>
      visits.map<ReturnRow>((visit, visitIndex) => {
        const devs = visit.devoluciones ?? [];

        if (devs.length === 1) return mapDevolucionToRow(visit, devs[0], 0);

        return {
          ...mapVisitToFallbackRow(visit, visitIndex),
          isGroup: devs.length > 1,
          devCount: devs.length,
          children:
            devs.length > 0 ? devs.map((d, i) => mapDevolucionToRow(visit, d, i)) : undefined
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
          (row.causales ?? []).some((c) => c.causal.toLowerCase().includes(q))
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

      {/* KPI stats bar — fetches its own per-fase averages from
          /kpis-devolucion using the same filters as the table. */}
      <DevolucionesStatsBar
        clientId={filter.clientId}
        fromDate={filter.fromDate}
        toDate={filter.toDate}
      />

      {/* Table — backend pagination */}
      <div className="w-full overflow-x-auto">
        <Table<ReturnRow>
          rowKey="key"
          columns={returnsColumns}
          dataSource={filtered}
          loading={isLoading}
          // `indent > 0` = fila hija desplegada de una visita con 2+ devoluciones:
          // van sobre gris claro y se separan entre sí con una línea blanca. El
          // `!` es necesario para ganarle a las reglas de AntD sobre `td`.
          rowClassName={(_record, _index, indent) =>
            indent > 0
              ? "[&>td]:!bg-cashport-gray-lighter [&:hover>td]:!bg-[#F0F0F0] [&>td]:!border-b-white"
              : ""
          }
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
          scroll={{ x: 1000 }}
        />
      </div>
    </>
  );
}
