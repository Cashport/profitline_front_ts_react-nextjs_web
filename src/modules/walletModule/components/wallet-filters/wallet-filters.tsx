"use client";

import { ChevronDown } from "lucide-react";

import { WALLET_FILTERS } from "../../constants";
import { cli, fac, fmtM } from "../../utils/format";
import type { IWalletSummary } from "../../types";

interface WalletFiltersProps {
  summary: IWalletSummary;
}

/** Chips de filtro + resumen de la vista. Misma altura y superficie que el buscador.
 *  TODO: conectar cada chip a un multi-select cuando exista el endpoint de filtros. */
export default function WalletFilters({ summary }: WalletFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {WALLET_FILTERS.map((f) => (
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
        {cli(summary.clientes)} · {fac(summary.segments.n)} · {fmtM(summary.segments.total)}
      </span>
    </div>
  );
}
