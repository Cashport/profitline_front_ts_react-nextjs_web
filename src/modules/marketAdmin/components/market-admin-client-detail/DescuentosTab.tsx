"use client";

import { useState, useEffect } from "react";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Plus, Paperclip, Upload, Eye } from "lucide-react";
import ModalNuevaNegociacion from "@/modules/marketAdmin/components/market-admin-client-detail/ModalNuevaNegociacion";
import { type Negociacion } from "@/modules/marketAdmin/mocks/clientDetail";

type Props = {
  negociaciones: Negociacion[];
  onCreate: (nueva: Negociacion) => void;
};

const estadoBadgeClass = (estado: Negociacion["estado"]) =>
  estado === "Activo"
    ? "bg-[#E6F9E6] text-[#1A7A1A]"
    : estado === "En aprobación"
      ? "bg-[#FFF8E1] text-[#B45309]"
      : "bg-[#F0F0F0] text-[#666666]";

const headerCell = () => ({ style: { color: "#141414", fontWeight: 600 } });

export default function DescuentosTab({ negociaciones, onCreate }: Props) {
  const [tooltipNeg, setTooltipNeg] = useState<string | null>(null);
  const [showNegModal, setShowNegModal] = useState(false);

  useEffect(() => {
    if (!tooltipNeg) return;
    const close = () => setTooltipNeg(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [tooltipNeg]);

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

  return (
    <div>
      <div className="flex items-center justify-end mb-4">
        <button
          onClick={() => setShowNegModal(true)}
          className="flex items-center gap-1.5 text-sm font-semibold bg-[#CBE71E] text-[#141414] px-4 py-2 rounded-lg hover:bg-[#b8d11a] transition-colors"
        >
          <Plus size={14} /> Crear negociación
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
