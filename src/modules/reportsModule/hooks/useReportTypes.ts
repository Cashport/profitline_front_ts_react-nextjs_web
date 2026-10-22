import useSWR from "swr";

import { createReportType } from "@/services/reports/reports";
import type { GenericResponse } from "@/types/global/IGlobal";
import type { IReportType } from "@/types/reports/IReports";
import { fetcher } from "@/utils/api/api";

/** Catálogo de tipos de informe del proyecto (GET /reports/types), ordenado por nombre. */
export const useReportTypes = () => {
  const { data, error, isLoading, mutate } = useSWR<GenericResponse<IReportType[]>>(
    "/reports/types",
    fetcher
  );

  /** Crea el tipo y espera el catálogo nuevo, para que ya esté en el select al volver. */
  const createType = async (name: string) => {
    const response = await createReportType(name);
    await mutate();
    return response.data;
  };

  return { types: data?.data ?? [], error, isLoading, createType };
};
