"use client";

import type { ReactNode } from "react";
import { useTranslations } from "use-intl";

import { fac, fmtM } from "@/modules/walletModule/utils/format";
import type { IIncidentListSummary } from "@/types/novelties/INovelties";

interface NoveltiesToolbarProps {
  /** Total del universo filtrado, no de la página. */
  totalRows: number;
  summary?: IIncidentListSummary;
  /** Controles a la derecha del resumen (p. ej. el selector Lista / Tablero). */
  actions?: ReactNode;
}

/** Resumen de la vista filtrada y sus controles, alineados a la derecha. */
export default function NoveltiesToolbar({ totalRows, summary, actions }: NoveltiesToolbarProps) {
  const t = useTranslations("novelties.toolbar");
  return (
    <div className="flex flex-wrap items-center gap-3.5">
      <span className="ml-auto text-[13px] text-muted-foreground">
        {t("summary", {
          count: totalRows,
          amount: fmtM(summary?.total_amount ?? 0),
          invoices: fac(summary?.total_invoices ?? 0)
        })}
      </span>
      {actions}
    </div>
  );
}
