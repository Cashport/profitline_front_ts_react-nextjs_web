"use client";

import { cn } from "@/utils/utils";
import { fmtM } from "@/modules/walletModule/utils/format";
import { KPI_CARDS } from "../../constants";
import { NOVELTY_PREDICATES } from "../../utils/novelties-calc";
import type { INoveltyRow, NoveltyFilter } from "../../types";

interface NoveltiesKpiCardsProps {
  rows: INoveltyRow[];
  filtro: NoveltyFilter;
  onFiltroChange: (filtro: NoveltyFilter) => void;
}

const DOT: Record<"warn" | "crit", string> = {
  warn: "bg-amber-500",
  crit: "bg-rose-500"
};

/** Las cinco tarjetas de la bandeja. Elegir una acota la lista y el tablero. */
export default function NoveltiesKpiCards({
  rows,
  filtro,
  onFiltroChange
}: NoveltiesKpiCardsProps) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-3">
      {KPI_CARDS.map((c) => {
        // El mismo predicado que filtra las filas, para que el conteo no mienta.
        const suyas = rows.filter(NOVELTY_PREDICATES[c.id]);
        const activa = filtro === c.id;

        return (
          <button
            key={c.id}
            type="button"
            aria-pressed={activa}
            onClick={() => onFiltroChange(c.id)}
            className={cn(
              "flex flex-col rounded-xl border bg-card p-4 text-left shadow-sm transition-colors",
              activa
                ? "border-wallet-accent bg-wallet-accent-soft ring-1 ring-inset ring-wallet-accent"
                : "border-transparent hover:border-border"
            )}
          >
            <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.03em] text-muted-foreground">
              {c.sev && <span className={cn("h-2 w-2 shrink-0 rounded-full", DOT[c.sev])} />}
              {c.label}
            </div>

            <div className="mt-1.5 text-2xl font-semibold leading-none tracking-tight tabular-nums text-foreground">
              {fmtM(suyas.reduce((a, n) => a + n.monto, 0))}
            </div>

            <div className="mt-auto pt-2 text-[11.5px] text-muted-foreground">
              {suyas.length} {suyas.length === 1 ? "novedad" : "novedades"} · {c.pie}
            </div>
          </button>
        );
      })}
    </div>
  );
}
