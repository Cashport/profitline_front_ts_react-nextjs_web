import useSWR from "swr";

import type { GenericResponse } from "@/types/global/IGlobal";
import type { IVisitFormCreator, IVisitFormStatusOption } from "@/types/surveys/ISurveys";
import { fetcher } from "@/utils/api/api";

/** Estados de una encuesta (GET /visit-forms/statuses): opciones del filtro y nombre del estado. */
export const useVisitFormStatuses = () => {
  const { data } = useSWR<GenericResponse<IVisitFormStatusOption[]>>(
    "/visit-forms/statuses",
    fetcher,
    { revalidateOnFocus: false }
  );
  return data?.data ?? [];
};

/** Quienes crearon encuestas del proyecto (GET /visit-forms/creators), para el filtro "Creada por". */
export const useVisitFormCreators = () => {
  const { data } = useSWR<GenericResponse<IVisitFormCreator[]>>("/visit-forms/creators", fetcher);
  return data?.data ?? [];
};
