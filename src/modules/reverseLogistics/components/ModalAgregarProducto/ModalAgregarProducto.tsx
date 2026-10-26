"use client";

import { useEffect, useState } from "react";
import { Input, InputNumber, Modal, Select } from "antd";
import dayjs from "dayjs";
import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import SecondaryButton from "@/components/atoms/buttons/secondaryButton/SecondaryButton";
import {
  IProfit360DevolucionCatalogoProducto,
  IProfit360DevolucionLote,
  IProfit360DevolucionProducto
} from "@/types/reverseLogistics/IReverseLogistics";
import { generateShortUuid } from "@/utils/utils";
import { fmtCop } from "../../utils/format";

// Campos propios del producto agregado; el resto de la fila (documento, cliente,
// causal…) lo completa quien lo recibe con otra fila del mismo documento.
export type ProductoNuevo = Pick<
  IProfit360DevolucionProducto,
  | "idProductoxDocumento"
  | "idProducto"
  | "codigo"
  | "nombreProducto"
  | "lote"
  | "fechaVencimiento"
  | "cantidadProdXDoc"
  | "precioUnitario"
  | "subtotal"
  | "valorIva"
  | "valorTotal"
  | "observacionProducto"
>;

interface ModalAgregarProductoProps {
  open: boolean;
  // Catálogos que trae POST /devoluciones/pdf.
  productos: IProfit360DevolucionCatalogoProducto[];
  lotes: IProfit360DevolucionLote[];
  onClose: () => void;
  onAdd: (producto: ProductoNuevo) => void;
}

// Agrega un producto a un documento en edición: producto y lote salen de los
// catálogos de la devolución; cantidad, valor unitario y observación se digitan.
export function ModalAgregarProducto({
  open,
  productos,
  lotes,
  onClose,
  onAdd
}: ModalAgregarProductoProps) {
  const [idProducto, setIdProducto] = useState<string>();
  const [numeroLote, setNumeroLote] = useState<string>();
  const [cantidad, setCantidad] = useState<number | null>(1);
  const [precio, setPrecio] = useState<number | null>(null);
  const [observacion, setObservacion] = useState("");

  useEffect(() => {
    if (!open) return;
    setIdProducto(undefined);
    setNumeroLote(undefined);
    setCantidad(1);
    setPrecio(null);
    setObservacion("");
  }, [open]);

  const producto = productos.find((p) => p.id === idProducto);
  const lotesProducto = lotes.filter((l) => l.idProducto === idProducto);
  const lote = lotesProducto.find((l) => l.lote === numeroLote);
  const completo = !!producto && !!lote && !!cantidad && cantidad > 0 && precio !== null;

  const handleAdd = () => {
    if (!producto || !lote || !cantidad || precio === null) return;
    const subtotal = cantidad * precio;
    onAdd({
      // Id temporal: identifica la fila mientras se edita y no se envía al backend.
      idProductoxDocumento: generateShortUuid(),
      idProducto: producto.id,
      codigo: lote.sku,
      nombreProducto: producto.descripcion,
      lote: lote.lote,
      // Los lotes llegan como "YYYY-MM-DD HH:mm:ss"; las filas, con "T".
      fechaVencimiento: dayjs(lote.fecha).format("YYYY-MM-DDTHH:mm:ss"),
      cantidadProdXDoc: cantidad,
      precioUnitario: precio,
      subtotal,
      valorIva: 0,
      valorTotal: subtotal,
      observacionProducto: observacion.trim()
    });
    onClose();
  };

  return (
    <Modal
      title="Agregar producto"
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      destroyOnClose
      width={560}
    >
      <div className="flex flex-col gap-4 py-2">
        <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
          Producto
          <Select
            showSearch
            value={idProducto}
            onChange={(value: string) => {
              setIdProducto(value);
              setNumeroLote(undefined);
            }}
            options={productos}
            fieldNames={{ label: "descripcion", value: "id" }}
            filterOption={(input, option) =>
              !!option?.descripcion.toLowerCase().includes(input.toLowerCase())
            }
            placeholder="Buscar producto"
            className="w-full"
          />
        </label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
            Lote
            <Select
              value={numeroLote}
              onChange={setNumeroLote}
              options={lotesProducto}
              fieldNames={{ label: "lote", value: "lote" }}
              disabled={!producto}
              notFoundContent="Sin lotes vigentes"
              placeholder="Selecciona el lote"
              className="w-full"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
            Vencimiento
            <span className="flex h-8 items-center text-sm font-normal text-gray-900">
              {lote ? dayjs(lote.fecha).format("DD/MM/YYYY") : "—"}
            </span>
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
            Cantidad
            <InputNumber value={cantidad} onChange={setCantidad} min={1} className="w-full" />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
            Valor unitario
            <InputNumber
              value={precio}
              onChange={setPrecio}
              min={0}
              prefix="$"
              className="w-full"
            />
          </label>
        </div>
        <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
          Observación
          <Input
            value={observacion}
            onChange={(e) => setObservacion(e.target.value)}
            placeholder="Opcional"
          />
        </label>
        <div className="flex items-center justify-between gap-2 pt-2">
          <span className="text-xs text-gray-500">
            {cantidad && precio !== null ? `Valor total ${fmtCop(cantidad * precio)}` : ""}
          </span>
          <div className="flex items-center gap-2">
            <SecondaryButton onClick={onClose}>Cancelar</SecondaryButton>
            <PrincipalButton onClick={handleAdd} disabled={!completo}>
              Agregar
            </PrincipalButton>
          </div>
        </div>
      </div>
    </Modal>
  );
}
