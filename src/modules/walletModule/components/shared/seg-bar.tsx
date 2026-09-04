"use client";

import { cn } from "@/utils/utils";
import { EST_META } from "../../constants";
import { segmentWidths } from "../../utils/wallet-calc";
import type { EstadoKey, WalletSegments } from "../../types";

interface SegBarProps {
  segments: Pick<WalletSegments, EstadoKey | "total">;
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
          className={cn("block h-full rounded-[2px]", EST_META[estado].bg)}
          style={{
            width: `${width.toFixed(2)}%`,
            boxShadow: "inset 0 0 0 1px var(--wallet-seg-edge)"
          }}
        />
      ))}
    </div>
  );
}
