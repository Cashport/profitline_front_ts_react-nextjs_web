import type { ColumnsType } from "antd/es/table";
import { IApprovalProduct } from "@/types/reverseLogistics/IReverseLogistics";
import { fmtCop } from "../../utils/format";

function PoliticaBadge({ label, color }: { label: string; color: "green" | "orange" | "red" }) {
  const styles = {
    green: { bg: "#22c55e", text: "#fff" },
    orange: { bg: "#f97316", text: "#fff" },
    red: { bg: "#ef4444", text: "#fff" }
  };
  return (
    <span
      className="inline-block px-2 py-0.5 rounded text-xs font-semibold leading-snug"
      style={{ backgroundColor: styles[color].bg, color: styles[color].text }}
    >
      {label}
    </span>
  );
}

export const productsColumns: ColumnsType<IApprovalProduct> = [
  {
    title: "Producto",
    dataIndex: "nombre",
    render: (_: unknown, record) => (
      <div className="flex gap-3 items-start">
        <div className="h-14 w-14 rounded border border-gray-200 bg-gray-50 flex-shrink-0 flex items-center justify-center text-gray-300 text-xs">
          img
        </div>
        <div>
          <PoliticaBadge label={record.politica} color={record.politicaColor} />
          <p className="text-sm font-medium text-gray-900 mt-1">{record.nombre}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            EAN: {record.ean} · SKU: {record.sku}
          </p>
        </div>
      </div>
    )
  },
  {
    title: "Lote",
    dataIndex: "lote",
    width: 90,
    render: (lote: string) => <span className="text-sm text-gray-700">{lote}</span>
  },
  {
    title: "Fecha Vencimiento",
    dataIndex: "fechaVencimiento",
    width: 130,
    render: (fecha: string) => <span className="text-sm text-gray-700">{fecha}</span>
  },
  {
    title: "Unidades",
    dataIndex: "unidades",
    width: 90,
    align: "right",
    render: (unidades: number) => (
      <span className="text-sm text-gray-900 font-medium">{unidades}</span>
    )
  },
  {
    title: "Valor",
    dataIndex: "valor",
    width: 110,
    align: "right",
    render: (valor: number) => <span className="text-sm font-bold text-gray-900">{fmtCop(valor)}</span>
  },
  {
    title: "Documento",
    dataIndex: "documento",
    width: 100,
    render: (documento: string) => <span className="text-sm text-gray-700">{documento}</span>
  },
  {
    title: "Estado",
    dataIndex: "estado",
    render: (estado: string) => <span className="text-sm text-gray-600">{estado}</span>
  }
];
