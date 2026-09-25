"use client";

import { cn } from "@/utils/utils";

/* Tarjetas de resumen de sólo lectura. La hermana clicable es ui/kpi-cards.
   Todo entra ya formateado: el formato de moneda vive en el módulo, no aquí. */

export interface StatCardItem {
  id: string;
  /** ReactNode para que pueda llevar un cuadro de color delante del texto. */
  label: React.ReactNode;
  value: string;
  /** Pequeño y apagado junto al valor: "23,4%". */
  suffix?: string;
  foot: React.ReactNode;
  /** Barra opcional bajo el valor (SegBar y compañía). */
  bar?: React.ReactNode;
}

interface StatCardsProps {
  cards: StatCardItem[];
  /** Rejilla: la cartera usa 4 columnas fijas; la torre, auto-fit. */
  className?: string;
}

export default function StatCards({ cards, className }: StatCardsProps) {
  return (
    <div
      className={cn("grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-3", className)}
    >
      {cards.map((c) => (
        <div key={c.id} className="flex flex-col rounded-xl bg-card p-4 shadow-sm">
          <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.03em] text-muted-foreground">
            {c.label}
          </div>

          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-semibold leading-none tracking-tight tabular-nums text-foreground">
              {c.value}
            </span>
            {c.suffix && (
              <span className="text-[12.5px] font-medium tabular-nums text-muted-foreground">
                {c.suffix}
              </span>
            )}
          </div>

          {c.bar}

          <div className="mt-auto pt-2 text-[11.5px] text-muted-foreground">{c.foot}</div>
        </div>
      ))}
    </div>
  );
}
