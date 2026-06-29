import config from "@/config";
import { API } from "@/utils/api/api";
import { GenericResponse } from "@/types/global/IGlobal";
import { getCorrectMimeType } from "@/utils/files/getCorrectMimeType";
import { IMedicalAccountUploadData } from "@/types/medicalAccounts/IMedicalAccounts";

/**
 * Uploads a medical-account PDF and triggers backend AI processing.
 * NOTE: the full flow takes 30–90s. The `API` instance has no timeout, so the
 * request is not aborted (unlike `fetcher`/default `instance`, capped at 20s).
 */
export const uploadMedicalAccount = async (
  file: File,
  projectId: number
): Promise<GenericResponse<IMedicalAccountUploadData>> => {
  const formData = new FormData();
  formData.append("file", getCorrectMimeType(file));
  formData.append("project_id", String(projectId));

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
