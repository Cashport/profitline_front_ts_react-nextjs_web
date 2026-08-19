import config from "@/config";
import { API } from "@/utils/api/api";
import { GenericResponse } from "@/types/global/IGlobal";
import { getCorrectMimeType } from "@/utils/files/getCorrectMimeType";
import { IMedicalAccountUploadData } from "@/types/medicalAccounts/IMedicalAccounts";
import { MedicalAccountStatus } from "@/modules/medicalAccounts/types/IMedicalAccount";

/**
 * Uploads a medical-account PDF and triggers backend AI processing.
 * NOTE: the full flow takes 30–90s. The `API` instance has no timeout, so the
 * request is not aborted (unlike `fetcher`/default `instance`, capped at 20s).
 */
export const uploadMedicalAccount = async (
  file: File,
  projectId: number,
  orderNumber: string,
  serviceType?: string
): Promise<GenericResponse<IMedicalAccountUploadData>> => {
  const formData = new FormData();
  formData.append("file", getCorrectMimeType(file));
  formData.append("project_id", String(projectId));
  formData.append("order_number", orderNumber);
  if (serviceType) formData.append("service_type", serviceType);

  try {
    const response: GenericResponse<IMedicalAccountUploadData> = await API.post(
      `${config.API_HOST}/medical-accounts/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      }
    );
    return response;
  } catch (error) {
    console.error("Error uploading medical account:", error);
    throw error;
  }
};

export const getMedicalAccountStatuses = async (): Promise<
  GenericResponse<MedicalAccountStatus[]>
> => {
  try {
    const response: GenericResponse<MedicalAccountStatus[]> = await API.get(
      `${config.API_HOST}/medical-accounts/statuses`
    );
    return response;
  } catch (error) {
    console.error("Error fetching medical account statuses:", error);
    throw error;
  }
};

export const deleteMedicalAccount = async (
  id: number
): Promise<GenericResponse<{ id: number }>> => {
  try {
    const response: GenericResponse<{ id: number }> = await API.delete(
      `${config.API_HOST}/medical-accounts/${id}`
    );
    return response;
  } catch (error) {
    console.error("Error deleting medical account:", error);
    throw error;
  }
};

export const mergeMedicalAccountDocuments = async (
  id: number,
  documentIds: number[]
): Promise<GenericResponse<{ url: string }>> => {
  try {
    const response: GenericResponse<{ url: string }> = await API.post(
      `${config.API_HOST}/medical-accounts/${id}/documents/merge`,
      { document_ids: documentIds }
    );
    return response;
  } catch (error) {
    console.error("Error merging medical account documents:", error);
    throw error;
  }
};

export const auditMedicalAccount = async (
  id: number
): Promise<GenericResponse<IMedicalAccountUploadData>> => {
  try {
    const response: GenericResponse<IMedicalAccountUploadData> = await API.post(
      `${config.API_HOST}/medical-accounts/${id}/audit`
    );
    return response;
  } catch (error) {
    console.error("Error auditing medical account:", error);
    throw error;
  }
};

export const changeMedicalAccountStatus = async (
  id: number,
  statusCode: string
): Promise<GenericResponse<IMedicalAccountUploadData>> => {
  try {
    const response: GenericResponse<IMedicalAccountUploadData> = await API.post(
      `${config.API_HOST}/medical-accounts/${id}/change-status`,
      { status_code: statusCode }
    );
    return response;
  } catch (error) {
    console.error("Error changing medical account status:", error);
    throw error;
  }
};

export const resolveMedicalAccountNovelty = async (
  accountId: number,
  noveltyId: number
): Promise<GenericResponse<IMedicalAccountUploadData>> => {
  try {
    const response: GenericResponse<IMedicalAccountUploadData> = await API.post(
      `${config.API_HOST}/medical-accounts/${accountId}/novelties/${noveltyId}/resolve`
    );
    return response;
  } catch (error) {
    console.error("Error resolving novelty:", error);
    throw error;
  }
};

export const uploadMedicalAccountInvoice = async (
  id: number,
  invoiceNumber: string,
  pdfFile: File,
  zipFile: File
): Promise<GenericResponse<IMedicalAccountUploadData>> => {
  const formData = new FormData();
  formData.append("invoice_number", invoiceNumber);
  formData.append("pdf", pdfFile);
  formData.append("zip", zipFile);

  try {
    const response: GenericResponse<IMedicalAccountUploadData> = await API.post(
      `${config.API_HOST}/medical-accounts/${id}/invoice`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      }
    );
    return response;
  } catch (error) {
    console.error("Error uploading invoice:", error);
    throw error;
  }
};
