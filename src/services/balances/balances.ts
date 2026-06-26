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

export const changeBalancesStatus = async (balanceIds: number[], balanceStatusId: number) => {
  try {
    const response: GenericResponse<any> = await API.patch(
      `${config.API_HOST}/financial-discount/balances/status`,
      { balanceIds, balanceStatusId }
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
  motive_id?: number;
  file?: File;
  audit_observation?: string;
  client_documents?: { id: number; document: string }[];
}

export const updateBalance = async (balanceId: number, payload: UpdateBalancePayload) => {
  const formData = new FormData();
  if (payload.motive_id !== undefined) formData.append("motive_id", String(payload.motive_id));
  if (payload.file) formData.append("files", getCorrectMimeType(payload.file));
  if (payload.audit_observation !== undefined)
    formData.append("audit_observation", payload.audit_observation);
  if (payload.client_documents?.length)
    formData.append("client_documents", JSON.stringify(payload.client_documents));

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
