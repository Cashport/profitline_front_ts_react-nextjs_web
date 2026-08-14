import { GenericResponse } from "@/types/global/IGlobal";
import {
  IApproveReturnRequest,
  IProfit360Approval,
  IProfit360DevolucionKpis,
  IProfit360ApprovalResumen,
  IProfit360Filters,
  IProfit360VisitsResponse,
} from "@/types/reverseLogistics/IReverseLogistics";
import { API } from "@/utils/api/api";


export interface GetProfit360ApprovalsParams {
  page: number;
  limit: number;
  fromDate?: string | null;
  toDate?: string | null;
  clientId?: string | null;
  // Profit360 estado `codigo` (GUID). Single-valued — the endpoint takes one.
  status?: string | null;
}

// GET /integration/profit360/approvals?page=&limit=&fromDate=&toDate=&clientId=&status=
// — the response is a plain array rather than a paginated envelope. `page`/`limit`
// are sent only because the endpoint requires them; the Aprobaciones table
// paginates the returned array client-side, so don't mistake these for backend
// pagination.
export const getProfit360Approvals = async (
  params: GetProfit360ApprovalsParams
): Promise<GenericResponse<IProfit360Approval[]>> => {
  try {
    const qs = new URLSearchParams({
      page: String(params.page),
      limit: String(params.limit)
    });
    if (params.fromDate) qs.append("fromDate", params.fromDate);
    if (params.toDate) qs.append("toDate", params.toDate);
    if (params.clientId) qs.append("clientId", params.clientId);
    if (params.status) qs.append("status", params.status);
    const response: GenericResponse<IProfit360Approval[]> = await API.get(
      `/integration/profit360/approvals?${qs.toString()}`
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
  limit: number;
  fromDate?: string | null;
  toDate?: string | null;
  clientId?: string | null;
}

// GET /integration/profit360/visits?page=&limit=&fromDate=&toDate=&clientId=
// — paginated visits list from Profit360. Each visit carries its own
// returns/devoluciones. `page`/`limit` are required by the endpoint; the rest
// are only sent when the user has actually picked a value. The endpoint also
// accepts `status`, but the Devoluciones tab offers no estado filter yet.
export const getProfit360Visits = async (
  params: GetProfit360VisitsParams
): Promise<IProfit360VisitsResponse>=> {
  try {
    const qs = new URLSearchParams({
      page: String(params.page),
      limit: String(params.limit)
    });
    if (params.fromDate) qs.append("fromDate", params.fromDate);
    if (params.toDate) qs.append("toDate", params.toDate);
    if (params.clientId) qs.append("clientId", params.clientId);
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

export interface GetProfit360DevolucionKpisParams {
  fromDate?: string | null;
  toDate?: string | null;
  clientId?: string | null;
}

// GET /integration/profit360/kpis-devolucion?clientId=&fromDate=&toDate=
// — per-phase average days (F1 embalaje/ticket … F4 nota crédito) plus the
// end-to-end total. All query params are optional; only send the ones the user
// actually picked so the backend falls back to its own defaults.
export const getProfit360DevolucionKpis = async (
  params: GetProfit360DevolucionKpisParams = {}
): Promise<IProfit360DevolucionKpis> => {
  try {
    const qs = new URLSearchParams();
    if (params.clientId) qs.append("clientId", params.clientId);
    if (params.fromDate) qs.append("fromDate", params.fromDate);
    if (params.toDate) qs.append("toDate", params.toDate);
    const query = qs.toString();
    const response: GenericResponse<IProfit360DevolucionKpis> = await API.get(
      `/integration/profit360/kpis-devolucion${query ? `?${query}` : ""}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching profit360 devolucion KPIs:", error);
    throw error;
  }
};
