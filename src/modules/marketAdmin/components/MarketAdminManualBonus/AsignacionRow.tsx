"use client";

import { Check, X } from "lucide-react";
import { AsignacionManual } from "@/types/marketAdmin/IMarketAdmin";
import { ESTADO_CONFIG } from "./estadoConfig";

export default function AsignacionRow({
  asignacion,
  isLast,
  onAprobar,
  onRechazar
}: {
  asignacion: AsignacionManual;
  isLast: boolean;
  onAprobar: () => void;
  onRechazar: () => void;
}) {
  const cfg = ESTADO_CONFIG[asignacion.estado];

  return (
    <div
      className={`grid grid-cols-[2fr_1.5fr_80px_80px_100px_120px] items-center px-6 py-4 ${!isLast ? "border-b border-[#F4F4F4]" : ""}`}
    >
      <div>
        <p className="text-sm font-medium text-[#141414] truncate" title={asignacion.clienteNombre}>
          {asignacion.clienteNombre}
        </p>
        <p className="text-xs text-[#999999]">NIT: {asignacion.clienteNit}</p>
      </div>
      <p
        className="text-sm text-[#141414] truncate pr-2"
        title={asignacion.productoBonificadoNombre}
      >
        {asignacion.productoBonificadoNombre}
      </p>
      <p className="text-sm font-semibold text-[#141414] text-center">
        {asignacion.unidadesAsignadas}
      </p>
      <p
        className={`text-sm font-semibold text-center ${asignacion.unidadesDisponibles === 0 ? "text-red-400" : "text-green-600"}`}
      >
        {asignacion.unidadesDisponibles}
      </p>
      <div className="flex justify-center">
        <span className={`px-2 py-1 text-[11px] font-semibold rounded-lg ${cfg.className}`}>
          {cfg.label}
        </span>
      </div>
      <div className="flex items-center justify-end gap-1.5">
        {asignacion.estado === "pendiente" ? (
          <>
            <button
              onClick={onAprobar}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
            >
              <Check size={11} /> Aprobar
            </button>
            <button
              onClick={onRechazar}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
            >
              <X size={11} /> Rechazar
            </button>
          </>
        ) : (
          <span className="text-xs text-[#CCCCCC]">{asignacion.creadoEn}</span>
        )}
      </div>
    </div>
  );
}
