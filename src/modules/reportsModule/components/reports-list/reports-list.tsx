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
  /** Los que devuelve el backend con los filtros de tipo y fecha, para el contador "2 de 5". */
  total: number;
  /** Hay filtros de tipo o fecha: un listado vacío es por ellos, no porque no haya informes. */
  hasFilters: boolean;
  isLoading: boolean;
  error?: Error;
  sort: SortState;
  onSort: (col: string) => void;
  newReportId: string | null;
  onOpen: (reportId: string) => void;
  onClearCriteria: () => void;
}

/** Tarjeta del listado de informes: tabla en escritorio y tarjetas en pantallas angostas. */
export default function ReportsList({
  reports,
  total,
  hasFilters,
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
    if (!total && !hasFilters) {
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
    <section className="cp-card px-[18px] py-[14px]">
      {/* Sin título: el buscador va en el header (docs/DESIGN.md §4). El contador va al pie de
          la tabla, no arriba. */}
      {renderContent()}
      {!isLoading && !error && reports.length > 0 && (
        <div className="flex justify-end pt-3">
          <span className="whitespace-nowrap text-[13px] text-muted-foreground">
            {fmtReportsCount(reports.length, total)}
          </span>
        </div>
      )}
    </section>
  );
}
