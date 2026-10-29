"use client";

import { useRouter } from "next/navigation";

import StatCards, { type StatCardItem } from "@/components/ui/stat-cards/stat-cards";

import SurveysHeader from "../../components/surveys-header/surveys-header";
import SurveysList from "../../components/surveys-list/surveys-list";
import { useVisitForms } from "../../hooks/useVisitForms";
import { useSurveysListStore } from "../../stores/surveys-list-store";

/**
 * Encuestas (/surveys): las encuestas del proyecto con sus totales. Cada una
 * se abre en /surveys/:id; búsqueda, filtros y orden viven en el store para
 * seguir ahí al volver.
 */
export default function SurveysView() {
  const router = useRouter();
  const store = useSurveysListStore();
  const { forms, visibleForms, totals, isLoading, error } = useVisitForms();

  const fmt = (value: number) => (isLoading ? "—" : value.toLocaleString("es-CO"));
  const cards: StatCardItem[] = [
    {
      id: "active",
      label: "Encuestas activas",
      value: fmt(totals.active),
      foot: `de ${forms?.length ?? 0} encuestas`
    },
    {
      id: "month",
      label: "Respuestas este mes",
      value: fmt(totals.monthResponses),
      foot: `${fmt(totals.responses)} en total`
    },
    {
      id: "inactive",
      label: "Inactivas",
      value: fmt(totals.inactive),
      foot: "No le aparecen al asesor en la app"
    }
  ];

  return (
    <div className="flex flex-col gap-4 pb-6">
      <SurveysHeader
        search={store.search}
        onSearchChange={store.setSearch}
        filters={store.filters}
        onFiltersChange={store.setFilters}
        onCreate={() => router.push("/surveys/new")}
      />

      <StatCards cards={cards} />

      <SurveysList
        forms={visibleForms}
        total={forms?.length ?? 0}
        hasFilters={Boolean(
          store.filters.status.length ||
            store.filters.created_by.length ||
            store.filters.from ||
            store.filters.to
        )}
        isLoading={isLoading}
        error={error}
        sort={store.sort}
        onSort={store.sortByColumn}
        onOpen={(formId) => router.push(`/surveys/${formId}`)}
        onClearCriteria={store.clearCriteria}
      />
    </div>
  );
}
