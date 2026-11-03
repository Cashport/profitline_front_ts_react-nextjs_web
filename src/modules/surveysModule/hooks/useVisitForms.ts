import { useMemo } from "react";
import useSWR from "swr";
import { useShallow } from "zustand/react/shallow";

import { ordenar } from "@/modules/walletModule/utils/wallet-calc";
import { getVisitForms } from "@/services/surveys/surveys";
import type { GenericResponse } from "@/types/global/IGlobal";
import type { IVisitFormListItem } from "@/types/surveys/ISurveys";

import { useSurveysListStore } from "../stores/surveys-list-store";

/**
 * Encuestas del proyecto (GET /visit-forms). Estado, creador y fecha los filtra
 * el backend con los filtros del store; la búsqueda por nombre y el orden por
 * columna se aplican aquí. Los totales de las tarjetas salen de lo filtrado.
 */
export const useVisitForms = () => {
  const { search, filters, sort } = useSurveysListStore(
    useShallow((s) => ({ search: s.search, filters: s.filters, sort: s.sort }))
  );
  const { data, error, isLoading } = useSWR<GenericResponse<IVisitFormListItem[]>>(
    ["/visit-forms", filters],
    () => getVisitForms(filters)
  );
  const forms = data?.data;

  const visibleForms = useMemo(() => {
    const q = search.trim().toLowerCase();
    const found = (forms ?? []).filter((f) => !q || f.name.toLowerCase().includes(q));
    // Las columnas son campos de IVisitFormListItem; las fechas son ISO UTC de ancho
    // fijo, así que como texto ordenan igual que como fecha.
    return ordenar(found, sort, (f) => f[sort.col as keyof IVisitFormListItem] ?? "");
  }, [forms, search, sort]);

  const totals = useMemo(
    () => ({
      active: (forms ?? []).filter((f) => f.status === "ACTIVE").length,
      inactive: (forms ?? []).filter((f) => f.status === "INACTIVE").length,
      monthResponses: (forms ?? []).reduce((acc, f) => acc + f.month_response_count, 0),
      responses: (forms ?? []).reduce((acc, f) => acc + f.response_count, 0)
    }),
    [forms]
  );

  return { forms, visibleForms, totals, error, isLoading };
};
