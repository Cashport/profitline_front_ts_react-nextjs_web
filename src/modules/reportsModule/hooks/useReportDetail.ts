import useSWR from "swr";

import type { GenericResponse } from "@/types/global/IGlobal";
import type { IReportDetail } from "@/types/reports/IReports";
import { fetcher } from "@/utils/api/api";

/** Un informe con su HTML (GET /reports/:id). */
export const useReportDetail = (reportId: string) => {
  const { data, error, isLoading } = useSWR<GenericResponse<IReportDetail>>(
    `/reports/${reportId}`,
    fetcher,
    // Un informe publicado no cambia: no se vuelve a bajar su HTML al volver a la pestaña.
    { revalidateOnFocus: false }
  );

  return { report: data?.data, error, isLoading };
};
