"use client";

import { MouseEvent, useState } from "react";
import { Table } from "antd";
import dayjs from "dayjs";
import { AlertTriangle, Pencil, Plus } from "lucide-react";
import GenericCollapse from "@/components/ui/collapse";
import {
  IProfit360DevolucionCatalogoProducto,
  IProfit360DevolucionDocumento,
  IProfit360DevolucionLote,
  IProfit360DevolucionProducto
} from "@/types/reverseLogistics/IReverseLogistics";
import { DevolucionFotos } from "../DevolucionFotos/DevolucionFotos";
import { ModalAgregarProducto } from "../ModalAgregarProducto/ModalAgregarProducto";
import { ModalEditarDocumento } from "../ModalEditarDocumento/ModalEditarDocumento";
import { fmtCop, fmtNumber } from "../../utils/format";
import { getLineasColumns } from "./columns";

interface DevolucionDocumentosProps {
  datos: IProfit360DevolucionDocumento[];
  // Filtra las filas visibles por documento, producto, código o lote.
  search: string;
  editing: boolean;
  // Documentos abiertos (`idDocumentoXDevolucion`); el padre maneja "Expandir todo".
  activeKeys: string[];
  onChangeActiveKeys: (keys: string[]) => void;
  // Error de validación por `idDocumentoXDevolucion` (solo en edición).
  errores: Record<string, string>;
  productos: IProfit360DevolucionCatalogoProducto[];
  lotes: IProfit360DevolucionLote[];
  onChangeDatos: (datos: IProfit360DevolucionDocumento[]) => void;
}

const stop = (e: MouseEvent) => e.stopPropagation();

// Diferencia entre lo que registra el documento y la suma de sus productos.
const descuadre = (doc: IProfit360DevolucionDocumento) => {
  const unidades = doc.data.reduce((acc, p) => acc + p.cantidadProdXDoc, 0);
  const valor = doc.data.reduce((acc, p) => acc + p.valorTotal, 0);
  const difUnidades = doc.unidades - unidades;
  const difValor = doc.monto - valor;
  if (!difUnidades && Math.abs(difValor) < 1) return null;
  return {
    texto: `Los productos suman ${fmtCop(valor)} · ${fmtNumber(unidades)} unid. y el documento registra ${fmtCop(doc.monto)} · ${fmtNumber(doc.unidades)} unid.`,
    diferencia: [
      Math.abs(difValor) >= 1
        ? `valor ${difValor > 0 ? "faltan" : "sobran"} ${fmtCop(Math.abs(difValor))}`
        : "",
      difUnidades
        ? `unidades ${difUnidades > 0 ? "faltan" : "sobran"} ${fmtNumber(Math.abs(difUnidades))}`
        : ""
    ]
      .filter(Boolean)
      .join(" · ")
  };
};

