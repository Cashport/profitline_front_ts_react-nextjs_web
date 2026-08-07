"use client";

import { useMemo, useState } from "react";
import type { Key } from "react";
import dayjs from "dayjs";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { Button, Input, Select, Table } from "antd";
import { Filter, ChevronRight } from "lucide-react";
import UiSearchInput from "@/components/ui/search-input/search-input";
import {
  FilterAprobacionesTab,
  IProfit360ApprovalsFilters
} from "@/components/atoms/Filters/FilterAprobacionesTab/FilterAprobacionesTab";
import { GenerateActionButton } from "@/components/atoms/GenerateActionButton";
import { IApproval, TipoAprobacion } from "@/types/reverseLogistics/IReverseLogistics";
import { getProfit360Approvals } from "@/services/reverseLogistics/reverseLogistics";
import { PAGE_SIZE, TIPO_APROBACION_OPTIONS } from "../../constants";
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

  // Default filter = today's date, matching the endpoint contract `?from=YYYY-MM-DD`.
  const [selectedFilters, setSelectedFilters] = useState<IProfit360ApprovalsFilters>({
    from: dayjs().format("YYYY-MM-DD")
  });

  const from = selectedFilters.from ?? dayjs().format("YYYY-MM-DD");

  const { data, isLoading } = useSWR(
    ["reverse-logistics/profit360-approvals", from],
    () => getProfit360Approvals(from),
    { revalidateOnFocus: false }
  );

  const approvals = useMemo<IApprovalRow[]>(
    () => (data?.data ?? []).map(mapProfit360ToApprovalRow),
    [data]
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [tipoFilter, setTipoFilter] = useState<TipoAprobacion | null>(null);
  const [ciudadFilter, setCiudadFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);

  const columns = useMemo(
    () => getApprovalsColumns((guid) => router.push(`/logistica-inversa/aprobaciones/${guid}`)),
    [router]
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
        if (tipoFilter && !a.tiposAprobacion.includes(tipoFilter)) return false;
        if (ciudadFilter && !a.ciudad.toLowerCase().includes(ciudadFilter.toLowerCase()))
          return false;
        return true;
      }),
    [approvals, searchTerm, tipoFilter, ciudadFilter]
  );

  const resetPage = () => setCurrentPage(1);

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-cashport-gray-light">
        <UiSearchInput
          placeholder="Buscar"
          onChange={(e) => {
            setSearchTerm(e.target.value);
            resetPage();
          }}
        />

        <GenerateActionButton onClick={() => {}} />

        <Select
          allowClear
          placeholder="Tipo de Aprobación"
          value={tipoFilter}
          onChange={(value) => {
            setTipoFilter(value ?? null);
            resetPage();
          }}
          options={TIPO_APROBACION_OPTIONS}
          style={{ minWidth: 200 }}
        />

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

      {/* Expanded filter panel */}
      {showFilters && (
        <div className="px-4 py-3 border-b border-cashport-gray-light bg-gray-50/60">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">Ciudad</label>
              <Input
                placeholder="Ciudad"
                value={ciudadFilter}
                onChange={(e) => {
                  setCiudadFilter(e.target.value);
                  resetPage();
                }}
                style={{ width: 200 }}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">Fecha de registro</label>
              <FilterAprobacionesTab
                selectedFilters={selectedFilters}
                setSelectedFilters={setSelectedFilters}
              />
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="w-full overflow-x-auto px-4">
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
            showTotal: (total, range) => `Mostrando ${range[0]} a ${range[1]} de ${total} resultados`
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