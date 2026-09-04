"use client";

import { cn } from "@/utils/utils";
import { TRAMO_BG } from "../../constants";

interface DistBarProps {
  tramos: number[];
  monto: number;
}

/** Reparto de un grupo entre los seis tramos de vencimiento. */
export default function DistBar({ tramos, monto }: DistBarProps) {
  if (!monto) return null;

  return (
    <div className="flex h-[9px] w-full max-w-[80px] gap-0.5 rounded-sm">
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
