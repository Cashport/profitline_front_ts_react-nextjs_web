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
