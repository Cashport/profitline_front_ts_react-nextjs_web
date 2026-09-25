"use client";

import { cn } from "@/utils/utils";

/* Tarjetas de resumen de una bandeja: elegir una acota lo que se lista debajo.
   El estado activo se pinta con --wallet-accent / --wallet-accent-soft, que sólo
   existen dentro de `.wallet-scope` (src/styles/tailwind.css). Fuera de ese ámbito
   las tarjetas se ven bien, pero la seleccionada no se resalta. */

export type KpiSeverity = "warn" | "crit";

export interface KpiCardItem {
  id: string;
  label: string;
  /** Texto que sigue al conteo en el pie de la tarjeta. */
  pie: string;
  /** Ya formateado: el formato de moneda vive en el módulo, no aquí. */
  valor: string;
  conteo: number;
  sev?: KpiSeverity;
}

interface KpiCardsProps {
  cards: KpiCardItem[];
  /** Singular y plural de lo que se cuenta: ["ticket", "tickets"]. */
  noun: [string, string];
  selected: string | null;
  onSelect: (id: string) => void;
}

const DOT: Record<KpiSeverity, string> = {
  warn: "bg-amber-500",
  crit: "bg-rose-500"
};

export default function KpiCards({ cards, noun, selected, onSelect }: KpiCardsProps) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-3">
      {cards.map((c) => {
        const activa = selected === c.id;

        return (
          <button
            key={c.id}
            type="button"
            aria-pressed={activa}
            onClick={() => onSelect(c.id)}
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
              {c.valor}
            </div>

            <div className="mt-auto pt-2 text-[11.5px] text-muted-foreground">
              {c.conteo} {c.conteo === 1 ? noun[0] : noun[1]} · {c.pie}
            </div>
          </button>
        );
      })}
    </div>
  );
}
