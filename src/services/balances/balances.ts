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
  eligibility_status?: string;
}

export const downloadBalanceAuditExcel = async (): Promise<{ url: string; filename: string }> => {
  try {
    const response: GenericResponse<{ url: string }> = await API.get(
      `/financial-discount/balance-audit/export`
    );
    const filename = response.data.url.split("/").pop() || "balance_audit.xlsx";
    return { url: response.data.url, filename };
  } catch (error) {
    console.error("Error downloading balance audit excel:", error);
    throw error;
  }
};

export const updateBalance = async (balanceId: number, payload: UpdateBalancePayload) => {
  const formData = new FormData();
  if (payload.motive_id !== undefined) formData.append("motive_id", String(payload.motive_id));
  if (payload.file) formData.append("files", getCorrectMimeType(payload.file));
  if (payload.audit_observation !== undefined)
    formData.append("audit_observation", payload.audit_observation);
  if (payload.client_documents?.length)
    formData.append("client_documents", JSON.stringify(payload.client_documents));
  if (payload.eligibility_status !== undefined)
    formData.append("eligibility_status", payload.eligibility_status);

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

export interface EligibilityStatusOption {
  id: string;
  description: string;
}

export const getEligibilityStatuses = async (): Promise<EligibilityStatusOption[]> => {
  const response: GenericResponse<EligibilityStatusOption[]> = await API.get(
    `${config.API_HOST}/financial-discount/balances/eligibility-statuses`
  );
  return response.data;
};

export const changeBalanceEligibility = async (
  balanceIds: number[],
  eligibilityStatusId: number
) => {
  try {
    const response: GenericResponse<any> = await API.patch(
      `${config.API_HOST}/financial-discount/balances/eligibility-status`,
      { balanceIds, eligibilityStatusId }
    );
    return response;
  } catch (error) {
    throw error;
  }
};

export interface IInvoiceBalance {
  id: number;
  project_id: number;
  client_id: string;
  financial_record_id: number | null;
  financial_discount_motive_id: number | null;
  motive_name: string | null;
  balance_status_id: number | null;
  balance_status_code: string | null;
  balance_status_name: string | null;
  balance_status_color: string | null;
  initial_value: number;
  current_value: number;
  is_legalized: number | null;
  is_deleted: number;
  id_erp: string | null;
  comments: string | null;
  created_at: string | null;
}

/**
 * HU Galderma — "Ver Saldos": balances (`financial_record_id`) de una factura.
 * Solo lectura, reutiliza la misma tabla `balances` que el módulo de saldos.
 */
export const getBalancesByFinancialRecord = async (
  financialRecordId: number
): Promise<GenericResponse<IInvoiceBalance[]>> => {
  const response: GenericResponse<IInvoiceBalance[]> = await API.get(
    `${config.API_HOST}/financial-discount/balance/financial-record/${financialRecordId}`
  );
  return response;
};
