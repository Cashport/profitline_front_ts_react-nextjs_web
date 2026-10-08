"use client";

import { cn } from "@/utils/utils";

interface SwatchProps {
  color: string;
  /** Sólo el borde: el forecast se dibuja punteado, sin relleno. */
  outline?: boolean;
  /** Relleno con borde (`outline`): lo esperado va tenue con el borde del recaudo. */
  fill?: string;
  className?: string;
}

/** Cuadrito de color de las leyendas. */
export function Swatch({ color, outline, fill, className }: SwatchProps) {
  return (
    <i
      className={cn("inline-block h-2 w-2 shrink-0 rounded-[2px]", className)}
      style={
        outline
          ? { background: fill ?? "transparent", boxShadow: `inset 0 0 0 1.5px ${color}` }
          : { background: color }
      }
    />
  );
}

interface LineSwatchProps {
  /** Color del API; sin él, el trazo toma el de `className` (p. ej. stroke-foreground). */
  color?: string;
  dash?: string;
  width?: number;
  className?: string;
}

/** Muestra de línea para la leyenda del gráfico de recaudo. */
export function LineSwatch({ color, dash, width = 2, className }: LineSwatchProps) {
  return (
    <svg viewBox="0 0 20 8" className="h-2 w-5 shrink-0" aria-hidden>
      <line
        x1="1"
        y1="4"
        x2="19"
        y2="4"
        stroke={color}
        className={className}
        strokeWidth={width}
        strokeDasharray={dash}
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Ítem de leyenda: muestra + texto (+ valor opcional en negrita). */
export function LegendItem({
  mark,
  label,
  value
}: {
  mark: React.ReactNode;
  label: React.ReactNode;
  value?: string;
}) {
  return (
    <span className="inline-flex items-center gap-[5px] whitespace-nowrap">
      {mark}
      {label}
      {value !== undefined && <b className="font-bold tabular-nums text-foreground">{value}</b>}
    </span>
  );
}
