import useSWR from "swr";

import type { GenericResponse } from "@/types/global/IGlobal";
import type { IPublishReportPayload, IReport } from "@/types/reports/IReports";

import { getReportsMock, publishReportMock } from "../mocks/reports-mock";

/**
 * Informes publicados (GET /reports). Por ahora sale del mock: al conectar el
 * backend se cambia el fetcher por `fetcher` y la publicación por su servicio.
 */
export const useReports = () => {
  const { data, error, isLoading, mutate } = useSWR<GenericResponse<IReport[]>>(
    "/reports",
    getReportsMock
  );

  const publishReport = async (payload: IPublishReportPayload) => {
    const response = await publishReportMock(payload);
    await mutate();
    return response.data;
  };

  return { reports: data?.data, error, isLoading, publishReport };
};
