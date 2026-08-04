"use client";

import { useMemo, useState } from "react";
import type { Key } from "react";
import useSWR from "swr";
import { Button, Table } from "antd";
import { ChevronLeft, AlertTriangle, TrendingUp } from "lucide-react";
import UiSearchInput from "@/components/ui/search-input/search-input";
import { IApproval, IApprovalProduct } from "@/types/reverseLogistics/IReverseLogistics";
import { getApprovalProducts } from "@/services/reverseLogistics/reverseLogistics";
import { fmtCop, fmtPct } from "../../utils/format";
import { productsColumns } from "./columns";

// Mock: monthly sales + accumulated returns this month (would come from the API).
const MOCK_REGLA = {
  ventaMensual: 30000000,
  devolucionesMes: 1250000,
  limite: 0.05 // 5%
};

interface AprobacionDetalleProps {
  approval: IApproval;
  onBack: () => void;
}

export function AprobacionDetalle({ approval, onBack }: AprobacionDetalleProps) {
  const { data, isLoading } = useSWR(
    ["reverse-logistics/approval-products", approval.id],
    () => getApprovalProducts(approval.id),
    { revalidateOnFocus: false }
  );
  const products = data?.data ?? [];

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const [approved, setApproved] = useState(false);

  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.lote.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [products, searchTerm]
  );

  const { ventaMensual, devolucionesMes, limite } = MOCK_REGLA;
  const pctActual = devolucionesMes / ventaMensual;
  const pctAprobacion = approval.monto / ventaMensual;
  const pctTotal = pctActual + pctAprobacion;
  const excede = pctTotal > limite;

  return (
    <div className="px-5 py-4 space-y-4">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-900">Aprobación de Lotes</h2>
        <Button
          onClick={onBack}
          type="primary"
          icon={<ChevronLeft className="h-3.5 w-3.5" />}
          style={{ backgroundColor: "#22a86a" }}
        >
          Regresar
        </Button>
      </div>

      {/* Client info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 text-sm text-gray-700">
        <div>
          <span className="font-medium">Cliente:</span> {approval.cliente}
        </div>
        <div>
          <span className="font-medium">Código Cliente:</span> {approval.codigoCliente}
        </div>
        <div>
          <span className="font-medium">Línea de Negocio:</span> {approval.linea}
        </div>
        <div>
          <span className="font-medium">Valor del Documento:</span> {fmtCop(approval.monto)}
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium">Causal Devolución:</span>
          <span
            className="inline-block px-2 py-0.5 rounded text-xs font-semibold text-white"
            style={{ backgroundColor: "#9333ea" }}
          >
            {approval.tiposAprobacion[0]?.split("(")[1]?.replace(")", "") ??
              approval.tiposAprobacion[0]}
          </span>
        </div>
        <div>
          <span className="font-medium">Unidades Documentos:</span> {approval.unidades}
        </div>
        <div>
          <span className="font-medium">Unidades Registradas:</span> {approval.unidades}
        </div>
      </div>

      {/* Regla 5% — 3 cards */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
          <span className="text-xs font-medium text-gray-500">
            Regla devoluciones / venta mensual — límite {fmtPct(limite)}
          </span>
          {excede && (
            <span className="flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 rounded-full px-2 py-0.5">
              <AlertTriangle className="h-3 w-3" />
              Supera el límite permitido
            </span>
          )}
        </div>

        <div className="grid grid-cols-3 divide-x divide-gray-100">
          <div className="flex flex-col gap-0.5 px-5 py-3.5">
            <span className="text-xs text-gray-500 font-medium">Máximo permitido</span>
            <span className="text-lg font-semibold tabular-nums text-gray-800">
              {fmtCop(Math.round(ventaMensual * limite))}
            </span>
            <span className="text-xs text-gray-400">
              {fmtPct(limite)} de {fmtCop(ventaMensual)} en ventas
            </span>
          </div>

          <div className="flex flex-col gap-0.5 px-5 py-3.5">
            <span className="text-xs text-gray-500 font-medium">Devoluciones este mes</span>
            <span className="text-lg font-semibold tabular-nums text-amber-500">
              {fmtPct(pctActual)}
            </span>
            <span className="text-xs text-gray-400">{fmtCop(devolucionesMes)} acumulado</span>
          </div>

          <div className="flex flex-col gap-0.5 px-5 py-3.5">
            <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5" />
              Con esta aprobación
            </span>
            <span
              className={`text-lg font-semibold tabular-nums ${
                excede ? "text-red-600" : "text-green-600"
              }`}
            >
              {fmtPct(pctTotal)}
            </span>
            <span className="text-xs text-gray-400">
              {excede
                ? `Supera en ${fmtPct(pctTotal - limite)}`
                : `Quedan ${fmtPct(limite - pctTotal)} disponibles`}
            </span>
          </div>
        </div>

        <div className="h-1 bg-gray-100 w-full">
          <div
            className={`h-full rounded-r-full transition-all ${excede ? "bg-red-400" : "bg-amber-400"}`}
            style={{ width: `${Math.min((pctTotal / limite) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Observations banner */}
      <div className="flex items-start justify-between gap-4 rounded-lg bg-[#e8e8f8] border border-[#c7c7ef] px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-[#3a3a8c] mb-0.5">Observaciones:</p>
          <p className="text-sm text-[#5a5aaa]">autorizado por el lab via correo</p>
        </div>
        <Button type="primary" style={{ backgroundColor: "#f97316" }} className="flex-shrink-0">
          Ver soportes
        </Button>
      </div>

      {/* Table toolbar */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-gray-500">
          {filtered.length} registro{filtered.length !== 1 ? "s" : ""}
        </span>
        <UiSearchInput placeholder="Buscar" onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      {/* Products table */}
      <div className="w-full overflow-x-auto">
        <Table<IApprovalProduct>
          rowKey="id"
          columns={productsColumns}
          dataSource={filtered}
          loading={isLoading}
          pagination={false}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys
          }}
          scroll={{ x: 800 }}
        />
      </div>

      {/* Footer: Aprobar */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-sm text-gray-500">
          Mostrando 1 a {filtered.length} de {filtered.length} registros
        </span>
        <div className="flex items-center gap-3">
          {approved ? (
            <span className="text-sm font-semibold text-green-600">Aprobado correctamente</span>
          ) : (
            <Button
              onClick={() => setApproved(true)}
              disabled={selectedRowKeys.length === 0}
              type="primary"
              size="large"
              style={{ backgroundColor: selectedRowKeys.length === 0 ? undefined : "#f97316" }}
            >
              Aprobar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
