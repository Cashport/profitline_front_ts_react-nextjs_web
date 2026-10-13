"use client";

import { useEffect, useState } from "react";
import { Modal } from "antd";
import FooterButtons from "@/components/atoms/FooterButtons/FooterButtons";

export type NuevoEtlFormValues = {
  nombre: string;
  observacion: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSend: (values: NuevoEtlFormValues) => void;
};

const BLANK_ETL: NuevoEtlFormValues = {
  nombre: "",
  observacion: ""
};

const inputClass =
  "w-full text-sm border border-[#DDDDDD] rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#141414] transition-colors";
const labelClass = "text-xs font-bold text-[#141414] block mb-1.5";

export default function ModalNuevoEtl({ open, onClose, onSend }: Props) {
  const [form, setForm] = useState<NuevoEtlFormValues>(BLANK_ETL);

  // El form vive fuera del <Modal>, asi que destroyOnClose no lo limpia
  useEffect(() => {
    if (open) setForm(BLANK_ETL);
  }, [open]);

  const isValid = form.nombre.trim() !== "";

  const handleOk = () => {
    if (!isValid) return;
    onSend({
      nombre: form.nombre.trim(),
      observacion: form.observacion.trim()
    });
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={480}
      destroyOnClose
      title={<span className="text-base font-bold text-[#141414]">Nuevo ETL</span>}
    >
      <div className="py-2 space-y-4">
        <div>
          <label className={labelClass}>Nombre</label>
          <input
            className={inputClass}
            placeholder="Ej. Inventario actualizado"
            value={form.nombre}
            onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
            autoFocus
          />
        </div>
        <div>
          <label className={labelClass}>
            Observación <span className="text-[#AAAAAA] font-normal">(opcional)</span>
          </label>
          <textarea
            rows={4}
            className={`${inputClass} resize-none`}
            placeholder="Describe qué hace este cargue y cuándo debe usarse..."
            value={form.observacion}
            onChange={(e) => setForm((f) => ({ ...f, observacion: e.target.value }))}
          />
        </div>
      </div>

      <div className="mt-6">
        <FooterButtons
          titleConfirm="Crear ETL"
          isConfirmDisabled={!isValid}
          onClose={onClose}
          handleOk={handleOk}
        />
      </div>
    </Modal>
  );
}
