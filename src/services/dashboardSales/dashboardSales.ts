import config from "@/config";
import { API } from "@/utils/api/api";
import { GenericResponse } from "@/types/global/IGlobal";
import { IDashboardSalesFilter } from "@/types/dashboardSales/IDashboardSales";

export const getDashboardSalesFilters = async (entity: string) => {
  const queryparams = new URLSearchParams({ entity });
  try {
    const response: GenericResponse<IDashboardSalesFilter> = await API.get(
      `${config.API_HOST}/dashboard/sales/filters?${queryparams.toString()}`
    );
    return response.data;
  } catch (error) {
    return error as any;
  }
};

// El export respeta los mismos filtros que la grilla de negociaciones (sin paginar).
export const downloadNegotiationsExcel = async (
  params: URLSearchParams
): Promise<{ url: string; filename: string }> => {
  const response: GenericResponse<{ url: string; filename: string }> = await API.get(
    `${config.API_HOST}/dashboard/sales/negociaciones/excel?${params.toString()}`
  );
  return response.data;
};
