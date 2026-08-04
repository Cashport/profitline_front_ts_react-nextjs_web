import type { ColumnsType } from "antd/es/table";
import { Eye, FileText } from "lucide-react";
import { EstadoDevolucion } from "@/types/reverseLogistics/IReverseLogistics";
import { CanalBadge } from "../CanalBadge/CanalBadge";
import { estadoConfig } from "../../constants";
import { fmtCop, fmtNumber, parseFechaReturn } from "../../utils/format";
import { ReturnRow } from "../../utils/grouping";

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
    render: (estado: EstadoDevolucion) => (
      <span
        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs whitespace-nowrap"
        style={{ backgroundColor: estadoConfig[estado].bg, color: estadoConfig[estado].text }}
      >
        {estado}
      </span>
    )
  },
  {
    title: "Unid.",
    dataIndex: "unidades",
    width: 90,
    align: "right",
    sorter: (a, b) => a.unidades - b.unidades,
    render: (unidades: number) => <span className="text-gray-900 text-sm">{fmtNumber(unidades)}</span>
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
    width: 80,
    render: (_: unknown, record) =>
      record.isGroup ? null : (
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
            className="h-7 w-7 flex items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:border-[#1a3a6b] hover:text-[#1a3a6b] transition-colors"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
        </div>
      )
  }
];
