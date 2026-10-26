"use client";

import { useEffect, useState } from "react";
import { DatePicker, Input, InputNumber, Modal } from "antd";
import dayjs, { Dayjs } from "dayjs";
import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import SecondaryButton from "@/components/atoms/buttons/secondaryButton/SecondaryButton";
import { IProfit360DevolucionDocumento } from "@/types/reverseLogistics/IReverseLogistics";
import { fmtCop, fmtNumber } from "../../utils/format";

interface ModalEditarDocumentoProps {
  // Documento a editar; null = cerrado.
  documento: IProfit360DevolucionDocumento | null;
  onClose: () => void;
  onApply: (documento: IProfit360DevolucionDocumento) => void;
}

// Edita los 4 campos que acepta el cambio `documento` de actualizar-productos:
// número, fecha, valor (montoDocumento) y unidades.
export function ModalEditarDocumento({ documento, onClose, onApply }: ModalEditarDocumentoProps) {
  const [numero, setNumero] = useState("");
  const [fecha, setFecha] = useState<Dayjs | null>(null);
  const [monto, setMonto] = useState<number | null>(null);
  const [unidades, setUnidades] = useState<number | null>(null);

  useEffect(() => {
    if (!documento) return;
    setNumero(documento.numeroDocumento);
    setFecha(documento.fechaDocumento ? dayjs(documento.fechaDocumento) : null);
    setMonto(documento.monto);
    setUnidades(documento.unidades);
  }, [documento]);

  const productos = documento?.data ?? [];
  const sumaUnidades = productos.reduce((acc, p) => acc + p.cantidadProdXDoc, 0);
  const sumaValor = productos.reduce((acc, p) => acc + p.valorTotal, 0);
  const completo = !!numero.trim() && !!fecha && monto !== null && unidades !== null;

  const handleApply = () => {
    if (!documento || !fecha || monto === null || unidades === null) return;
    onApply({
      ...documento,
      numeroDocumento: numero.trim(),
      // Si el día no cambió se conserva el valor tal como llegó del backend,
      // para no reportar un cambio de formato como edición.
      fechaDocumento: fecha.isSame(dayjs(documento.fechaDocumento), "day")
        ? documento.fechaDocumento
        : fecha.format("YYYY-MM-DDT00:00:00"),
      monto,
      unidades
    });
    onClose();
  };

  return (
    <Modal
      title="Editar documento"
      open={!!documento}
      onCancel={onClose}
      footer={null}
      centered
      destroyOnClose
      width={520}
    >
      <div className="flex flex-col gap-4 py-2">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
            Número del documento
            <Input
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              placeholder="Número"
              status={numero.trim() ? undefined : "error"}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
            Fecha
            <DatePicker value={fecha} onChange={setFecha} format="DD/MM/YYYY" className="w-full" />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
            Valor del documento
            <InputNumber value={monto} onChange={setMonto} min={0} prefix="$" className="w-full" />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
            Unidades
            <InputNumber value={unidades} onChange={setUnidades} min={0} className="w-full" />
          </label>
        </div>
        <div className="rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600">
          Los productos suman{" "}
          <b className="font-semibold text-gray-900">
            {fmtNumber(sumaUnidades)} unid. · {fmtCop(sumaValor)}
          </b>
        </div>
        <div className="flex items-center justify-end gap-2 pt-2">
          <SecondaryButton onClick={onClose}>Cancelar</SecondaryButton>
          <PrincipalButton onClick={handleApply} disabled={!completo}>
            Aplicar
          </PrincipalButton>
        </div>
      </div>
    </Modal>
  );
}
