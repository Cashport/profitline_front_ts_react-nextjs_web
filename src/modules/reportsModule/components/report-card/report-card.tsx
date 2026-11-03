"use client";

import GenericEyeButton from "@/components/ui/generic-eye-button";
import type { IReport } from "@/types/reports/IReports";
import { cn } from "@/utils/utils";

import NewReportBadge from "../shared/new-report-badge";
import { fmtReportDate } from "../../utils/reports-format";

interface ReportCardProps {
  report: IReport;
  isNew: boolean;
}

/** Fila del listado en pantallas angostas, donde la tabla no cabe. */
export default function ReportCard({ report, isNew }: ReportCardProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border border-border px-3.5 py-3",
        isNew && "bg-primary/10"
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate text-[13.5px] font-semibold text-foreground">
            {report.name}
          </span>
          {isNew && <NewReportBadge />}
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[13px] text-muted-foreground">
          <span>{report.report_type_name}</span>
          <span>{fmtReportDate(report.created_at)}</span>
        </div>
      </div>

      <GenericEyeButton href={`/reports/${report.id}`} title="Ver informe" className="shrink-0" />
    </div>
  );
}
