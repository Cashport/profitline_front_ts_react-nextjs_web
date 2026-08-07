import type { ColumnsType } from "antd/es/table";
import { Button } from "antd";
import { IApproval, TipoAprobacion } from "@/types/reverseLogistics/IReverseLogistics";
import { CanalBadge } from "../CanalBadge/CanalBadge";
import { fmtCop, fmtNumber, parseFechaApproval } from "../../utils/format";

// AntD columns for the Aprobaciones list. `onSelect` receives the row's real
// Profit360 GUID so the caller can navigate to /logistica-inversa/aprobaciones/:id.
// The `guid` field is attached by AprobacionesList when mapping the Profit360
// payload — it lives alongside the legacy numeric `id` that AntD needs as rowKey.
export interface IApprovalRow extends IApproval {
  guid: string;
}

export const getApprovalsColumns = (
  onSelect: (guid: string, approval: IApprovalRow) => void
): ColumnsType<IApprovalRow> => [
  {
    title: "Fecha",
    dataIndex: "fecha",
    width: 110,
    render: (fecha: string) => {
      const { date, time } = parseFechaApproval(fecha);
      return (
        <div>
          <div className="text-sm text-gray-700">{date}</div>
          {time && <div className="text-xs text-gray-400 mt-0.5">{time}</div>}
        </div>
      );
    }
  },
  {
    title: "Cliente",
    dataIndex: "cliente",
    sorter: (a, b) => a.cliente.localeCompare(b.cliente),
    render: (_: unknown, record) => (
      <div className="max-w-[200px]">
        <div className="text-gray-900 text-sm leading-tight truncate" title={record.cliente}>
          {record.cliente}
        </div>
        <div className="text-xs text-gray-400 mt-0.5 truncate" title={record.codigoCliente}>
          {record.codigoCliente}
        </div>
      </div>
    )
  },
  {
    title: "Ciudad",
    dataIndex: "ciudad",
    width: 100,
    render: (ciudad: string) => <span className="text-sm text-gray-700">{ciudad}</span>
  },
  {
    title: "Canal / Línea",
    dataIndex: "canal",
    width: 110,
    render: (_: unknown, record) => (
      <div className="flex items-center gap-1">
        {record.canal && <CanalBadge label={record.canal} />}
        {record.linea && <CanalBadge label={record.linea} secondary />}
      </div>
    )
  },
  {
    title: "Tipo de Aprobación",
    dataIndex: "tiposAprobacion",
    width: 220,
    render: (tipos: TipoAprobacion[]) => (
      <ul className="space-y-0.5">
        {tipos.map((tipo) => (
          <li key={tipo} className="flex items-start gap-1.5 text-sm text-gray-700">
            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gray-400 flex-shrink-0" />
            <span className="leading-snug">{tipo}</span>
          </li>
        ))}
      </ul>
    )
  },
  {
    title: "Lotes",
    dataIndex: "lotesParaAprobar",
    width: 70,
    align: "center",
    render: (lotes: number) => <span className="text-sm text-gray-700">{lotes}</span>
  },
  {
    title: "Unid.",
    dataIndex: "unidades",
    width: 80,
    align: "right",
    sorter: (a, b) => a.unidades - b.unidades,
    render: (unidades: number) => <span className="text-sm text-gray-900">{fmtNumber(unidades)}</span>
  },
  {
    title: "Monto",
    dataIndex: "monto",
    width: 120,
    align: "right",
    sorter: (a, b) => a.monto - b.monto,
    render: (monto: number) => <span className="text-sm text-gray-900">{fmtCop(monto)}</span>
  },
  {
    title: "",
    dataIndex: "actions",
    width: 130,
    render: (_: unknown, record) => (
      <Button
        type="primary"
        size="small"
        style={{ backgroundColor: "#1a3a6b" }}
        onClick={() => onSelect(record.guid, record)}
      >
        Ir a Aprobar
      </Button>
    )
  }
];
