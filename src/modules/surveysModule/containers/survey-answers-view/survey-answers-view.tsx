"use client";

import { useState } from "react";
import { useTranslations } from "use-intl";

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
  const t = useTranslations("surveys.answers");
  const { form } = useVisitForm(formId);
  const { responsesPage, page, setPage, isLoading, error } = useVisitFormResponses(formId);
  const [openResponseId, setOpenResponseId] = useState<number | null>(null);

  const responses = responsesPage?.data ?? [];
  const total = responsesPage?.total ?? 0;
  const fmt = (value?: number) => (value === undefined ? "—" : value.toLocaleString("es-CO"));
  const cards: StatCardItem[] = [
    {
      id: "total",
      label: t("stats.total"),
      value: fmt(responsesPage?.total),
      foot: t("stats.totalFoot")
    },
    {
      id: "month",
      label: t("stats.month"),
      value: fmt(responsesPage?.month_total),
      foot: t("stats.monthFoot")
    },
    {
      id: "users",
      label: t("stats.users"),
      value: fmt(responsesPage?.user_count),
      foot: t("stats.usersFoot")
    }
  ];

  const renderContent = () => {
    if (isLoading && !responsesPage) return <ProfitLoader size="small" />;
    if (error) {
      return (
        <p className="p-9 text-center text-sm text-destructive">
          {error.message || t("loadError")}
        </p>
      );
    }
    if (!total) {
      return <p className="p-9 text-center text-sm text-muted-foreground">{t("empty")}</p>;
    }
    return <ResponsesTable responses={responses} onOpen={setOpenResponseId} />;
  };

  return (
    <div className="flex flex-col gap-4 pb-6">
      <SurveyPageHeader
        backHref={`/surveys/${formId}`}
        backLabel={form?.name ?? t("backFallback")}
        title={t("title")}
      />

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_400px]">
        <StatCards cards={cards} />
        <ResponsesDownloadCard formId={formId} />
      </div>

      <section className="flex flex-col gap-3 rounded-xl bg-card p-4 shadow-sm">
        <div className="flex flex-wrap items-baseline justify-between gap-2.5 px-1">
          <h2 className="text-sm font-semibold text-foreground">{t("recent")}</h2>
          {responsesPage && (
            <span className="text-[13px] text-muted-foreground">
              {t("showing", { shown: responses.length, total: total.toLocaleString("es-CO") })}
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
