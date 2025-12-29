import config from "@/config";
import { API } from "@/utils/api/api";
import { IApprovalDetail } from "@/types/approvals/IApprovals";

export const getApprovalById = async (id: number): Promise<IApprovalDetail> => {
  try {
    const response: IApprovalDetail = await API.get(`${config.API_HOST}/approval/${id}`);
    return response;
  } catch (error) {
    return error as any;
  }
};
