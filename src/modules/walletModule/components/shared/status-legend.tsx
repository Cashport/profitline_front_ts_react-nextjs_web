"use client";

import { cn } from "@/utils/utils";
import { EST_META, ORDEN_EST } from "../../constants";

/** Leyenda de los cinco estados que pintan las barras de la matriz. */
export default function StatusLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[11.5px] text-muted-foreground">
      {ORDEN_EST.map((e) => (
        <span key={e} className="inline-flex items-center gap-1.5">
          <i
            className={cn("inline-block h-2.5 w-2.5 rounded-[3px]", EST_META[e].bg)}
            style={{ boxShadow: "inset 0 0 0 1px var(--wallet-seg-edge)" }}
          />
          {EST_META[e].nom}
        </span>
      ))}
    </div>
  );
}
