"use client";

import { useRouter } from "next/navigation";
import type { ColumnsType } from "antd/es/table";
import { Check, Eye, FileText } from "lucide-react";
import { ReturnRow } from "@/types/reverseLogistics/IReverseLogistics";
import { CanalBadge } from "../CanalBadge/CanalBadge";
import { CausalBadge } from "../CausalBadge/CausalBadge";
import { fmtCop, fmtNumber, parseFechaReturn } from "../../utils/format";

// Per-row action buttons. Lives in its own component so it can use the
// `useRouter` hook for client-side navigation into the approval detail.
// `record.originalDev.IdDevolucion` doubles as the approval id — both
// endpoints surface the same GUID under different names.
function ActionsCell({ record }: { record: ReturnRow }) {
  return (
    <div className="flex items-center gap-1">
      {record.pdfUrl ? (
        <button
          type="button"
          onClick={() => record.pdfUrl && window.open(record.pdfUrl, "_blank")}
          aria-label="Ver PDF"
          className="h-7 w-7 flex items-center justify-center rounded-full border border-gray-200 text-red-400 hover:border-red-400 hover:text-red-600 transition-colors"
        >
          <FileText className="h-3.5 w-3.5" />
        </button>
      ) : null}
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
      <div className="break-words">
        <div className="text-gray-900 text-sm" title={record.cliente}>
          {record.cliente}
        </div>
        {!record.isGroup && record.direccionCliente && (
          <div className="text-xs text-gray-400 mt-0.5" title={record.direccionCliente}>
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
    dataIndex: "causales",
    width: 180,
    // Group rows carry the distinct causales of their children, so both group
    // and leaf rows render the same way.
    render: (_: unknown, record) => (
      <div className="flex flex-wrap gap-1">
        {(record.causales ?? []).map((c) => (
          <CausalBadge key={c.Id || c.causal} label={c.causal} rgb={c.RGB} />
        ))}
      </div>
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
    render: (_: unknown, record) => (record.devCount > 0 ? <ActionsCell record={record} /> : null)
  }
];