// Pestaña "Por documento": cada documento del cliente con sus productos. En
// edición se editan los campos del documento (modal) y sus productos (tabla).
export function DevolucionDocumentos({
  datos,
  search,
  editing,
  activeKeys,
  onChangeActiveKeys,
  errores,
  productos,
  lotes,
  onChangeDatos
}: DevolucionDocumentosProps) {
  const [docEditando, setDocEditando] = useState<IProfit360DevolucionDocumento | null>(null);
  const [docAgregando, setDocAgregando] = useState<string | null>(null);

  const q = search.trim().toLowerCase();

  const actualizarDocumento = (
    idDocumento: string,
    fn: (doc: IProfit360DevolucionDocumento) => IProfit360DevolucionDocumento
  ) => onChangeDatos(datos.map((d) => (d.idDocumentoXDevolucion === idDocumento ? fn(d) : d)));

  const cambiarProducto = (
    idDocumento: string,
    idProductoxDocumento: string,
    cambios: Partial<IProfit360DevolucionProducto>
  ) =>
    actualizarDocumento(idDocumento, (doc) => ({
      ...doc,
      data: doc.data.map((p) => {
        if (p.idProductoxDocumento !== idProductoxDocumento) return p;
        const next = { ...p, ...cambios };
        if ("cantidadProdXDoc" in cambios || "precioUnitario" in cambios) {
          // Total local mientras se edita; el backend lo recalcula al guardar.
          next.subtotal = next.cantidadProdXDoc * next.precioUnitario;
          next.valorTotal = next.subtotal + next.valorIva;
        }
        return next;
      })
    }));

  const items = datos.flatMap((doc) => {
    const coincide = (p: IProfit360DevolucionProducto) =>
      [doc.numeroDocumento, p.nombreProducto, p.codigo, p.lote].some((v) =>
        v.toLowerCase().includes(q)
      );
    const lineas = q ? doc.data.filter(coincide) : doc.data;
    if (q && !lineas.length) return [];

    const alerta = descuadre(doc);
    const error = errores[doc.idDocumentoXDevolucion];
    const columns = getLineasColumns({
      editing,
      canRemove: doc.data.length > 1,
      onChange: (idProductoxDocumento, cambios) =>
        cambiarProducto(doc.idDocumentoXDevolucion, idProductoxDocumento, cambios),
      onRemove: (idProductoxDocumento) =>
        actualizarDocumento(doc.idDocumentoXDevolucion, (d) => ({
          ...d,
          data: d.data.filter((p) => p.idProductoxDocumento !== idProductoxDocumento)
        }))
    });

    return [
      {
        key: doc.idDocumentoXDevolucion,
        label: (
          <div className="flex w-full flex-wrap items-center justify-between gap-x-5 gap-y-1.5">
            <span className="flex items-center gap-2.5">
              <span className="text-sm font-semibold text-gray-900">
                Documento {doc.numeroDocumento || "sin número"}
              </span>
              <span className="text-xs text-gray-500">
                {dayjs(doc.fechaDocumento).format("DD/MM/YYYY")}
              </span>
              {editing ? (
                <button
                  type="button"
                  aria-label="Editar documento"
                  title="Editar documento"
                  onClick={(e) => {
                    stop(e);
                    setDocEditando(doc);
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </span>
            <span className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
              <span className="text-gray-500">
                {doc.data.length} {doc.data.length === 1 ? "producto" : "productos"}
              </span>
              <span>
                <b className="font-semibold">{fmtNumber(doc.unidades)}</b>{" "}
                <span className="text-gray-500">unid.</span>
              </span>
              <span className="min-w-[96px] text-right font-semibold">{fmtCop(doc.monto)}</span>
              {alerta ? (
                <span
                  title={alerta.texto}
                  className="inline-flex items-center gap-1 rounded-md border border-[#ff6a13] px-2 py-0.5 font-semibold"
                >
                  <AlertTriangle className="h-3 w-3 text-[#ff6a13]" />
                  Alerta
                </span>
              ) : null}
              <span onClick={stop}>
                <DevolucionFotos urls={doc.imagenes} />
              </span>
            </span>
          </div>
        ),
        children: (
          <div className="flex flex-col gap-2">
            {alerta ? (
              <div className="flex items-start gap-2 rounded-md bg-[#fff4ec] px-3 py-2 text-xs text-gray-900">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#ff6a13]" />
                <span>
                  {alerta.texto} <b className="font-semibold">· Diferencia: {alerta.diferencia}</b>
                </span>
              </div>
            ) : null}
            {error ? <div className="text-xs font-medium text-red-600">{error}</div> : null}
            <div className="w-full overflow-x-auto">
              <Table
                rowKey="idProductoxDocumento"
                columns={columns}
                dataSource={lineas}
                pagination={false}
                size="small"
                scroll={{ x: 900 }}
              />
            </div>
            {editing ? (
              <button
                type="button"
                onClick={() => setDocAgregando(doc.idDocumentoXDevolucion)}
                className="flex w-fit items-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:border-[#9bb514] hover:bg-[#fafdf0]"
              >
                <Plus className="h-3.5 w-3.5" />
                Agregar producto
              </button>
            ) : null}
          </div>
        )
      }
    ];
  });

  return (
    <>
      {items.length ? (
        <GenericCollapse
          activeKey={activeKeys}
          onChange={(keys) => onChangeActiveKeys(Array.isArray(keys) ? keys : [keys])}
          items={items}
        />
      ) : (
        <div className="py-8 text-center text-sm text-gray-400">
          {q ? `Sin resultados para “${search.trim()}”` : "Sin documentos"}
        </div>
      )}

      <ModalEditarDocumento
        documento={docEditando}
        onClose={() => setDocEditando(null)}
        onApply={(doc) => actualizarDocumento(doc.idDocumentoXDevolucion, () => doc)}
      />
      <ModalAgregarProducto
        open={!!docAgregando}
        productos={productos}
        lotes={lotes}
        onClose={() => setDocAgregando(null)}
        onAdd={(producto) =>
          docAgregando &&
          actualizarDocumento(docAgregando, (doc) => {
            // La primera fila del documento aporta los datos de la devolución, el
            // documento, el cliente y la causal; el modal, los del producto.
            const [plantilla] = doc.data;
            return {
              ...doc,
              data: [
                ...doc.data,
                {
                  ...plantilla,
                  ...producto,
                  // Como en la respuesta: días entre la devolución y el vencimiento.
                  diasVencimiento: dayjs(plantilla.fechaFinDevolucion).diff(
                    dayjs(producto.fechaVencimiento),
                    "day"
                  )
                }
              ]
            };
          })
        }
      />
    </>
  );
}
