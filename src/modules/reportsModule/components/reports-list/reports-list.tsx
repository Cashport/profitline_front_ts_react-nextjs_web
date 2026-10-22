"use client";

import ProfitLoader from "@/components/ui/profit-loader";
import type { SortState } from "@/modules/walletModule/types";
import type { IReport } from "@/types/reports/IReports";

import ReportCard from "../report-card/report-card";
import ReportsTable from "../reports-table/reports-table";
import { fmtReportsCount } from "../../utils/reports-format";

interface ReportsListProps {
  /** Los que quedan tras búsqueda y filtros, ya ordenados. */
  reports: IReport[];
  /** Todos los publicados, para el contador "2 de 5". */
  total: number;
  isLoading: boolean;
  error?: Error;
  sort: SortState;
  onSort: (col: string) => void;
  newReportId: number | null;
  onOpen: (reportId: number) => void;
  onClearCriteria: () => void;
}

/** Tarjeta "Informes publicados": tabla en escritorio y tarjetas en pantallas angostas. */
export default function ReportsList({
  reports,
  total,
  isLoading,
  error,
  sort,
  onSort,
  newReportId,
  onOpen,
  onClearCriteria
}: ReportsListProps) {
  const renderContent = () => {
    if (isLoading) return <ProfitLoader size="small" />;
    if (error) {
      return (
        <p className="p-9 text-center text-sm text-destructive">
          {error.message || "No se pudieron cargar los informes."}
        </p>
      );
    }
    if (!total) {
      return (
        <p className="p-9 text-center text-sm text-muted-foreground">
          Aún no hay informes publicados.
        </p>
      );
    }
    if (!reports.length) {
      return (
        <div className="flex flex-col items-center gap-2 p-9 text-center">
          <p className="text-[13.5px] font-semibold text-foreground">
            No hay informes con esos criterios
          </p>
          <button
            type="button"
            onClick={onClearCriteria}
            className="text-[13px] font-medium text-[#1677ff] hover:underline"
          >
            Limpiar búsqueda y filtros
          </button>
        </div>
      );
    }

    return (
      <>
        <div className="hidden md:block">
          <ReportsTable
            reports={reports}
            sort={sort}
            onSort={onSort}
            newReportId={newReportId}
            onOpen={onOpen}
          />
        </div>
        <div className="flex flex-col gap-2 md:hidden">
          {reports.map((r) => (
            <ReportCard key={r.id} report={r} isNew={r.id === newReportId} />
          ))}
        </div>
      </>
    );
  };

  return (
    <section className="rounded-xl bg-card p-4 shadow-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-2.5 px-1 pb-3">
        <h2 className="text-sm font-semibold text-foreground">Informes publicados</h2>
        {!isLoading && !error && (
          <span className="text-xs text-muted-foreground">
            {fmtReportsCount(reports.length, total)}
          </span>
        )}
      </div>
      {renderContent()}
    </section>
  );
}
