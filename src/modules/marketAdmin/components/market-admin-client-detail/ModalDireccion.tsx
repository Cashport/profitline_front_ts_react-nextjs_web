"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { ModalBase } from "@/modules/marketAdmin/components/modal-base/ModalBase";
import WarehouseSelect from "@/modules/commerce/components/warehouse-select/warehouse-select";
import {
  ICreateMarketAdminClientAddressBody,
  IMarketAdminClientAddress
} from "@/types/marketAdmin/IMarketAdmin";

type Props = {
  mode: "new" | "edit";
  initial?: IMarketAdminClientAddress;
  onClose: () => void;
  onSave: (values: ICreateMarketAdminClientAddressBody) => Promise<void>;
};

const BLANK_DIR: ICreateMarketAdminClientAddressBody = {
  address: "",
  city: "",
  warehouse_id: null,
  code_address: "",
  profit_center: ""
};

export default function ModalDireccion({ mode, initial, onClose, onSave }: Props) {
  const [form, setForm] = useState<ICreateMarketAdminClientAddressBody>(
    initial
      ? {
          address: initial.address,
          city: initial.city,
          warehouse_id: initial.warehouse_id,
          code_address: initial.code_address ?? "",
          profit_center: initial.profit_center ?? ""
        }
      : BLANK_DIR
  );
  const [isSaving, setIsSaving] = useState(false);

  const isValid = form.address.trim() !== "" && form.city.trim() !== "";

  const save = async () => {
    if (!isValid) return;
    try {
      setIsSaving(true);
      await onSave({
        ...form,
        address: form.address.trim(),
        city: form.city.trim(),
        code_address: form.code_address?.trim() || undefined,
        profit_center: form.profit_center?.trim() || undefined
      });
    } catch {
      // El contenedor ya muestra el mensaje de error; el modal solo se mantiene abierto.
    } finally {
      setIsSaving(false);
    }
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
          <div>
            <label className="text-xs font-bold text-[#141414] block mb-1.5">Dirección</label>
            <input
              className="w-full text-sm border border-[#DDDDDD] rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#141414] transition-colors"
              placeholder="Ej. Calle 100 # 15-20"
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              autoFocus
            />
          </div>
          <div>
            <label className="text-xs font-bold text-[#141414] block mb-1.5">Ciudad</label>
            <input
              className="w-full text-sm border border-[#DDDDDD] rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#141414] transition-colors"
              placeholder="Ej. Bogotá"
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-[#141414] block mb-1.5">Bodega</label>
            <WarehouseSelect
              value={form.warehouse_id ?? undefined}
              onChange={(warehouseId) => setForm((f) => ({ ...f, warehouse_id: warehouseId }))}
              size="large"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-[#141414] block mb-1.5">
              Código de dirección
            </label>
            <input
              className="w-full text-sm border border-[#DDDDDD] rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#141414] transition-colors"
              placeholder='Ej. 01 — usa "00" para la dirección principal'
              value={form.code_address ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, code_address: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-[#141414] block mb-1.5">Centro de costo</label>
            <input
              className="w-full text-sm border border-[#DDDDDD] rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#141414] transition-colors"
              placeholder="Opcional"
              value={form.profit_center ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, profit_center: e.target.value }))}
            />
          </div>
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
            disabled={!isValid || isSaving}
            className="text-sm font-semibold bg-[#141414] text-white px-5 py-2 rounded-lg hover:bg-[#333333] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSaving ? "Guardando..." : mode === "new" ? "Guardar dirección" : "Guardar cambios"}
          </button>
        </div>
      </div>
    </ModalBase>
  );
}
