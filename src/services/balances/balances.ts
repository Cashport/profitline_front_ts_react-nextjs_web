import config from "@/config";
import { API } from "@/utils/api/api";
import { GenericResponse } from "@/types/global/IGlobal";
import { getCorrectMimeType } from "@/utils/files/getCorrectMimeType";

export const uploadBalanceFile = async (
  balanceId: number,
  modelData: {
    financialDiscountMotiveId: number;
    observation: string;
    file: File;
    clientDocuments?: string;
  }
) => {
  const formData = new FormData();
  formData.append("financialDiscountMotiveId", String(modelData.financialDiscountMotiveId));
  formData.append("observation", modelData.observation);
  formData.append("file", getCorrectMimeType(modelData.file));
  modelData.clientDocuments && formData.append("clientDocuments", modelData.clientDocuments);

  try {
    const response: GenericResponse<any> = await API.patch(
      `${config.API_HOST}/financial-discount/balance/${balanceId}/classify-audit`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      }
    );
    return response;
  } catch (error) {
    throw error;
  }
};

export const sendToOtherBalances = async (balanceId: number) => {
  try {
    const response: GenericResponse<any> = await API.patch(
      `${config.API_HOST}/financial-discount/balance/${balanceId}/classify-other`
    );
    return response;
  } catch (error) {
    throw error;
  }
};

export const sendBalanceToApproval = async (balanceId: number, approverUserId: number) => {
  try {
    const response: GenericResponse<any> = await API.post(
      `${config.API_HOST}/financial-discount/balance/${balanceId}/send-to-approval`,
      { approverUserId }
    );
    return response;
  } catch (error) {
    throw error;
  }
};

export type BalanceApprovalDecision = "APPROVED" | "REJECTED";

export const submitBalanceApprovalDecision = async (
  balanceId: number,
  decision: BalanceApprovalDecision,
  observation: string
) => {
  try {
    const response: GenericResponse<any> = await API.post(
      `${config.API_HOST}/financial-discount/balance/${balanceId}/approval-decision`,
      { decision, observation }
    );
    return response;
  } catch (error) {
    throw error;
  }
};

export interface UpdateBalancePayload {
  client_id?: string;
  comments?: string;
  motive_id?: number;
  file?: File;
}

export const updateBalance = async (balanceId: number, payload: UpdateBalancePayload) => {
  const formData = new FormData();
  if (payload.client_id !== undefined) formData.append("client_id", payload.client_id);
  if (payload.comments !== undefined) formData.append("comments", payload.comments);
  if (payload.motive_id !== undefined) formData.append("motive_id", String(payload.motive_id));
  if (payload.file) formData.append("files", getCorrectMimeType(payload.file));

  try {
    const response: GenericResponse<any> = await API.put(
      `${config.API_HOST}/financial-discount/balance/${balanceId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      }
    );
    return response;
  } catch (error) {
    console.error("Error updating balance", error);
    throw error;
  }
};
