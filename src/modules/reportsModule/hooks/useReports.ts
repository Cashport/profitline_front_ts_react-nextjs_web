import useSWR from "swr";

import { createReport, getReports } from "@/services/reports/reports";
import type { GenericResponse } from "@/types/global/IGlobal";
import type { IPublishReportPayload, IReport } from "@/types/reports/IReports";

import { useReportsListStore } from "../stores/reports-list-store";

/**
 * Informes publicados (GET /reports), lo más reciente primero. Tipo y fecha los
 * filtra el backend con los filtros del store; la búsqueda y el orden por
 * columna quedan para useVisibleReports.
 */
export const useReports = () => {
  const filters = useReportsListStore((s) => s.filters);
  const { data, error, isLoading, mutate } = useSWR<GenericResponse<IReport[]>>(
    ["/reports", filters],
    () => getReports(filters)
  );

  const publishReport = async (payload: IPublishReportPayload) => {
    const response = await createReport(payload);
    await mutate();
    return response.data;
  };

  return { reports: data?.data, error, isLoading, publishReport };
};
