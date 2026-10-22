import useSWR from "swr";

import type { GenericResponse } from "@/types/global/IGlobal";
import type { IReportDetail } from "@/types/reports/IReports";

import { getReportDetailMock } from "../mocks/reports-mock";

/** Un informe con su HTML (GET /reports/:id). Sin id no se pide nada. Por ahora, mock. */
export const useReportDetail = (reportId: number | null) => {
  const { data, error, isLoading } = useSWR<GenericResponse<IReportDetail>>(
    reportId ? `/reports/${reportId}` : null,
    () => getReportDetailMock(reportId as number)
  );

  return { report: data?.data, error, isLoading };
};
