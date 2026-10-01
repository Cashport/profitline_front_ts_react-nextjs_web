"use client";

import { ChevronDown } from "lucide-react";

import { cli, fac, fmtM } from "@/modules/walletModule/utils/format";
import { TORRE_FILTERS } from "../../constants";
import type { ITorreResumen } from "../../types";

interface TorreFiltersProps {
  /** Resumen de lo que hay en vista: se mueve con el filtro de tramo. */
  resumen: ITorreResumen;
}

/** Chips de filtro + resumen de la vista.
 *  TODO: conectar cada chip a un multi-select cuando exista el endpoint de filtros. */
export default function TorreFilters({ resumen }: TorreFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {TORRE_FILTERS.map((f) => (
        <button
          key={f.key}
          type="button"
          className="inline-flex h-12 items-center gap-2 whitespace-nowrap rounded-lg border border-border bg-card px-4 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
        >
          {f.label}
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>
      ))}

      <span className="ml-auto text-[11.5px] text-muted-foreground">
        {cli(resumen.clientes)} · {fac(resumen.facturas)} · {fmtM(resumen.segments.total)}
      </span>
    </div>
  );
}
