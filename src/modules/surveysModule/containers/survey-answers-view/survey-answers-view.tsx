"use client";

import { useState } from "react";

import Pagination from "@/components/ui/pagination";
import ProfitLoader from "@/components/ui/profit-loader";
import StatCards, { type StatCardItem } from "@/components/ui/stat-cards/stat-cards";

import ResponsesDownloadCard from "../../components/responses-download-card/responses-download-card";
import ResponsesTable from "../../components/responses-table/responses-table";
import SurveyPageHeader from "../../components/survey-page-header/survey-page-header";
import SurveyResponseModal from "../../components/survey-response-modal/survey-response-modal";
import { RESPONSES_PAGE_SIZE } from "../../constants";
import { useVisitForm } from "../../hooks/useVisitForm";
import { useVisitFormResponses } from "../../hooks/useVisitFormResponses";

/**
 * Respuestas de una encuesta (/surveys/:id/answers): totales, descarga por
 * periodo y el listado paginado; cada fila abre la respuesta completa.
 */
export default function SurveyAnswersView({ formId }: { formId: number }) {
  const { form } = useVisitForm(formId);
  const { responsesPage, page, setPage, isLoading, error } = useVisitFormResponses(formId);
  const [openResponseId, setOpenResponseId] = useState<number | null>(null);

  const responses = responsesPage?.data ?? [];
  const total = responsesPage?.total ?? 0;
  const fmt = (value?: number) => (value === undefined ? "—" : value.toLocaleString("es-CO"));
  const cards: StatCardItem[] = [
    {
      id: "total",
      label: "Total respuestas",
      value: fmt(responsesPage?.total),
      foot: "Completas y parciales"
    },
    {
      id: "month",
      label: "Este mes",
      value: fmt(responsesPage?.month_total),
      foot: "Desde el día 1"
    },
    {
      id: "users",
      label: "Asesores",
      value: fmt(responsesPage?.user_count),
      foot: "Han respondido la encuesta"
    }
  ];

  const renderContent = () => {
    if (isLoading && !responsesPage) return <ProfitLoader size="small" />;
    if (error) {
      return (
        <p className="p-9 text-center text-sm text-destructive">
          {error.message || "No se pudieron cargar las respuestas."}
        </p>
      );
    }
    if (!total) {
      return (
        <p className="p-9 text-center text-sm text-muted-foreground">
          Esta encuesta aún no tiene respuestas.
        </p>
      );
    }
    return <ResponsesTable responses={responses} onOpen={setOpenResponseId} />;
  };

  return (
    <div className="flex flex-col gap-4 pb-6">
      <SurveyPageHeader
        backHref={`/surveys/${formId}`}
        backLabel={form?.name ?? "Encuesta"}
        title="Respuestas"
      />

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_400px]">
        <StatCards cards={cards} />
        <ResponsesDownloadCard formId={formId} />
      </div>

      <section className="flex flex-col gap-3 rounded-xl bg-card p-4 shadow-sm">
        <div className="flex flex-wrap items-baseline justify-between gap-2.5 px-1">
          <h2 className="text-sm font-semibold text-foreground">Respuestas recientes</h2>
          {responsesPage && (
            <span className="text-xs text-muted-foreground">
              Mostrando {responses.length} de {total.toLocaleString("es-CO")}
            </span>
          )}
        </div>
        {renderContent()}
        {total > RESPONSES_PAGE_SIZE && (
          <Pagination
            currentPage={page}
            totalItems={total}
            pageSize={RESPONSES_PAGE_SIZE}
            onPageChange={setPage}
            showResultsText={false}
            isLoading={isLoading}
          />
        )}
      </section>

      <SurveyResponseModal responseId={openResponseId} onClose={() => setOpenResponseId(null)} />
    </div>
  );
}
