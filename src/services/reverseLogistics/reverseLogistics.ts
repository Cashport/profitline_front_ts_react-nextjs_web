import { GenericResponse } from "@/types/global/IGlobal";
import {
  IProfit360Approval,
  IProfit360ApprovalResumen,
  IProfit360VisitsResponse,
} from "@/types/reverseLogistics/IReverseLogistics";
import { API } from "@/utils/api/api";


// GET /integration/profit360/approvals?from=YYYY-MM-DD — real Profit360
// integration endpoint used by the Aprobaciones tab. Returns the list of
// approvals registered on (or after) the given date.
export const getProfit360Approvals = async (
  from: string
): Promise<GenericResponse<IProfit360Approval[]>> => {
  try {
    const response: GenericResponse<IProfit360Approval[]> = await API.get(
      `/integration/profit360/approvals?from=${encodeURIComponent(from)}`
    );
    return response;
  } catch (error) {
    console.error("Error fetching profit360 approvals:", error);
    throw error;
  }
};

// GET /integration/profit360/approvals/{id}/resumen — full approval detail,
// including the products x document (documentos) and the 5% rule summary.
export const getProfit360ApprovalResumen = async (
  id: string
): Promise<GenericResponse<IProfit360ApprovalResumen>> => {
  try {
    const response: GenericResponse<IProfit360ApprovalResumen> = await API.get(
      `/integration/profit360/approvals/${encodeURIComponent(id)}/resumen?page=1&limit=10`
    );
    return response;
  } catch (error) {
    console.error("Error fetching profit360 approval resumen:", error);
    throw error;
  }
};

export interface GetProfit360VisitsParams {
  page: number;
  fromDate: string;
  toDate: string;
  limit: number;
}

// GET /integration/profit360/visits?page=&fromDate=&toDate=&limit= — paginated
// visits list from Profit360. Each visit carries its own returns/devoluciones.
export const getProfit360Visits = async (
  params: GetProfit360VisitsParams
): Promise<IProfit360VisitsResponse>=> {
  try {
    const qs = new URLSearchParams({
      page: String(params.page),
      fromDate: params.fromDate,
      toDate: params.toDate,
      limit: String(params.limit)
    });
    const response: IProfit360VisitsResponse = await API.get(
      `/integration/profit360/visits?${qs.toString()}`
    );
    return response;
  } catch (error) {
    console.error("Error fetching profit360 visits:", error);
    throw error;
  }
};
