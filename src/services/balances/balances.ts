import config from "@/config";
import { API } from "@/utils/api/api";
import { GenericResponse } from "@/types/global/IGlobal";
import { getCorrectMimeType } from "@/utils/files/getCorrectMimeType";

export const uploadBalanceFile = async (
  balanceId: number,
  modelData: {
    financialDiscountMotiveId: number;
    observation: string;
    file: File[];
  }
) => {
  const formData = new FormData();
  formData.append("financialDiscountMotiveId", String(modelData.financialDiscountMotiveId));
  formData.append("observation", modelData.observation);
  modelData.file.forEach((file, index) => {
    formData.append(`clientDocuments`, getCorrectMimeType(file));
  });

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
