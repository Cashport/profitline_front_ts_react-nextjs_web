"use client";

import { FileText } from "lucide-react";

import GenericEyeButton from "@/components/ui/generic-eye-button";
import SortableTh from "@/modules/walletModule/components/shared/sortable-th";
import type { SortState } from "@/modules/walletModule/types";
import type { IReport } from "@/types/reports/IReports";
import { cn } from "@/utils/utils";

import NewReportBadge from "../shared/new-report-badge";
import { fmtReportDate } from "../../utils/reports-format";

interface ReportsTableProps {
  reports: IReport[];
  sort: SortState;
  onSort: (col: string) => void;
  newReportId: number | null;
  onOpen: (reportId: number) => void;
}

/** Listado en escritorio: una fila por informe. La fecha se oculta en pantallas medianas. */
export default function ReportsTable({
  reports,
  sort,
  onSort,
  newReportId,
  onOpen
}: ReportsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr>
            <SortableTh col="nombre" label="Nombre del informe" sort={sort} onSort={onSort} />
            <SortableTh col="tipo" label="Tipo de informe" sort={sort} onSort={onSort} />
            <SortableTh
              col="fecha"
              label="Fecha de publicación"
              sort={sort}
              onSort={onSort}
              className="hidden lg:table-cell"
            />
            <th
              scope="col"
              className="border-b border-border bg-muted/40 px-3 py-2.5 text-right text-[10.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground"
            >
              Acciones
            </th>
          </tr>
        </thead>

        <tbody>
          {reports.map((r) => {
            const isNew = r.id === newReportId;

            return (
              <tr
                key={r.id}
                onClick={() => onOpen(r.id)}
                className={cn(
                  "cursor-pointer border-b border-border transition-colors last:border-b-0 hover:bg-muted/60",
                  isNew && "bg-primary/10"
                )}
              >
                <td className="px-3 py-2.5">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="truncate font-medium text-foreground">{r.name}</span>
                    {isNew && <NewReportBadge />}
                  </div>
                </td>
                <td className="px-3 py-2.5 text-muted-foreground">{r.report_type_name}</td>
                <td className="hidden whitespace-nowrap px-3 py-2.5 tabular-nums text-muted-foreground lg:table-cell">
                  {fmtReportDate(r.published_at)}
                </td>
                <td className="px-3 py-1.5">
                  <GenericEyeButton href={`/reports/${r.id}`} title="Ver informe" />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
