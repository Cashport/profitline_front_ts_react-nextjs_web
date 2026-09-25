"use client";

import { fac, fmtM } from "@/modules/walletModule/utils/format";
import type { IIncidentListSummary } from "@/types/novelties/INovelties";

interface NoveltiesToolbarProps {
  /** Total del universo filtrado, no de la página. */
  totalRows: number;
  summary?: IIncidentListSummary;
}

/** Resumen de la vista filtrada, alineado a la derecha. */
export default function NoveltiesToolbar({ totalRows, summary }: NoveltiesToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="ml-auto text-[11.5px] text-muted-foreground">
        {totalRows} novedades · {fmtM(summary?.total_amount ?? 0)} ·{" "}
        {fac(summary?.total_invoices ?? 0)} vinculadas
      </span>
    </div>
  );
}
