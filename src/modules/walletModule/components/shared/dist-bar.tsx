"use client";

import { cn } from "@/utils/utils";
import { TRAMO_BG } from "../../constants";

interface DistBarProps {
  tramos: number[];
  monto: number;
  /** Sobreescribe alto y ancho: la tabla la usa compacta, el modal a lo ancho. */
  className?: string;
}

/** Reparto de un grupo entre los seis tramos de vencimiento. */
export default function DistBar({ tramos, monto, className }: DistBarProps) {
  if (!monto) return null;

  return (
    <div className={cn("flex h-[9px] w-full max-w-[80px] gap-0.5 rounded-sm", className)}>
      {tramos.map((v, i) =>
        v === 0 ? null : (
          <i
            key={i}
            className={cn("block h-full min-w-[2px] rounded-[2px]", TRAMO_BG[i])}
            style={{
              width: `${((v / monto) * 100).toFixed(1)}%`,
              boxShadow: "inset 0 0 0 1px var(--wallet-seg-edge)"
            }}
          />
        )
      )}
    </div>
  );
}
