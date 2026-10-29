import { useState } from "react";
import useSWR from "swr";

import type { GenericResponse } from "@/types/global/IGlobal";
import type { IVisitFormResponsesPage } from "@/types/surveys/ISurveys";
import { fetcher } from "@/utils/api/api";

import { RESPONSES_PAGE_SIZE } from "../constants";

/** Respuestas de la encuesta, la más reciente primero, de a una página, con los totales de la encuesta. */
export const useVisitFormResponses = (formId: number) => {
  const [page, setPage] = useState(1);
  const { data, error, isLoading } = useSWR<GenericResponse<IVisitFormResponsesPage>>(
    `/visit-forms/${formId}/responses?page=${page}&limit=${RESPONSES_PAGE_SIZE}`,
    fetcher,
    // Al cambiar de página se sigue viendo la anterior hasta que llega la nueva.
    { keepPreviousData: true }
  );

  return { responsesPage: data?.data, page, setPage, error, isLoading };
};
