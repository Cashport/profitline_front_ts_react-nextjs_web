"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { ModalCreateReport } from "../../components/ModalCreateReport/ModalCreateReport";
import { ModalCreateReportType } from "../../components/ModalCreateReportType/ModalCreateReportType";
import ReportsHeader from "../../components/reports-header/reports-header";
import ReportsList from "../../components/reports-list/reports-list";
import { useReportTypes } from "../../hooks/useReportTypes";
import { useVisibleReports } from "../../hooks/useVisibleReports";
import { useReportsListStore } from "../../stores/reports-list-store";

/** Sólo un modal abierto a la vez: "+ Crear tipo" cambia uno por el otro. */
type OpenModal = "report" | "reportType" | null;

/**
 * Informes (/reports): listado de informes publicados. Cada informe se abre en
 * /reports/:id; búsqueda, filtros y orden viven en el store para seguir ahí al volver.
 */
export default function ReportsView() {
  const router = useRouter();
  const [openModal, setOpenModal] = useState<OpenModal>(null);

  const store = useReportsListStore();
  const { reports, visibleReports, isLoading, error } = useVisibleReports();
  const { types } = useReportTypes();

  return (
    <div className="flex flex-col gap-4 pb-6">
      <ReportsHeader
        search={store.search}
        onSearchChange={store.setSearch}
        filters={store.filters}
        onFiltersChange={store.setFilters}
        types={types}
        onPublish={() => setOpenModal("report")}
      />

      <ReportsList
        reports={visibleReports}
        total={reports?.length ?? 0}
        isLoading={isLoading}
        error={error}
        sort={store.sort}
        onSort={store.sortByColumn}
        newReportId={store.newReportId}
        onOpen={(reportId) => router.push(`/reports/${reportId}`)}
        onClearCriteria={store.clearCriteria}
      />

      <ModalCreateReport
        isOpen={openModal === "report"}
        types={types}
        onClose={() => setOpenModal(null)}
        onCreateType={() => setOpenModal("reportType")}
        onSuccess={(report) => store.markPublished(report.id)}
      />
      {/* Al cerrarse (Cancelar o Guardar) vuelve a Publicar con lo que ya se había llenado. */}
      <ModalCreateReportType
        isOpen={openModal === "reportType"}
        onClose={() => setOpenModal("report")}
      />
    </div>
  );
}
