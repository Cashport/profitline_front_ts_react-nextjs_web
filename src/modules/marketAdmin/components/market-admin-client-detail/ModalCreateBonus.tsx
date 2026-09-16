"use client";

import { useState } from "react";
import { Modal } from "antd";
import FooterButtons from "@/components/atoms/FooterButtons/FooterButtons";
import { BLANK_BONIF, PRODUCTOS_BONIFICADOS_LIST } from "@/modules/marketAdmin/mocks/clientDetail";

type Props = {
  open: boolean;
  onClose: () => void;
};

const inputClass =
  "w-full text-sm border border-[#DDDDDD] rounded-lg px-3 py-2 bg-white outline-none focus:border-[#141414] transition-colors";
const labelClass = "text-xs font-medium text-[#666666] block mb-1";

export default function ModalCreateBonus({ open, onClose }: Props) {
  const [form, setForm] = useState(BLANK_BONIF);

  const handleClose = () => {
    setForm(BLANK_BONIF);
    onClose();
  };

  const handleOk = () => {
    console.log("Crear bonificado", form);
    handleClose();
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      width={480}
      destroyOnClose
      title={<span className="text-base font-bold text-[#141414]">Crear bonificado</span>}
    >
      <div className="py-2 flex flex-col gap-4">
        <div>
          <label className={labelClass}>Producto bonificado</label>
          <select
            value={form.producto}
            onChange={(e) => setForm((f) => ({ ...f, producto: e.target.value }))}
            className={inputClass}
          >
            {PRODUCTOS_BONIFICADOS_LIST.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Unidades</label>
          <input
            type="number"
            min={1}
            value={form.unidades}
            onChange={(e) => setForm((f) => ({ ...f, unidades: parseInt(e.target.value) || 1 }))}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Nota interna (opcional)</label>
          <input
            type="text"
            placeholder="Motivo..."
            value={form.nota}
            onChange={(e) => setForm((f) => ({ ...f, nota: e.target.value }))}
            className={inputClass}
          />
        </div>
      </div>

      <div className="mt-6">
        <FooterButtons titleConfirm="Crear" onClose={handleClose} handleOk={handleOk} />
      </div>
    </Modal>
  );
}
