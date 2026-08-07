"use client";

import { useMemo, useState } from "react";
import type { Key } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import dayjs from "dayjs";
import { Button, Modal, Table } from "antd";
import { ChevronLeft, AlertTriangle, TrendingUp } from "lucide-react";
import UiSearchInput from "@/components/ui/search-input/search-input";
import {
  IApprovalProduct,
  IProfit360ApprovalResumen,
  IProfit360Documento
} from "@/types/reverseLogistics/IReverseLogistics";
import { getProfit360ApprovalResumen } from "@/services/reverseLogistics/reverseLogistics";
import { fmtCop, fmtPct } from "../../utils/format";
import { productsColumns } from "../../components/AprobacionDetalle/columns";

interface AprobacionResumenViewProps {
  id: string;
}

// Maps the Profit360 hex color (e.g. "#7ED961") to one of the three badge
// palettes used by the products table.
function hexToBadgeColor(hex: string): "green" | "orange" | "red" {
  const cleaned = hex.replace("#", "").toLowerCase();
  const r = parseInt(cleaned.slice(0, 2), 16);
  const g = parseInt(cleaned.slice(2, 4), 16);
  const b = parseInt(cleaned.slice(4, 6), 16);
  if (g > r && g > b) return "green";
  if (r > g && r > b && g > 100) return "orange";
  return "red";
}

const mapDocumentoToProduct = (doc: IProfit360Documento): IApprovalProduct => ({
  id: doc.id,
  nombre: doc.descripcionProducto,
  ean: doc.ean,
  sku: doc.sku,
  imageUrl: doc.fotoProducto ?? undefined,
  politica: doc.descripcionBloqueo,
  politicaColor: hexToBadgeColor(doc.colorBloqueo),
  lote: doc.lote,
  fechaVencimiento: doc.fechaLote ? dayjs(doc.fechaLote).format("DD/MM/YYYY") : "",
  unidades: doc.unidadesProductoxDocumento,
  valor: doc.valor,
  documento: doc.numeroDocumento,
  estado: doc.descripcionEstadoProductoxDocumento
});

// Extracts the first causal name from the Profit360 `causales` JSON blob
// (e.g. {"Causales":[{"causal":"Expirado","RGB":"E60096"}]}). Falls back to
// the literal string when parsing fails.
function firstCausal(causales: string | null | undefined): string {
  if (!causales) return "—";
  try {
    const parsed = JSON.parse(causales);
    const list: { causal?: string }[] = parsed?.Causales ?? [];
    return list[0]?.causal ?? "—";
  } catch {
    return "—";
  }
}

// Strips the `(NN-foo)` qualifier from a causal label so the purple pill shows
// only the short name (e.g. "01-vencimiento" → "01-vencimiento", but if the
// string comes as "Fuera de politicas por fecha (01-vencimiento)" we keep the
// short form when present).
function shortCausal(causal: string): string {
  const match = causal.match(/\(([^)]+)\)/);
  return match ? match[1] : causal;
}

