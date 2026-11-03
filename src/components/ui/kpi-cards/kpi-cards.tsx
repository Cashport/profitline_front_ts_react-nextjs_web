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
    <div className="grid grid-cols-2 gap-[var(--card-gap)] md:grid-flow-col md:grid-cols-none md:auto-cols-[minmax(0,1fr)]">
      {cards.map((c) => {
        const activa = selected === c.id;

        return (
          <button
            key={c.id}
            type="button"
            aria-pressed={activa}
            onClick={() => onSelect(c.id)}
            className={cn(
              // Tarjeta de Clientes (DESIGN.md §3): radio 14, sin borde ni sombra. El estado activo
              // y el hover van con outline para no sumar borde.
              "flex flex-col rounded-[var(--card-radius)] border-0 px-[18px] py-[14px] text-left shadow-none outline outline-1 -outline-offset-1 transition-colors",
              activa
                ? "bg-wallet-accent-soft outline-wallet-accent"
                : "bg-cp-surface outline-transparent hover:outline-cp-line-2"
            )}
          >
            <div className="flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground">
              {c.sev && <span className={cn("h-2 w-2 shrink-0 rounded-full", DOT[c.sev])} />}
              {c.label}
            </div>

            <div className="mt-1.5 text-2xl font-semibold leading-none tracking-tight tabular-nums text-foreground">
              {c.valor}
            </div>

            <div className="mt-auto pt-2 text-[13px] text-muted-foreground">
              {c.conteo} {c.conteo === 1 ? noun[0] : noun[1]} · {c.pie}
            </div>
          </button>
        );
      })}
    </div>
  );
}
