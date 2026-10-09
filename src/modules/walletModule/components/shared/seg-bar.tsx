"use client";

import { cn } from "@/utils/utils";
import { estadoMeta } from "../../utils/estados";
import { segmentWidths } from "../../utils/wallet-calc";
import type { MontosPorEstado } from "../../types";

interface SegBarProps {
  segments: MontosPorEstado & { total: number };
  className?: string;
}

/** Barra apilada con el reparto por estado de un monto. */
export default function SegBar({ segments, className }: SegBarProps) {
  if (!segments.total) return null;

  return (
    <div className={cn("mt-1.5 flex h-[5px] gap-0.5 overflow-hidden rounded-sm", className)}>
      {segmentWidths(segments).map(({ estado, width }) => (
        <i
          key={estado}
          className={cn("block h-full rounded-[2px]", estadoMeta(estado).bg)}
          style={{
            width: `${width.toFixed(2)}%`,
            boxShadow: "inset 0 0 0 1px var(--wallet-seg-edge)"
          }}
        />
      ))}
    </div>
  );
}
