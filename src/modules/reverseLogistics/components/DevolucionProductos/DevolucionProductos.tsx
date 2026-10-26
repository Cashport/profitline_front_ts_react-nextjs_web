"use client";

import { useMemo } from "react";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { IProfit360DevolucionDocumento } from "@/types/reverseLogistics/IReverseLogistics";
import { fmtCop, fmtNumber } from "../../utils/format";

interface DevolucionProductosProps {
  datos: IProfit360DevolucionDocumento[];
  search: string;
  // Códigos abiertos; el padre maneja "Expandir todo".
  expandedKeys: string[];
  onChangeExpandedKeys: (keys: string[]) => void;
}

// Fila agrupada por código; sus hijas son cada documento / lote en que aparece.
interface FilaProducto {
  key: string;
  nombreProducto: string;
  codigo: string;
  cantidad: number;
  valorTotal: number;
  lotes?: number;
  documentos?: number;
  numeroDocumento?: string;
  lote?: string;
  fechaVencimiento?: string;
  children?: FilaProducto[];
}

const esHija = (fila: FilaProducto) => !fila.children;
// Las hijas usan la primera celda para "↳ Documento · Lote · Vence".
const ocultarEnHija = (fila: FilaProducto) => ({ colSpan: esHija(fila) ? 0 : 1 });

const columns: ColumnsType<FilaProducto> = [
  {
    title: "Producto",
    dataIndex: "nombreProducto",
    onCell: (fila) => ({ colSpan: esHija(fila) ? 4 : 1 }),
    render: (_: unknown, fila) =>
      esHija(fila) ? (
        <span className="text-xs text-gray-500">
          ↳ Documento <b className="font-semibold text-gray-900">{fila.numeroDocumento}</b>
          {` · Lote ${fila.lote} · Vence ${dayjs(fila.fechaVencimiento).format("DD/MM/YYYY")}`}
        </span>
      ) : (
        <span className="text-sm text-gray-900">{fila.nombreProducto}</span>
      )
  },
  { title: "Código", dataIndex: "codigo", width: 100, onCell: ocultarEnHija },
  { title: "Lotes", dataIndex: "lotes", width: 80, align: "right", onCell: ocultarEnHija },
  {
    title: "Documentos",
    dataIndex: "documentos",
    width: 110,
    align: "right",
    onCell: ocultarEnHija,
    render: (documentos: number) => `${documentos} ${documentos === 1 ? "doc." : "docs."}`
  },
  {
    title: "Cantidad",
    dataIndex: "cantidad",
    width: 100,
    align: "right",
    render: (cantidad: number) => fmtNumber(cantidad)
  },
  {
    title: "Valor total",
    dataIndex: "valorTotal",
    width: 130,
    align: "right",
    render: (valor: number) => <span className="font-semibold">{fmtCop(valor)}</span>
  }
];

// Pestaña "Por producto": los productos de todos los documentos agrupados por
// código, de mayor a menor valor.
export function DevolucionProductos({
  datos,
  search,
  expandedKeys,
  onChangeExpandedKeys
}: DevolucionProductosProps) {
  const q = search.trim().toLowerCase();

  const filas = useMemo(() => {
    const grupos = new Map<string, FilaProducto & { children: FilaProducto[] }>();
    datos.forEach((doc) =>
      doc.data.forEach((p) => {
        const coincide = [doc.numeroDocumento, p.nombreProducto, p.codigo, p.lote].some((v) =>
          v.toLowerCase().includes(q)
        );
        if (q && !coincide) return;
        const grupo = grupos.get(p.codigo) ?? {
          key: p.codigo,
          nombreProducto: p.nombreProducto,
          codigo: p.codigo,
          cantidad: 0,
          valorTotal: 0,
          children: []
        };
        grupo.cantidad += p.cantidadProdXDoc;
        grupo.valorTotal += p.valorTotal;
        grupo.children.push({
          key: p.idProductoxDocumento,
          nombreProducto: p.nombreProducto,
          codigo: p.codigo,
          cantidad: p.cantidadProdXDoc,
          valorTotal: p.valorTotal,
          numeroDocumento: doc.numeroDocumento,
          lote: p.lote,
          fechaVencimiento: p.fechaVencimiento
        });
        grupos.set(p.codigo, grupo);
      })
    );
    return Array.from(grupos.values())
      .map((grupo) => ({
        ...grupo,
        lotes: new Set(grupo.children.map((h) => h.lote)).size,
        documentos: new Set(grupo.children.map((h) => h.numeroDocumento)).size
      }))
      .sort((a, b) => b.valorTotal - a.valorTotal);
  }, [datos, q]);

  return (
    <div className="w-full overflow-x-auto">
      <Table
        rowKey="key"
        columns={columns}
        dataSource={filas}
        pagination={false}
        size="small"
        scroll={{ x: 760 }}
        expandable={{
          expandedRowKeys: expandedKeys,
          onExpandedRowsChange: (keys) => onChangeExpandedKeys(keys.map(String))
        }}
        locale={{
          emptyText: q ? `Sin resultados para “${search.trim()}”` : "Sin productos"
        }}
      />
    </div>
  );
}
