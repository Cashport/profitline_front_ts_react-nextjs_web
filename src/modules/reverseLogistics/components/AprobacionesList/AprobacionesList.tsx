"use client";

import { useMemo, useState } from "react";
import type { Key } from "react";
import useSWR from "swr";
import { Button, Input, Select, Table } from "antd";
import { Filter, ChevronRight } from "lucide-react";
import UiSearchInput from "@/components/ui/search-input/search-input";
import { GenerateActionButton } from "@/components/atoms/GenerateActionButton";
import { IApproval, TipoAprobacion } from "@/types/reverseLogistics/IReverseLogistics";
import { getApprovals } from "@/services/reverseLogistics/reverseLogistics";
import { PAGE_SIZE, TIPO_APROBACION_OPTIONS } from "../../constants";
import { getApprovalsColumns } from "./columns";

interface AprobacionesListProps {
  onSelect: (approval: IApproval) => void;
}

export function AprobacionesList({ onSelect }: AprobacionesListProps) {
  const { data, isLoading } = useSWR("reverse-logistics/approvals", () => getApprovals(), {
    revalidateOnFocus: false
  });
  const approvals = data?.data ?? [];

  const [searchTerm, setSearchTerm] = useState("");
  const [tipoFilter, setTipoFilter] = useState<TipoAprobacion | null>(null);
  const [ciudadFilter, setCiudadFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);

  const columns = useMemo(() => getApprovalsColumns(onSelect), [onSelect]);

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
          </div>
        </div>
      )}

      {/* Table */}
      <div className="w-full overflow-x-auto px-4">
        <Table<IApproval>
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
