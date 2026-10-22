"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { ProfileMenu } from "@/components/atoms/ProfileMenu/ProfileMenu";
import type { IReport } from "@/types/reports/IReports";

import { fmtReportDate } from "../../utils/reports-format";
import type { IReportPosition } from "../../types";

const NAV_BUTTON_CLASS =
  "flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:text-muted-foreground/50 disabled:hover:bg-card";

interface ReportDetailHeaderProps {
  /** undefined mientras llega el detalle. */
  report?: IReport;
  /** null si el informe no está en el listado filtrado: no hay anterior ni siguiente. */
  position: IReportPosition | null;
  onPrev: () => void;
  onNext: () => void;
}

/** Barra del detalle: volver al listado, datos del informe y navegación entre informes. */
export default function ReportDetailHeader({
  report,
  position,
  onPrev,
  onNext
}: ReportDetailHeaderProps) {
  const hasPrev = !!position && position.index > 0;
  const hasNext = !!position && position.index < position.total - 1;

  return (
    <header className="flex flex-wrap items-center gap-3.5 pb-3 max-[768px]:px-2">
      <Link
        href="/reports"
        title="Volver a Informes"
        className="flex shrink-0 items-center gap-1 text-sm text-[#666666] transition-colors hover:text-[#141414]"
      >
        <ChevronLeft className="h-4 w-4" />
        Informes
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        {report ? (
          <>
            <h1 className="truncate text-2xl font-semibold text-foreground">{report.name}</h1>
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{report.report_type_name}</span>
              <span>Publicado {fmtReportDate(report.published_at)}</span>
            </div>
          </>
        ) : (
          <span className="h-7 w-56 max-w-full animate-pulse rounded-md bg-secondary" />
        )}
      </div>

      <div className="ml-auto flex items-center gap-2">
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
          <span className="mr-1.5 whitespace-nowrap text-xs text-muted-foreground">
            {position.index + 1} de {position.total}
          </span>
        )}
        <ProfileMenu />
      </div>
    </header>
  );
}
