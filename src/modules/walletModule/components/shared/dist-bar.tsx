"use client";

import { cn } from "@/utils/utils";
import { TRAMO_BG } from "../../constants";
import { sumaTramos } from "../../utils/wallet-calc";

interface DistBarProps {
  tramos: number[];
  /** Tramo del drilldown: se resalta su segmento. */
  resaltar?: number | null;
  /** Sobreescribe alto y ancho: la tabla la usa compacta, el modal a lo ancho. */
  className?: string;
}

/** Reparto de un grupo entre los seis tramos de vencimiento. */
export default function DistBar({ tramos, resaltar, className }: DistBarProps) {
  // El denominador sale de los propios segmentos y no del total del grupo: al
  // pedir un `aging`, el API acota el total a ese tramo y no está definido si
  // acota también el reparto. Así la barra cierra en 100% en los dos casos.
  const suma = sumaTramos(tramos);
  if (!suma) return null;

  return (
    <div className={cn("flex h-[9px] w-full max-w-[80px] gap-0.5 rounded-sm", className)}>
      {tramos.map((v, i) =>
        v === 0 ? null : (
          <i
            key={i}
            className={cn(
              "block h-full min-w-[2px] rounded-[2px]",
              TRAMO_BG[i],
              // outline y no ring: el box-shadow del segmento ya está ocupado.
              i === resaltar && "outline outline-2 outline-offset-1 outline-wallet-accent"
            )}
            style={{
              width: `${((v / suma) * 100).toFixed(1)}%`,
              boxShadow: "inset 0 0 0 1px var(--wallet-seg-edge)"
            }}
          />
        )
      )}
    </div>
  );
}
