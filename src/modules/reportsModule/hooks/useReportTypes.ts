import useSWR from "swr";

import type { GenericResponse } from "@/types/global/IGlobal";
import type { IReportType } from "@/types/reports/IReports";

import { getReportTypesMock } from "../mocks/reports-mock";

/** Catálogo de tipos de informe (GET /reports/types). Por ahora, mock. */
export const useReportTypes = () => {
  const { data, error, isLoading } = useSWR<GenericResponse<IReportType[]>>(
    "/reports/types",
    getReportTypesMock
  );

  return { types: data?.data ?? [], error, isLoading };
};
