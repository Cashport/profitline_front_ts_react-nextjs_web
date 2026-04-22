import config from "@/config";
import { GenericResponse } from "@/types/global/IGlobal";
import { API } from "@/utils/api/api";

export const UploadFinalFile = async (applicationId: string, file: File): Promise<any> => {
  const formData = new FormData();
  formData.append("file", file);
  try {
    const response: GenericResponse<any> = await API.post(
      `${config.API_HOST}/paymentApplication/applications/${applicationId}/final-file`,
      formData
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
