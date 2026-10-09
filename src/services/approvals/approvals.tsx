import config from "@/config";
import { API } from "@/utils/api/api";
import {
  IApprovalDetail,
  ICreateApprovalRequest,
  IGetApprovalStatus,
  IGetApprovalTypeActions,
  IResolveApprovalRequest
} from "@/types/approvals/IApprovals";
import { GenericResponse } from "@/types/global/IGlobal";

export const getApprovalById = async (id: number): Promise<IApprovalDetail> => {
  try {
    const response: IApprovalDetail = await API.get(`${config.API_HOST}/approval/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getApprovalStatuses = async (): Promise<IGetApprovalStatus> => {
  try {
    const response: GenericResponse<IGetApprovalStatus> = await API.get(
      `${config.API_HOST}/approval/step-status`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getApprovalTypes = async (): Promise<IGetApprovalTypeActions[]> => {
  try {
    const response: GenericResponse<IGetApprovalTypeActions[]> = await API.get(
      `${config.API_HOST}/approval/type-actions`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const resolveApproval = async (id: number, data: IResolveApprovalRequest): Promise<void> => {
  try {
    await API.post(`${config.API_HOST}/approval/resolve/${id}`, data);
  } catch (error) {
    throw error;
  }
};

export const createApproval = async (data: ICreateApprovalRequest): Promise<void> => {
  try {
    await API.post(`${config.API_HOST}/approval/create`, data);
  } catch (error) {
    throw error;
  }
};
