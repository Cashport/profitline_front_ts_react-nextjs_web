import { GenericResponse } from "@/types/global/IGlobal";
import {
  IApproveReturnRequest,
  IProfit360Approval,
  IProfit360ApprovalResumen,
  IProfit360Filters,
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

// GET /integration/profit360/filtros-devolucion — picklists for cliente / estado / causal
// used by the dropdowns across the reverse-logistics module. The endpoint is
// stable enough that we cache the response at the context layer instead of
// refetching per tab.
export const getProfit360Filters = async (): Promise<IProfit360Filters> => {
  try {
    const response: GenericResponse<IProfit360Filters> = await API.get(
      `/integration/profit360/filtros-devolucion`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching profit360 filters:", error);
    throw error;
  }
};

// POST /integration/profit360/returns/:returnId/approve — approves a single
// devolucion. The body's GUIDs all come from the filters endpoint; only
// `idDevolucion` / `idProductoxDocumentos` come from the devolucion itself.
export const approveReturn = async (
  returnId: string,
  body: IApproveReturnRequest
): Promise<unknown> => {
  try {
    const response = await API.post(
      `/integration/profit360/returns/${encodeURIComponent(returnId)}/approve`,
      body
    );
    return response;
  } catch (error) {
    console.error("Error approving profit360 return:", error);
    throw error;
  }
};
