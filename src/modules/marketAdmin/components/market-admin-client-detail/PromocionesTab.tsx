"use client";

import { useState, useEffect } from "react";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Plus, Paperclip, Upload, Eye } from "lucide-react";
import ModalNuevaNegociacion from "@/modules/marketAdmin/components/market-admin-client-detail/ModalNuevaNegociacion";
import ModalCrearDescuento from "@/modules/marketAdmin/components/market-admin-client-detail/ModalCrearDescuento";
import { ESTADO_CONFIG } from "@/modules/marketAdmin/components/MarketAdminManualBonus/estadoConfig";
import {
  BLANK_BONIF,
  PRODUCTOS_BONIFICADOS_LIST,
  type BonifManual,
  type Negociacion
} from "@/modules/marketAdmin/mocks/clientDetail";

type Props = {
  negociaciones: Negociacion[];
  onCreate: (nueva: Negociacion) => void;
  bonificados: BonifManual[];
  onCreateBonificado: (nuevo: Omit<BonifManual, "id" | "estado" | "creadoEn">) => void;
};

const estadoBadgeClass = (estado: Negociacion["estado"]) =>
  estado === "Activo"
    ? "bg-[#E6F9E6] text-[#1A7A1A]"
    : estado === "En aprobación"
      ? "bg-[#FFF8E1] text-[#B45309]"
      : "bg-[#F0F0F0] text-[#666666]";

const headerCell = () => ({ style: { color: "#141414", fontWeight: 600 } });

