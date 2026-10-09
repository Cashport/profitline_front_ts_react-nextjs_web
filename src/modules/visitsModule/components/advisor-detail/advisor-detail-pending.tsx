"use client";

import { ChevronLeft } from "lucide-react";

interface AdvisorDetailPendingProps {
  /** El pedido del detalle del día falló. */
  failed: boolean;
  onBack: () => void;
}

/** Panel del asesor mientras llega su detalle del día, o si no se pudo traer. */
export default function AdvisorDetailPending({ failed, onBack }: AdvisorDetailPendingProps) {
  return (
    <div className="min-h-0 flex-1 px-4 py-3.5">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 py-1 text-[11px] tracking-[0.06em] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-3 w-3" />
        Equipo
      </button>
      <p className="px-2 py-3.5 text-xs text-muted-foreground">
        {failed ? "No se pudo cargar el detalle del asesor." : "Cargando detalle del asesor…"}
      </p>
    </div>
  );
}
