"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import Header from "@/components/organisms/header";
import type { IReport } from "@/types/reports/IReports";

import { fmtReportDate } from "../../utils/reports-format";

/** Posición del informe abierto dentro del listado filtrado y ordenado. */
interface IReportPosition {
  index: number;
  total: number;
}

const NAV_BUTTON_CLASS =
  "flex h-[var(--control-h)] w-[var(--control-h)] items-center justify-center rounded-lg border border-border bg-card text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:text-muted-foreground/50 disabled:hover:bg-card";

interface ReportDetailHeaderProps {
  /** undefined mientras llega el detalle. */
  report?: IReport;
  /** null si el informe no está en el listado filtrado: no hay anterior ni siguiente. */
  position: IReportPosition | null;
  onPrev: () => void;
  onNext: () => void;
}

/**
 * Header compartido del detalle (docs/DESIGN.md §4): "‹" vuelve al listado, título con el tipo y
 * la fecha de publicación; a la derecha la navegación entre informes y el avatar.
 */
export default function ReportDetailHeader({
  report,
  position,
  onPrev,
  onNext
}: ReportDetailHeaderProps) {
  const hasPrev = !!position && position.index > 0;
  const hasNext = !!position && position.index < position.total - 1;

  return (
    <Header
      title={report?.name ?? "Informe"}
      back="/reports"
      titleNode={
        report ? undefined : (
          <span className="h-6 w-56 max-w-full animate-pulse rounded-md bg-secondary" />
        )
      }
      titleExtra={
        report && (
          <span className="flex items-center gap-3">
            <span className="font-semibold text-foreground">{report.report_type_name}</span>
            <span>Publicado {fmtReportDate(report.created_at)}</span>
          </span>
        )
      }
      actionsExtra={
        <>
          <button
            type="button"
            title="Informe anterior"
            aria-label="Informe anterior"
            disabled={!hasPrev}
            onClick={onPrev}
            className={NAV_BUTTON_CLASS}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            title="Informe siguiente"
            aria-label="Informe siguiente"
            disabled={!hasNext}
            onClick={onNext}
            className={NAV_BUTTON_CLASS}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          {position && (
            <span className="mr-1.5 whitespace-nowrap text-[13px] text-muted-foreground">
              {position.index + 1} de {position.total}
            </span>
          )}
        </>
      }
    />
  );
}
