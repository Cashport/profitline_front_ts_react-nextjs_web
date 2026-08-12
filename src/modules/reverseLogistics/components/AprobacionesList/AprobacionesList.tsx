"use client";

import { useMemo, useState } from "react";
import type { Key } from "react";
import dayjs from "dayjs";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { Table } from "antd";
import UiSearchInput from "@/components/ui/search-input/search-input";
import { GenerateActionButton } from "@/components/atoms/GenerateActionButton";
import { IApproval, TipoAprobacion } from "@/types/reverseLogistics/IReverseLogistics";
import { getProfit360Approvals } from "@/services/reverseLogistics/reverseLogistics";
import { APPROVALS_FETCH_LIMIT, ESTADO_PENDIENTE_APROBACION_ID, PAGE_SIZE } from "../../constants";
import { IAprobacionesFilter } from "../../types";
import { FilterAprobacionesTab } from "../FilterAprobacionesTab/FilterAprobacionesTab";
import { getApprovalsColumns, IApprovalRow } from "./columns";

// Stable numeric id derived from a GUID string. The AntD table needs a numeric
// `rowKey`, so we collapse the Profit360 GUID into a deterministic number
// while keeping the real GUID available on the record for the detail link.
const guidToNumber = (guid: string): number => {
  let h = 0;
  for (let i = 0; i < guid.length; i++) {
    h = (h * 31 + guid.charCodeAt(i)) >>> 0;
  }
  return h;
};

// Map the Profit360 payload to the legacy `IApproval` shape consumed by the
// columns + detail view. Fields that aren't surfaced by the new endpoint are
// left blank rather than fabricated. The real GUID is attached on the row so
// the "Ir a Aprobar" button can navigate to /logistica-inversa/aprobaciones/:id.
const mapProfit360ToApprovalRow = (raw: {
  id: string;
  cliente: string;
  codigoCliente: string;
  canal: string;
  lineaNegocio: string;
  municipio: string;
  fechaRegistro: string;
  causales: string | null;
  lotesPorAprobar: number;
  cantidad: number | null;
  valorTotalDocumento: number | null;
}): IApprovalRow => {
  let causales: TipoAprobacion[] = [];
  if (raw.causales) {
    try {
      const parsed = JSON.parse(raw.causales);
      const list: { causal?: string }[] = parsed?.Causales ?? [];
      causales = list
        .map((c) => c.causal)
        .filter((c): c is string => typeof c === "string")
        .map((c) => c as TipoAprobacion);
    } catch {
      causales = [];
    }
  }

  const fecha = raw.fechaRegistro ? dayjs(raw.fechaRegistro) : null;
  const fechaStr = fecha && fecha.isValid() ? fecha.format("DD/MM/YYYY HH:mm") : "";

  return {
    id: guidToNumber(raw.id),
    guid: raw.id,
    cliente: raw.cliente,
    codigoCliente: raw.codigoCliente,
    canal: raw.canal,
    linea: raw.lineaNegocio,
    ciudad: raw.municipio,
    fecha: fechaStr,
    tiposAprobacion: causales,
    lotesParaAprobar: raw.lotesPorAprobar,
    unidades: raw.cantidad ?? 0,
    monto: raw.valorTotalDocumento ?? 0
  };
};

export function AprobacionesList() {
  const router = useRouter();

  // Default filter = today, same as the Devoluciones tab. clientId/fromDate/toDate
  // reach the backend; tipos/ciudades are applied client-side.
  const today = dayjs().format("YYYY-MM-DD");
  const [filter, setFilter] = useState<IAprobacionesFilter>({
    clientId: null,
    fromDate: today,
    toDate: today,
    tipos: [],
    ciudades: []
  });

  const { data, isLoading } = useSWR(
    ["reverse-logistics/profit360-approvals", filter.fromDate, filter.toDate, filter.clientId],
    () =>
      getProfit360Approvals({
        page: 1,
        limit: APPROVALS_FETCH_LIMIT,
        fromDate: filter.fromDate,
        toDate: filter.toDate,
        clientId: filter.clientId
      }),
    { revalidateOnFocus: false }
  );

  // Only approvals still awaiting a decision belong in this tab. Matching on the
  // GUID rather than the `estado` label because the label is free text; casing of
  // the GUID isn't guaranteed by Profit360.
  const approvals = useMemo<IApprovalRow[]>(
    () =>
      (data?.data ?? [])
        .filter((a) => a.idEstado?.toUpperCase() === ESTADO_PENDIENTE_APROBACION_ID)
        .map(mapProfit360ToApprovalRow),
    [data]
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);

  const columns = useMemo(
    () => getApprovalsColumns((guid) => router.push(`/logistica-inversa/aprobaciones/${guid}`)),
    [router]
  );

  // The endpoint exposes no ciudad picklist, so the options are the distinct
  // ciudades present in the loaded approvals.
  const ciudadOptions = useMemo(
    () => Array.from(new Set(approvals.map((a) => a.ciudad).filter(Boolean))).sort(),
    [approvals]
  );

  const filtered = useMemo(
    () =>
      approvals.filter((a) => {
        if (searchTerm) {
          const q = searchTerm.toLowerCase();
          const matches =
            a.cliente.toLowerCase().includes(q) ||
            a.ciudad.toLowerCase().includes(q) ||
            a.canal.toLowerCase().includes(q) ||
            a.codigoCliente.toLowerCase().includes(q);
          if (!matches) return false;
        }
        if (filter.tipos.length && !filter.tipos.some((t) => a.tiposAprobacion.includes(t)))
          return false;
        if (filter.ciudades.length && !filter.ciudades.includes(a.ciudad)) return false;
        return true;
      }),
    [approvals, searchTerm, filter.tipos, filter.ciudades]
  );

  const resetPage = () => setCurrentPage(1);

  const handleFilterChange = (next: IAprobacionesFilter) => {
    setFilter(next);
    resetPage();
  };

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <UiSearchInput
          placeholder="Buscar"
          onChange={(e) => {
            setSearchTerm(e.target.value);
            resetPage();
          }}
        />

        <GenerateActionButton onClick={() => {}} />

        <FilterAprobacionesTab
          value={filter}
          onChange={handleFilterChange}
          ciudadOptions={ciudadOptions}
        />
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto">
        <Table<IApprovalRow>
          rowKey="id"
          columns={columns}
          dataSource={filtered}
          loading={isLoading}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys
          }}
          pagination={{
            current: currentPage,
            pageSize: PAGE_SIZE,
            showSizeChanger: false,
            position: ["none", "bottomRight"],
            onChange: setCurrentPage,
            showTotal: (total, range) =>
              `Mostrando ${range[0]} a ${range[1]} de ${total} resultados`
          }}
          scroll={{ x: 1000 }}
        />
      </div>
    </>
  );
}

// Keep `IApproval` exported for legacy imports — the type itself hasn't changed,
// this just suppresses an "unused import" lint warning if the consumer drops it.
export type { IApproval };
