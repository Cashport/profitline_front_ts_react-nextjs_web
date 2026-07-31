import { GenericResponse } from "@/types/global/IGlobal";
import { IApproval, IApprovalProduct, IReturn } from "@/types/reverseLogistics/IReverseLogistics";
import { mockApprovalProducts, mockApprovals, mockReturns } from "./mocks";

// NOTE: This module is currently mock-backed. To switch to real data, replace the
// mock return with the commented `API` call (and add `import { API } from "@/utils/api/api";`).

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
