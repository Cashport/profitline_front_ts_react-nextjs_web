import useSWR from "swr";

import type { GenericResponse } from "@/types/global/IGlobal";
import type { IVisitFormResponseDisplay } from "@/types/surveys/ISurveys";
import { fetcher } from "@/utils/api/api";

/** Una respuesta ya diligenciada y formateada (GET /visit-admin/responses/:response_id). */
export const useVisitFormResponseDisplay = (responseId: number | null) => {
  const { data, error, isLoading } = useSWR<GenericResponse<IVisitFormResponseDisplay>>(
    responseId !== null ? `/visit-admin/responses/${responseId}` : null,
    fetcher,
    // Una respuesta enviada no cambia: no se vuelve a pedir al recuperar el foco.
    { revalidateOnFocus: false }
  );

  return { response: data?.data, error, isLoading };
};
