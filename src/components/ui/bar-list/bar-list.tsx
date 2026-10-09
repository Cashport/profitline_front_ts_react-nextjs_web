"use client";

import { cn } from "@/utils/utils";

/* Lista de barras horizontales: etiqueta · carril · cifra.
   Los anchos llegan calculados en porcentaje, igual que los valores llegan ya
   formateados, para que quien la use decida contra qué escala mide. */

export interface BarListSegment {
  key: string;
  /** Porcentaje 0–100 del ancho del carril. */
  width: number;
  /** Clase de fondo: bg-wallet-conc, bg-wallet-nov, … */
  className: string;
}

export interface BarListRow {
  id: string;
  label: string;
  segments: BarListSegment[];
  /** Ancho del carril 0–100; por defecto 100. */
  trackWidth?: number;
  value: string;
  /** Adorno tras la cifra: un chip, normalmente. */
  extra?: React.ReactNode;
}

interface BarListProps {
  rows: BarListRow[];
  emptyLabel: string;
  /** Alto máximo antes de hacer scroll, en px. */
  maxHeight?: number;
  /** Envuelve el carril de cada fila; por ahí entra el tooltip de detalle. */
  wrapTrack?: (track: React.ReactElement, row: BarListRow) => React.ReactNode;
}

export default function BarList({ rows, emptyLabel, maxHeight, wrapTrack }: BarListProps) {
  if (rows.length === 0) {
    return <p className="py-2 text-[11.5px] text-muted-foreground">{emptyLabel}</p>;
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto" style={{ maxHeight }}>
      {rows.map((row) => {
        const track = (
          <div
            className="flex h-4 gap-0.5 overflow-hidden rounded bg-muted"
            style={{ width: `${(row.trackWidth ?? 100).toFixed(2)}%` }}
          >
            {row.segments.map((s) =>
              s.width <= 0 ? null : (
                <i
                  key={s.key}
                  className={cn("block h-full", s.className)}
                  style={{
                    width: `${s.width.toFixed(2)}%`,
                    boxShadow: "inset 0 0 0 1px var(--wallet-seg-edge)"
                  }}
                />
              )
            )}
          </div>
        );

        return (
          <div
            key={row.id}
            className="grid grid-cols-[130px_1fr_82px] items-center gap-2.5 py-[5px] text-xs"
          >
            <span className="truncate text-foreground" title={row.label}>
              {row.label}
            </span>

            {wrapTrack ? wrapTrack(track, row) : track}

            <span className="flex items-center justify-end gap-1 text-right tabular-nums text-foreground">
              {row.value}
              {row.extra}
            </span>
          </div>
        );
      })}
    </div>
  );
}
