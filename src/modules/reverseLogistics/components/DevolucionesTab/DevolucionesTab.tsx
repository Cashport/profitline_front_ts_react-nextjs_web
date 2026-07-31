"use client";

import { useMemo, useState } from "react";
import { Button, DatePicker, Select, Table } from "antd";
import type { Key } from "react";
import { Filter, ChevronRight } from "lucide-react";
import UiSearchInput from "@/components/ui/search-input/search-input";
import { GenerateActionButton } from "@/components/atoms/GenerateActionButton";
import { CausalDevolucion, EstadoDevolucion } from "@/types/reverseLogistics/IReverseLogistics";
import { useReverseLogistics } from "../../hooks/useReverseLogistics";
import { buildReturnRows, ReturnRow } from "../../utils/grouping";
import { CAUSAL_OPTIONS, ESTADO_OPTIONS, PAGE_SIZE } from "../../constants";
import { DevolucionesStatsBar } from "../DevolucionesStatsBar/DevolucionesStatsBar";
import { returnsColumns } from "./columns";

export function DevolucionesTab() {
  const { returns, isLoading } = useReverseLogistics();

  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFilter, setEstadoFilter] = useState<EstadoDevolucion | null>(null);
  const [causalFilter, setCausalFilter] = useState<CausalDevolucion | null>(null);
  const [clienteFilter, setClienteFilter] = useState<string | null>(null);
  const [fechaInicial, setFechaInicial] = useState("");
  const [fechaFinal, setFechaFinal] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);

  const clienteOptions = useMemo(
    () =>
      Array.from(new Set(returns.map((r) => r.cliente)))
        .sort()
        .map((c) => ({ value: c, label: c })),
    [returns]
  );

  const filtered = useMemo(
    () =>
      returns.filter((dev) => {
        if (searchTerm) {
          const q = searchTerm.toLowerCase();
          const matches =
            dev.idBoleto.toLowerCase().includes(q) ||
            dev.cliente.toLowerCase().includes(q) ||
            dev.causal.toLowerCase().includes(q);
          if (!matches) return false;
        }
        if (estadoFilter && dev.estado !== estadoFilter) return false;
        if (causalFilter && dev.causal !== causalFilter) return false;
        if (clienteFilter && dev.cliente !== clienteFilter) return false;
        if (fechaInicial && dev.fecha.split(" ")[0] < fechaInicial) return false;
        if (fechaFinal && dev.fecha.split(" ")[0] > fechaFinal) return false;
        return true;
      }),
    [returns, searchTerm, estadoFilter, causalFilter, clienteFilter, fechaInicial, fechaFinal]
  );

  const dataSource = useMemo(() => buildReturnRows(filtered), [filtered]);

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
          placeholder="Estado"
          value={estadoFilter}
          onChange={(value) => {
            setEstadoFilter(value ?? null);
            resetPage();
          }}
          options={ESTADO_OPTIONS}
          style={{ minWidth: 160 }}
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
              <label className="text-xs text-gray-500 font-medium">Causal</label>
              <Select
                allowClear
                placeholder="Todos"
                value={causalFilter}
                onChange={(value) => {
                  setCausalFilter(value ?? null);
                  resetPage();
                }}
                options={CAUSAL_OPTIONS}
                style={{ width: 240 }}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">Cliente</label>
              <Select
                allowClear
                showSearch
                placeholder="Todos"
                value={clienteFilter}
                onChange={(value) => {
                  setClienteFilter(value ?? null);
                  resetPage();
                }}
                options={clienteOptions}
                style={{ width: 240 }}
                optionFilterProp="label"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">Fecha inicial</label>
              <DatePicker
                format="YYYY-MM-DD"
                onChange={(_, dateString) => {
                  setFechaInicial(Array.isArray(dateString) ? "" : dateString);
                  resetPage();
                }}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">Fecha final</label>
              <DatePicker
                format="YYYY-MM-DD"
                onChange={(_, dateString) => {
                  setFechaFinal(Array.isArray(dateString) ? "" : dateString);
                  resetPage();
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* KPI stats bar */}
      <DevolucionesStatsBar returns={returns} />

      {/* Table */}
      <div className="w-full overflow-x-auto px-4">
        <Table<ReturnRow>
          rowKey="key"
          columns={returnsColumns}
          dataSource={dataSource}
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
          scroll={{ x: 960 }}
        />
      </div>
    </>
  );
}
