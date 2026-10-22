"use client";

import { useRouter } from "next/navigation";

import ReportDetailHeader from "../../components/report-detail-header/report-detail-header";
import ReportViewer from "../../components/report-viewer/report-viewer";
import { useReportDetail } from "../../hooks/useReportDetail";
import { useVisibleReports } from "../../hooks/useVisibleReports";

interface ReportDetailViewProps {
  /** UUID del informe: es el que se consulta. */
  reportId: string;
}

/**
 * Detalle de un informe (/reports/:id): encabezado con navegación y el HTML que
 * manda el backend. Anterior/siguiente siguen el orden del listado (búsqueda,
 * filtros y orden del store); con un link directo, todos del más reciente.
 */
export default function ReportDetailView({ reportId }: ReportDetailViewProps) {
  const router = useRouter();
  const { report, isLoading, error } = useReportDetail(reportId);
  const { visibleReports } = useVisibleReports();

  const index = visibleReports.findIndex((r) => r.id === reportId);
  // replace: el "atrás" del navegador vuelve al listado, no recorre cada informe visto.
  const goTo = (i: number) => router.replace(`/reports/${visibleReports[i].id}`);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 pb-6">
      <ReportDetailHeader
        report={report}
        position={index >= 0 ? { index, total: visibleReports.length } : null}
        onPrev={() => index > 0 && goTo(index - 1)}
        onNext={() => index >= 0 && index < visibleReports.length - 1 && goTo(index + 1)}
      />
      <ReportViewer
        title={report?.name ?? "Informe"}
        html={report?.html}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
}
