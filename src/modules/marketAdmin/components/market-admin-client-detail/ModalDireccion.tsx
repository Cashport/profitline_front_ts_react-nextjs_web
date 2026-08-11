"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { ModalBase } from "@/modules/marketAdmin/components/modal-base/ModalBase";
import { BLANK_DIR, type Direccion } from "@/modules/marketAdmin/mocks/clientDetail";

type Props = {
  mode: "new" | "edit";
  initial?: Direccion;
  onClose: () => void;
  onSave: (values: Omit<Direccion, "id">) => void;
};

export default function ModalDireccion({ mode, initial, onClose, onSave }: Props) {
  const [form, setForm] = useState<Omit<Direccion, "id">>(
    initial
      ? { direccion: initial.direccion, ciudad: initial.ciudad, bodega: initial.bodega }
      : BLANK_DIR
  );

  const save = () => {
    if (!form.direccion.trim()) return;
    onSave(form);
  };

  return (
    <ModalBase onClose={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#EEEEEE]">
          <h2 className="text-base font-bold text-[#141414]">
            {mode === "new" ? "Nueva dirección" : "Editar dirección"}
          </h2>
          <button
            onClick={onClose}
            className="text-[#AAAAAA] hover:text-[#141414] transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          {(["direccion", "ciudad", "bodega"] as const).map((field) => (
            <div key={field}>
              <label className="text-xs font-bold text-[#141414] block mb-1.5 capitalize">
                {field === "direccion"
                  ? "Dirección"
                  : field.charAt(0).toUpperCase() + field.slice(1)}
              </label>
              <input
                className="w-full text-sm border border-[#DDDDDD] rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#141414] transition-colors"
                placeholder={
                  field === "direccion"
                    ? "Ej. Calle 100 # 15-20"
                    : field === "ciudad"
                      ? "Ej. Bogotá"
                      : "Ej. Bodega Norte"
                }
                value={form[field]}
                onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                autoFocus={field === "direccion"}
              />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#EEEEEE]">
          <button
            onClick={onClose}
            className="text-sm text-[#666666] px-4 py-2 rounded-lg hover:bg-[#F5F5F5] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={save}
            disabled={!form.direccion.trim()}
            className="text-sm font-semibold bg-[#141414] text-white px-5 py-2 rounded-lg hover:bg-[#333333] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {mode === "new" ? "Guardar dirección" : "Guardar cambios"}
          </button>
        </div>
      </div>
    </ModalBase>
  );
}
