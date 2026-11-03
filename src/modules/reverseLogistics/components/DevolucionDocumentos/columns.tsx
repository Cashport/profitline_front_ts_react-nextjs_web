"use client";

import type { ColumnsType } from "antd/es/table";
import { Input, InputNumber } from "antd";
import dayjs from "dayjs";
import { X } from "lucide-react";
import { IProfit360DevolucionProducto } from "@/types/reverseLogistics/IReverseLogistics";
import { fmtCop, fmtNumber } from "../../utils/format";

interface LineasColumnsParams {
  editing: boolean;
  // Falso en el último producto del documento: el API no elimina documentos y
  // "Agregar producto" completa la fila nueva con otra del mismo documento.
  canRemove: boolean;
  onChange: (idProductoxDocumento: string, cambios: Partial<IProfit360DevolucionProducto>) => void;
  onRemove: (idProductoxDocumento: string) => void;
}

// Productos de un documento. En edición cantidad, valor unitario y observación
// son editables (cambios `unidad`, `valor` y `observacionProducto`) y cada fila
// se puede quitar (`eliminar`).
export const getLineasColumns = ({
  editing,
  canRemove,
  onChange,
  onRemove
}: LineasColumnsParams): ColumnsType<IProfit360DevolucionProducto> => [
  {
    title: "Producto",
    dataIndex: "nombreProducto",
    render: (nombre: string) => <span className="text-sm text-gray-900">{nombre}</span>
  },
  { title: "Código", dataIndex: "codigo", width: 100 },
  { title: "Lote", dataIndex: "lote", width: 110 },
  {
    title: "Vencimiento",
    dataIndex: "fechaVencimiento",
    width: 120,
    render: (fecha: string) => dayjs(fecha).format("DD/MM/YYYY")
  },
  {
    title: "Cant.",
    dataIndex: "cantidadProdXDoc",
    width: 100,
    align: "right",
    render: (cantidad: number, record) =>
      editing ? (
        <InputNumber
          size="small"
          min={1}
          value={cantidad}
          status={cantidad > 0 ? undefined : "error"}
          onChange={(value) =>
            onChange(record.idProductoxDocumento, { cantidadProdXDoc: value ?? 0 })
          }
          className="w-20"
        />
      ) : (
        fmtNumber(cantidad)
      )
  },
  {
    title: "Valor unitario",
    dataIndex: "precioUnitario",
    width: 140,
    align: "right",
    render: (precio: number, record) =>
      editing ? (
        <InputNumber
          size="small"
          min={0}
          value={precio}
          onChange={(value) =>
            onChange(record.idProductoxDocumento, { precioUnitario: value ?? 0 })
          }
          className="w-28"
        />
      ) : (
        fmtCop(precio)
      )
  },
  {
    title: "Valor total",
    dataIndex: "valorTotal",
    width: 130,
    align: "right",
    render: (valor: number) => <span className="font-semibold">{fmtCop(valor)}</span>
  },
  {
    title: "Observación",
    dataIndex: "observacionProducto",
    render: (observacion: string, record) =>
      editing ? (
        <Input
          size="small"
          value={observacion}
          placeholder="—"
          onChange={(e) =>
            onChange(record.idProductoxDocumento, { observacionProducto: e.target.value })
          }
        />
      ) : (
        observacion || <span className="text-gray-300">—</span>
      )
  },
  ...(editing
    ? [
        {
          title: "",
          key: "acciones",
          width: 48,
          render: (_: unknown, record: IProfit360DevolucionProducto) => (
            <button
              type="button"
              aria-label="Eliminar producto"
              title={
                canRemove
                  ? "Eliminar producto"
                  : "El documento debe conservar al menos un producto"
              }
              disabled={!canRemove}
              onClick={() => onRemove(record.idProductoxDocumento)}
              className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 transition-colors enabled:hover:bg-[#fde8ef] enabled:hover:text-[#e0007a] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <X className="h-4 w-4" />
            </button>
          )
        }
      ]
    : [])
];