// Renders the full approval detail backed by
// GET /integration/profit360/approvals/{id}/resumen. Layout mirrors the legacy
// AprobacionDetalle so the user doesn't notice the URL change — only the data
// source moved from the mock to the real Profit360 endpoint.
export function AprobacionResumenView({ id }: AprobacionResumenViewProps) {
  const router = useRouter();

  const { data, isLoading } = useSWR(
    ["reverse-logistics/profit360-approval-resumen", id],
    () => getProfit360ApprovalResumen(id),
    { revalidateOnFocus: false }
  );
  const resumen: IProfit360ApprovalResumen | undefined = data?.data;

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const [approved, setApproved] = useState(false);
  const [soportesOpen, setSoportesOpen] = useState(false);

  const products = useMemo<IApprovalProduct[]>(
    () => (resumen?.documentos ?? []).map(mapDocumentoToProduct),
    [resumen]
  );

  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.lote.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [products, searchTerm]
  );

  // Totals derived from the documents array (matches the legacy "Valor del
  // Documento" / "Unidades Documentos / Registradas" rows).
  const totalUnidades = products.reduce((acc, p) => acc + p.unidades, 0);
  const totalValor = products.reduce((acc, p) => acc + p.valor, 0);

  // Rule values — falls back to the legacy mock defaults while loading so the
  // 3 cards keep their proportions.
  const regla = resumen?.reglaDevoluciones;
  const ventaMensual = regla?.ventasMensualesBase ?? 30000000;
  const devolucionesMes = regla?.devolucionesEsteMes.valorAcumulado ?? 1250000;
  const limitePct = regla ? regla.porcentajeLimite / 100 : 0.05;
  const excede = regla?.superaLimitePermitido ?? false;
  const pctTotal = regla ? regla.conEstaAprobacion.porcentaje / 100 : 0;

  const causalLabel = shortCausal(firstCausal(resumen?.causales));

  return (
    <div className="px-5 py-4 space-y-4">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-900">Aprobación de Lotes</h2>
        <Button
          onClick={() => router.push("/logistica-inversa/aprobaciones")}
          type="primary"
          icon={<ChevronLeft className="h-3.5 w-3.5" />}
          style={{ backgroundColor: "#22a86a" }}
        >
          Regresar
        </Button>
      </div>

      {/* Client info grid — same labels as AprobacionDetalle */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 text-sm text-gray-700">
        <div>
          <span className="font-medium">Cliente:</span> {resumen?.cliente ?? "—"}
        </div>
        <div>
          <span className="font-medium">Código Cliente:</span> {resumen?.codigoCliente ?? "—"}
        </div>
        <div>
          <span className="font-medium">Línea de Negocio:</span> {resumen?.lineaNegocio ?? "—"}
        </div>
        <div>
          <span className="font-medium">Valor del Documento:</span> {fmtCop(totalValor)}
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium">Causal Devolución:</span>
          <span
            className="inline-block px-2 py-0.5 rounded text-xs font-semibold text-white"
            style={{ backgroundColor: "#9333ea" }}
          >
            {causalLabel}
          </span>
        </div>
        <div>
          <span className="font-medium">Unidades Documentos:</span> {totalUnidades}
        </div>
        <div>
          <span className="font-medium">Unidades Registradas:</span> {totalUnidades}
        </div>
      </div>

      {/* Regla 5% — 3 cards */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
          <span className="text-xs font-medium text-gray-500">
            {regla?.reglaDescripcion ?? "Regla devoluciones / venta mensual — límite 5,00%"}
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
              {fmtCop(Math.round(ventaMensual * limitePct))}
            </span>
            <span className="text-xs text-gray-400">
              {fmtPct(limitePct)} de {fmtCop(ventaMensual)} en ventas
            </span>
          </div>

          <div className="flex flex-col gap-0.5 px-5 py-3.5">
            <span className="text-xs text-gray-500 font-medium">Devoluciones este mes</span>
            <span className="text-lg font-semibold tabular-nums text-amber-500">
              {fmtPct(devolucionesMes / ventaMensual)}
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
                ? `Supera en ${fmtPct(pctTotal - limitePct)}`
                : `Quedan ${fmtPct(limitePct - pctTotal)} disponibles`}
            </span>
          </div>
        </div>

        <div className="h-1 bg-gray-100 w-full">
          <div
            className={`h-full rounded-r-full transition-all ${excede ? "bg-red-400" : "bg-amber-400"}`}
            style={{ width: `${Math.min((pctTotal / limitePct) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Observations banner — keeps the legacy purple styling */}
      <div className="flex items-start justify-between gap-4 rounded-lg bg-[#e8e8f8] border border-[#c7c7ef] px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-[#3a3a8c] mb-0.5">Observaciones:</p>
          <p className="text-sm text-[#5a5aaa]">
            {resumen?.observacionAprobacion || "autorizado por el lab via correo"}
          </p>
        </div>
        <Button
          type="primary"
          style={{ backgroundColor: "#f97316" }}
          className="flex-shrink-0"
          onClick={() => setSoportesOpen(true)}
          disabled={!resumen?.fotosAprobacion}
        >
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

      {/* Soportes preview — opens the approval photo from `fotosAprobacion`. */}
      <Modal
        title="Soportes de la aprobación"
        open={soportesOpen}
        onCancel={() => setSoportesOpen(false)}
        footer={null}
        width="auto"
        centered
        destroyOnClose
      >
        {resumen?.fotosAprobacion ? (
          <a
            href={resumen.fotosAprobacion}
            target="_blank"
            rel="noopener noreferrer"
            title="Abrir en pestaña nueva"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={resumen.fotosAprobacion}
              alt="Soporte de aprobación"
              style={{
                maxWidth: "80vw",
                maxHeight: "80vh",
                display: "block",
                margin: "0 auto"
              }}
            />
          </a>
        ) : (
          <p className="text-sm text-gray-500 m-0">No hay soportes adjuntos.</p>
        )}
      </Modal>
    </div>
  );
}