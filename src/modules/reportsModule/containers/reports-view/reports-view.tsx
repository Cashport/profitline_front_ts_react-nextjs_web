"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { IReportType } from "@/types/reports/IReports";

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
  const [createdType, setCreatedType] = useState<IReportType | null>(null);

  const store = useReportsListStore();
  const { reports, visibleReports, isLoading, error } = useVisibleReports();
  const { types } = useReportTypes();

  return (
    <div className="cp-page">
      <ReportsHeader
        filters={store.filters}
        onFiltersChange={store.setFilters}
        types={types}
        search={store.search}
        onSearchChange={store.setSearch}
        onPublish={() => setOpenModal("report")}
      />

      <ReportsList
        reports={visibleReports}
        total={reports?.length ?? 0}
        hasFilters={Boolean(
          store.filters.report_type_ids.length || store.filters.from || store.filters.to
        )}
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
        createdType={createdType}
        onSuccess={(report) => store.markPublished(report.id)}
      />
      {/* Al cerrarse (Cancelar o Guardar) vuelve a Publicar con lo que ya se había llenado;
          con Guardar, además, con el tipo nuevo seleccionado. */}
      <ModalCreateReportType
        isOpen={openModal === "reportType"}
        onClose={() => setOpenModal("report")}
        onSuccess={setCreatedType}
      />
    </div>
  );
}
