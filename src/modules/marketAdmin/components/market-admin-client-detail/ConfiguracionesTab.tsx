"use client";

import { ChevronDown } from "lucide-react";

export type ConfigForm = { cupoCredito: string; tipoPago: string };

type Props = {
  form: ConfigForm;
  onChange: (form: ConfigForm) => void;
};

export default function ConfiguracionesTab({ form, onChange }: Props) {
  return (
    <div className="max-w-lg">
      <p className="text-sm text-[#999999] mb-6">Ajustes financieros y operativos del cliente.</p>

      <div className="flex flex-col gap-5">
        {/* Cupo de crédito */}
        <div>
          <label className="text-xs font-bold text-[#141414] block mb-1.5">Cupo de crédito</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#999999]">
              $
            </span>
            <input
              type="number"
              min={0}
              placeholder="0"
              value={form.cupoCredito}
              onChange={(e) => onChange({ ...form, cupoCredito: e.target.value })}
              className="w-full text-sm border border-[#DDDDDD] rounded-lg pl-7 pr-3 py-2.5 focus:outline-none focus:border-[#141414] transition-colors"
            />
          </div>
        </div>

        {/* Tipo de pago */}
        <div>
          <label className="text-xs font-bold text-[#141414] block mb-1.5">Tipo de pago</label>
          <div className="relative">
            <select
              value={form.tipoPago}
              onChange={(e) => onChange({ ...form, tipoPago: e.target.value })}
              className="w-full text-sm border border-[#DDDDDD] rounded-lg px-3 py-2.5 pr-8 focus:outline-none focus:border-[#141414] transition-colors appearance-none bg-white cursor-pointer"
            >
              <option value="">Seleccionar...</option>
              <option value="contado">Contado</option>
              <option value="credito">Crédito</option>
              <option value="pasarela">Pasarela</option>
            </select>
            <ChevronDown
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999999] pointer-events-none"
            />
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end pt-2">
          <button className="text-sm font-semibold bg-[#141414] text-white px-5 py-2.5 rounded-lg hover:bg-[#333333] transition-colors">
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
}
