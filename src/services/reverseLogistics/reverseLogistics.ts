import { GenericResponse } from "@/types/global/IGlobal";
import {
  IApproval,
  IApprovalProduct,
  IProfit360Approval,
  IProfit360ApprovalResumen,
  IProfit360VisitsResponse,
  IReturn
} from "@/types/reverseLogistics/IReverseLogistics";
import { API } from "@/utils/api/api";
import { mockApprovalProducts, mockApprovals, mockReturns } from "./mocks";

export const getReturns = async (): Promise<GenericResponse<IReturn[]>> => {
  try {
    // TODO real data:
    // const response: GenericResponse<IReturn[]> = await API.get(`/reverse-logistics/returns`);
    // return response;
    return { status: 200, message: "Returns retrieved", success: true, data: mockReturns };
  } catch (error) {
    console.error("Error fetching reverse-logistics returns:", error);
    throw error;
  }
};

export const getApprovals = async (): Promise<GenericResponse<IApproval[]>> => {
  try {
    // TODO real data:
    // const response: GenericResponse<IApproval[]> = await API.get(`/reverse-logistics/approvals`);
    // return response;
    return { status: 200, message: "Approvals retrieved", success: true, data: mockApprovals };
  } catch (error) {
    console.error("Error fetching reverse-logistics approvals:", error);
    throw error;
  }
};

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
      `/integration/profit360/approvals/${encodeURIComponent(id)}/resumen`
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

export const getApprovalProducts = async (
  _approvalId: number
): Promise<GenericResponse<IApprovalProduct[]>> => {
  try {
    // TODO real data:
    // const response: GenericResponse<IApprovalProduct[]> = await API.get(
    //   `/reverse-logistics/approvals/${_approvalId}/products`
    // );
    // return response;
    return {
      status: 200,
      message: "Approval products retrieved",
      success: true,
      data: mockApprovalProducts
    };
  } catch (error) {
    console.error("Error fetching reverse-logistics approval products:", error);
    throw error;
  }
};
