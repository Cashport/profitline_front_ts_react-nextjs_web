"use client";

import { useTranslations } from "use-intl";

import ProfitLoader from "@/components/ui/profit-loader";
import type { SortState } from "@/modules/walletModule/types";
import type { IVisitFormListItem } from "@/types/surveys/ISurveys";

import SurveyCard from "../survey-card/survey-card";
import SurveysTable from "../surveys-table/surveys-table";

interface SurveysListProps {
  /** Las que quedan tras la búsqueda, ya ordenadas. */
  forms: IVisitFormListItem[];
  /** Las que devuelve el backend con los filtros, para el contador "2 de 5". */
  total: number;
  /** Hay filtros aplicados: un listado vacío es por ellos, no porque no haya encuestas. */
  hasFilters: boolean;
  isLoading: boolean;
  error?: Error;
  sort: SortState;
  onSort: (col: string) => void;
  onOpen: (formId: number) => void;
  onClearCriteria: () => void;
}

/** Tarjeta del listado: tabla en escritorio y tarjetas en pantallas angostas. */
export default function SurveysList({
  forms,
  total,
  hasFilters,
  isLoading,
  error,
  sort,
  onSort,
  onOpen,
  onClearCriteria
}: SurveysListProps) {
  const t = useTranslations("surveys.list");
  /** "5 encuestas", o "2 de 5 encuestas" cuando la búsqueda recorta el listado. */
  const countLabel =
    forms.length === total
      ? t("count", { total })
      : t("countFiltered", { shown: forms.length, total });

  const renderContent = () => {
    if (isLoading) return <ProfitLoader size="small" />;
    if (error) {
      return (
        <p className="p-9 text-center text-sm text-destructive">
          {error.message || t("loadError")}
        </p>
      );
    }
    if (!total && !hasFilters) {
      return <p className="p-9 text-center text-sm text-muted-foreground">{t("empty")}</p>;
    }
    if (!forms.length) {
      return (
        <div className="flex flex-col items-center gap-2 p-9 text-center">
          <p className="text-[13.5px] font-semibold text-foreground">{t("noMatch")}</p>
          <button
            type="button"
            onClick={onClearCriteria}
            className="text-[13px] font-medium text-[#1677ff] hover:underline"
          >
            {t("clearCriteria")}
          </button>
        </div>
      );
    }

    return (
      <>
        <div className="hidden md:block">
          <SurveysTable forms={forms} sort={sort} onSort={onSort} onOpen={onOpen} />
        </div>
        <div className="flex flex-col gap-2 md:hidden">
          {forms.map((f) => (
            <SurveyCard key={f.id} form={f} />
          ))}
        </div>
      </>
    );
  };

  return (
    <section className="cp-card px-[18px] pb-[14px]">
      <div className="flex h-[var(--table-title-h)] items-center justify-between gap-2.5">
        <h2 className="text-[18px] font-semibold text-cp-ink">{t("title")}</h2>
        {!isLoading && !error && <span className="text-[14px] text-cp-ink-4">{countLabel}</span>}
      </div>
      {renderContent()}
    </section>
  );
}