export default function PromocionesTab({
  negociaciones,
  onCreate,
  bonificados,
  onCreateBonificado
}: Props) {
  const [tooltipNeg, setTooltipNeg] = useState<string | null>(null);
  const [showCrearModal, setShowCrearModal] = useState(false);
  const [showNegModal, setShowNegModal] = useState(false);
  const [bonifForm, setBonifForm] = useState(BLANK_BONIF);

  useEffect(() => {
    if (!tooltipNeg) return;
    const close = () => setTooltipNeg(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [tooltipNeg]);

  const saveBonif = () => {
    onCreateBonificado({
      producto: bonifForm.producto,
      unidades: bonifForm.unidades,
      nota: bonifForm.nota
    });
    setBonifForm(BLANK_BONIF);
  };

  const columns: ColumnsType<Negociacion> = [
    {
      title: "Nombre",
      dataIndex: "nombre",
      key: "nombre",
      onHeaderCell: headerCell,
      render: (nombre: string) => <span className="text-sm text-[#C07A00] truncate">{nombre}</span>
    },
    {
      title: "Creado por",
      dataIndex: "creadoPor",
      key: "creadoPor",
      width: 140,
      onHeaderCell: headerCell,
      render: (v: string) => <span className="text-sm text-[#141414] truncate">{v}</span>
    },
    {
      title: "Creación",
      dataIndex: "fechaCreacion",
      key: "fechaCreacion",
      width: 120,
      onHeaderCell: headerCell,
      render: (v: string) => <span className="text-sm text-[#141414]">{v}</span>
    },
    {
      title: "Vencimiento",
      dataIndex: "fechaVencimiento",
      key: "fechaVencimiento",
      width: 120,
      onHeaderCell: headerCell,
      render: (v: string) => <span className="text-sm text-[#141414]">{v || "—"}</span>
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      width: 140,
      onHeaderCell: headerCell,
      render: (estado: Negociacion["estado"]) => (
        <span
          className={`text-[11px] font-semibold px-2.5 py-1 rounded-full w-fit ${estadoBadgeClass(estado)}`}
        >
          {estado}
        </span>
      )
    },
    {
      title: "Adjunto",
      key: "adjunto",
      width: 90,
      onHeaderCell: headerCell,
      render: (_, n) => (
        <div className="flex items-center gap-1">
          <button
            title="Subir adjunto"
            className="w-7 h-7 flex items-center justify-center border border-[#DDDDDD] rounded-md text-[#666666] hover:border-[#141414] hover:text-[#141414] transition-colors"
          >
            <Upload size={13} />
          </button>
          {/* Eye — opens detail tooltip */}
          <div className="relative">
            <button
              title="Ver detalle"
              onClick={(e) => {
                e.stopPropagation();
                setTooltipNeg(tooltipNeg === n.id ? null : n.id);
              }}
              className={`w-7 h-7 flex items-center justify-center border rounded-md transition-colors ${
                tooltipNeg === n.id
                  ? "border-[#141414] bg-[#141414] text-white"
                  : "border-[#DDDDDD] text-[#666666] hover:border-[#141414] hover:text-[#141414]"
              }`}
            >
              <Eye size={13} />
            </button>

            {/* Tooltip popover — opens to the left */}
            {tooltipNeg === n.id && (
              <div
                className="absolute right-9 top-1/2 -translate-y-1/2 z-20 w-64 bg-white border border-[#E0E0E0] rounded-xl shadow-xl p-4"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Arrow pointing right */}
                <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-r border-t border-[#E0E0E0] rotate-45" />
                <p className="text-xs font-bold text-[#141414] mb-3 truncate">{n.nombre}</p>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between gap-2">
                    <span className="text-xs text-[#999999]">Creación</span>
                    <span className="text-xs font-medium text-[#141414]">{n.fechaCreacion}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-xs text-[#999999]">Vencimiento</span>
                    <span className="text-xs font-medium text-[#141414]">
                      {n.fechaVencimiento || "—"}
                    </span>
                  </div>
                  <div className="h-px bg-[#F0F0F0] my-0.5" />
                  <div className="flex justify-between gap-2">
                    <span className="text-xs text-[#999999]">Autorizado por</span>
                    <span className="text-xs font-medium text-[#141414]">
                      {n.autorizadoPor ?? "—"}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2 items-center">
                    <span className="text-xs text-[#999999]">Estado</span>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${estadoBadgeClass(n.estado)}`}
                    >
                      {n.estado}
                    </span>
                  </div>
                  {n.adjunto && (
                    <>
                      <div className="h-px bg-[#F0F0F0] my-0.5" />
                      <div className="flex items-center gap-1.5">
                        <Paperclip size={11} className="text-[#AAAAAA]" />
                        <span className="text-xs text-[#666666] truncate">{n.adjunto}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )
    }
  ];

  const bonifColumns: ColumnsType<BonifManual> = [
    {
      title: "Producto",
      dataIndex: "producto",
      key: "producto",
      onHeaderCell: headerCell,
      render: (v: string) => <span className="text-sm text-[#141414] truncate">{v}</span>
    },
    {
      title: "Unidades",
      dataIndex: "unidades",
      key: "unidades",
      width: 100,
      onHeaderCell: headerCell,
      render: (v: number) => <span className="text-sm text-[#141414]">{v}</span>
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      width: 120,
      onHeaderCell: headerCell,
      render: (estado: BonifManual["estado"]) => (
        <span
          className={`px-2 py-1 text-[11px] font-semibold rounded-lg w-fit ${ESTADO_CONFIG[estado].className}`}
        >
          {ESTADO_CONFIG[estado].label}
        </span>
      )
    },
    {
      title: "Fecha",
      dataIndex: "creadoEn",
      key: "creadoEn",
      width: 120,
      onHeaderCell: headerCell,
      render: (v: string) => <span className="text-sm text-[#141414]">{v}</span>
    },
    {
      title: "Nota",
      dataIndex: "nota",
      key: "nota",
      onHeaderCell: headerCell,
      render: (v: string) => <span className="text-sm text-[#999999] truncate">{v || "—"}</span>
    }
  ];

  return (
    <div>
      <div className="flex items-center justify-end mb-4">
        <button
          onClick={() => setShowCrearModal(true)}
          className="flex items-center gap-1.5 text-sm font-semibold bg-[#CBE71E] text-[#141414] px-4 py-2 rounded-lg hover:bg-[#b8d11a] transition-colors"
        >
          <Plus size={14} /> Crear descuento
        </button>
      </div>

      {/* NOTE: no `scroll` prop — its overflow wrappers would clip the adjunto popover */}
      <Table
        columns={columns}
        dataSource={negociaciones}
        rowKey="id"
        pagination={false}
        locale={{ emptyText: "No hay negociaciones creadas aún." }}
      />

      {/* ── Bonificados manuales ── */}
      <div className="mt-8">
        <p className="text-sm font-bold text-[#141414] mb-4">Bonificados manuales</p>

        <div className="border border-[#E8E8E8] rounded-xl overflow-hidden mb-4">
          <div className="bg-[#FAFAFA] px-4 py-3 border-b border-[#EEEEEE]">
            <p className="text-xs font-semibold text-[#141414]">Nueva asignación</p>
          </div>
          <div className="p-4 grid grid-cols-[2fr_80px_1fr_auto] gap-3 items-end">
            <div>
              <label className="text-xs font-medium text-[#666666] block mb-1">
                Producto bonificado
              </label>
              <select
                value={bonifForm.producto}
                onChange={(e) => setBonifForm((f) => ({ ...f, producto: e.target.value }))}
                className="w-full text-sm border border-[#DDDDDD] rounded-lg px-3 py-2 bg-white outline-none focus:border-[#141414] transition-colors"
              >
                {PRODUCTOS_BONIFICADOS_LIST.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-[#666666] block mb-1">Unidades</label>
              <input
                type="number"
                min={1}
                value={bonifForm.unidades}
                onChange={(e) =>
                  setBonifForm((f) => ({ ...f, unidades: parseInt(e.target.value) || 1 }))
                }
                className="w-full text-sm border border-[#DDDDDD] rounded-lg px-3 py-2 bg-white outline-none focus:border-[#141414] transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[#666666] block mb-1">
                Nota interna (opcional)
              </label>
              <input
                type="text"
                placeholder="Motivo..."
                value={bonifForm.nota}
                onChange={(e) => setBonifForm((f) => ({ ...f, nota: e.target.value }))}
                className="w-full text-sm border border-[#DDDDDD] rounded-lg px-3 py-2 bg-white outline-none focus:border-[#141414] transition-colors"
              />
            </div>
            <button
              onClick={saveBonif}
              className="text-sm font-semibold bg-[#CBE71E] text-[#141414] px-4 py-2 rounded-lg hover:bg-[#b8d11a] transition-colors whitespace-nowrap"
            >
              Enviar a aprobación
            </button>
          </div>
        </div>

        {bonificados.length > 0 && (
          <div className="border border-[#E8E8E8] rounded-xl overflow-hidden">
            <Table columns={bonifColumns} dataSource={bonificados} rowKey="id" pagination={false} />
          </div>
        )}
      </div>

      <ModalCrearDescuento
        open={showCrearModal}
        onClose={() => setShowCrearModal(false)}
        onSelectPromocion={() => {
          setShowCrearModal(false);
          setShowNegModal(true);
        }}
      />

      {showNegModal && (
        <ModalNuevaNegociacion
          onClose={() => setShowNegModal(false)}
          onSubmit={(nueva) => {
            onCreate(nueva);
            setShowNegModal(false);
          }}
        />
      )}
    </div>
  );
}
