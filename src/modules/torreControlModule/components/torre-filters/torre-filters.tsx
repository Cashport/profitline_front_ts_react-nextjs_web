"use client";

import { cli, fac, fmtM } from "@/modules/walletModule/utils/format";
import type { ITorreResumen } from "../../types";

interface TorreFiltersProps {
  /** Resumen de lo que hay en vista: se mueve con el filtro de tramo. */
  resumen: ITorreResumen;
}

/** Resumen de la vista. Los filtros van en el botón "Filtrar" del header (TorreHeader). */
export default function TorreFilters({ resumen }: TorreFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="ml-auto text-[13px] text-muted-foreground">
        {cli(resumen.clientes)} · {fac(resumen.facturas)} · {fmtM(resumen.segments.total)}
      </span>
    </div>
  );
}
