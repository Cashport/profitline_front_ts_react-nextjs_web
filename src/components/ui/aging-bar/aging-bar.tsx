"use client";

import { Fragment } from "react";

import { cn } from "@/utils/utils";

export interface AgingBarSegment {
  key: string;
  value: number;
  color: string;
  /** Texto del title (hover). */
  tip?: string;
}

interface AgingBarProps {
  segments: AgingBarSegment[];
  /** Segmento resaltado: los demás se atenúan. */
  highlight?: string | null;
  /** Clic en un segmento (ej. filtrar por ese tramo). */
  onSegmentClick?: (key: string) => void;
  /** Alto en px. */
  height?: number;
  /** Separación entre segmentos en px. */
  gap?: number;
  /** Envuelve cada segmento (p. ej. en un Tooltip) en lugar del `tip` nativo. */
  wrapSegment?: (segment: AgingBarSegment, node: React.ReactElement) => React.ReactNode;
  className?: string;
}

/**
 * Reparto de un monto entre tramos de edad (o cualquier serie ordenada).
 * Cada segmento ocupa su proporción sobre la suma de los positivos; los
 * ceros y negativos no se dibujan.
 */
export default function AgingBar({
  segments,
  highlight = null,
  onSegmentClick,
  height = 6,
  gap = 2,
  wrapSegment,
  className
}: AgingBarProps) {
  const visible = segments.filter((s) => s.value > 0);

  return (
    <div
      className={cn("flex w-full overflow-hidden", className)}
      style={{ height, gap, borderRadius: height / 2 }}
    >
      {visible.map((s) => {
        const node = (
          <div
            key={s.key}
            title={wrapSegment ? undefined : s.tip}
            onClick={onSegmentClick ? () => onSegmentClick(s.key) : undefined}
            style={{
              flex: s.value,
              background: s.color,
              opacity: highlight && highlight !== s.key ? 0.35 : 1,
              cursor: onSegmentClick ? "pointer" : undefined
            }}
          />
        );
        return wrapSegment ? <Fragment key={s.key}>{wrapSegment(s, node)}</Fragment> : node;
      })}
    </div>
  );
}
