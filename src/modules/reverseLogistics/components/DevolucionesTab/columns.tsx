"use client";

import { useRouter } from "next/navigation";
import type { ColumnsType } from "antd/es/table";
import { Check, Eye, FileText } from "lucide-react";
import { ReturnRow } from "@/types/reverseLogistics/IReverseLogistics";
import { CanalBadge } from "../CanalBadge/CanalBadge";
import { estadoConfig } from "../../constants";
import { fmtCop, fmtNumber, parseFechaReturn } from "../../utils/format";

// Per-row action buttons. Lives in its own component so it can use the
// `useRouter` hook for client-side navigation into the approval detail.
// `record.originalDev.IdDevolucion` doubles as the approval id — both
// endpoints surface the same GUID under different names.
function ActionsCell({ record }: { record: ReturnRow }) {
  const router = useRouter();

  const abrirDetalle = () => {
    const id = record.originalDev?.IdDevolucion;
    if (!id) return;
    router.push(`/logistica-inversa/aprobaciones/${id}`);
  };

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => record.pdfUrl && window.open(record.pdfUrl, "_blank")}
        aria-label="Ver PDF"
        className="h-7 w-7 flex items-center justify-center rounded-full border border-gray-200 text-red-400 hover:border-red-400 hover:text-red-600 transition-colors"
      >
        <FileText className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        aria-label="Ver detalle"
        onClick={abrirDetalle}
        className="h-7 w-7 flex items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:border-[#1a3a6b] hover:text-[#1a3a6b] transition-colors"
      >
        <Eye className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        aria-label="Aprobar devolución"
        onClick={abrirDetalle}
        disabled={!record.originalDev}
        className="h-7 w-7 flex items-center justify-center rounded-full border border-gray-200 text-green-600 hover:border-green-600 hover:bg-green-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Check className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// AntD columns for the Devoluciones table. The table is fed tree data (client groups
// with `children`), so each render handles both the group (aggregated) and leaf rows.
export const returnsColumns: ColumnsType<ReturnRow> = [
  {
    title: "Id",
    dataIndex: "idBoleto",
    width: 160,
    render: (_: unknown, record) =>
      record.isGroup ? (
        <span className="text-xs text-gray-400 font-normal whitespace-nowrap">
          {record.devCount} devs.
        </span>
      ) : (
        <span className="text-gray-900 text-sm whitespace-nowrap">{record.idBoleto}</span>
      )
  },
  {
    title: "Fecha",
    dataIndex: "fecha",
    width: 100,
    render: (_: unknown, record) => {
      const { date, time } = parseFechaReturn(record.fecha);
      return (
        <div>
          <div className="text-gray-700 text-sm">{date}</div>
          {!record.isGroup && time && <div className="text-gray-400 text-xs">{time}</div>}
        </div>
      );
    }
  },
  {
    title: "Cliente",
    dataIndex: "cliente",
    sorter: (a, b) => a.cliente.localeCompare(b.cliente),
    render: (_: unknown, record) => (
      <div className="max-w-[220px]">
        <div className="text-gray-900 text-sm leading-tight truncate" title={record.cliente}>
          {record.cliente}
        </div>
        {!record.isGroup && record.direccionCliente && (
          <div
            className="text-xs text-gray-400 leading-tight mt-0.5 truncate"
            title={record.direccionCliente}
          >
            {record.direccionCliente}
          </div>
        )}
      </div>
    )
  },
  {
    title: "Canal / Línea",
    dataIndex: "canal",
    width: 110,
    render: (_: unknown, record) => (
      <div className="flex items-center gap-1">
        {record.canal && <CanalBadge label={record.canal} />}
        {record.lineaNegocio && <CanalBadge label={record.lineaNegocio} secondary />}
      </div>
    )
  },
  {
    title: "Causal",
    dataIndex: "causal",
    width: 140,
    render: (_: unknown, record) =>
      record.isGroup ? null : (
        <span className="text-gray-700 text-sm" title={record.causal}>
          {record.causal}
        </span>
      )
  },
  {
    title: "Estado",
    dataIndex: "estado",
    width: 150,
    render: (_: unknown, record) => {
      const cs = record.calculatedStatus;
      const palette = cs ? { bg: cs.backgroundColor, text: cs.textColor } : undefined;
      const label = cs?.label;
      return cs ? (
        <span
          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs whitespace-nowrap"
          style={{ backgroundColor: palette!.bg, color: palette!.text }}
        >
          {label}
        </span>
      ) : (
        <></>
      );
    }
  },
  {
    title: "Unid.",
    dataIndex: "unidades",
    width: 90,
    align: "right",
    sorter: (a, b) => a.unidades - b.unidades,
    render: (unidades: number) => (
      <span className="text-gray-900 text-sm">{fmtNumber(unidades)}</span>
    )
  },
  {
    title: "Monto",
    dataIndex: "monto",
    width: 130,
    align: "right",
    sorter: (a, b) => a.monto - b.monto,
    render: (monto: number) => <span className="text-gray-900 text-sm">{fmtCop(monto)}</span>
  },
  {
    title: "",
    dataIndex: "actions",
    width: 110,
    // Group rows have no actions — only leaf devoluciones expose the
    // pdf / detail / approve buttons.
    render: (_: unknown, record) => (record.isGroup ? null : <ActionsCell record={record} />)
  }
];
