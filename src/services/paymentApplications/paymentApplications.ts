import { GenericResponse } from "@/types/global/IGlobal";
import { API } from "@/utils/api/api";

export const ReprocessExcel = async (applicationId: number): Promise<{ excel_url: string }> => {
  const response: GenericResponse<{ excel_url: string }> = await API.post(
    `/paymentApplication/reprocess-excel`,
    { id: applicationId }
  );
  return response.data;
};

export const UploadFinalFile = async (applicationId: string, file: File): Promise<any> => {
  const formData = new FormData();
  formData.append("file", file);
  try {
    const response: GenericResponse<any> = await API.post(
      `/paymentApplication/applications/${applicationId}/final-file`,
      formData
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
