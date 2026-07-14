import { GenericResponse } from "@/types/global/IGlobal";
import { API } from "@/utils/api/api";
import { useAppStore } from "@/lib/store/store";

export const reprocessExcel = async (applicationId: number): Promise<{ excel_url: string }> => {
  try {
    const response: GenericResponse<{ excel_url: string }> = await API.post(
      `/paymentApplication/reprocess-excel`,
      { id: applicationId }
    );
    return response.data;
  } catch (error) {
    console.error("Error reprocessing Excel:", error);
    throw error;
  }
};

export const reprocessPDF = async (applicationId: number): Promise<{ pdf_url: string }> => {
  try {
    const response: GenericResponse<{ pdf_url: string }> = await API.post(
      `/paymentApplication/reprocess-pdf`,
      { id: applicationId }
    );
    return response.data;
  } catch (error) {
    console.error("Error reprocessing PDF:", error);
    throw error;
  }
};

export const uploadFinalFile = async (applicationId: string, file: File): Promise<any> => {
  const formData = new FormData();
  formData.append("file", file);
  try {
    const response: GenericResponse<any> = await API.post(
      `/paymentApplication/applications/${applicationId}/final-file`,
      formData
    );
    return response.data;
  } catch (error) {
    console.error("Error uploading final file:", error);
    throw error;
  }
};

export const reversePaymentApplication = async (
  applicationId: number
): Promise<{ success: boolean; message: string }> => {
  try {
    const response: GenericResponse<{ success: boolean; message: string }> = await API.post(
      `/paymentApplication/reverse-payment-applications`,
      { identification_id: applicationId }
    );
    return response.data;
  } catch (error) {
    console.error("Error reversing payment application:", error);
    throw error;
  }
};

export const changeStatusToApplied = async (identificationId: number): Promise<any> => {
  const userId = useAppStore.getState().userId;
  try {
    const response: GenericResponse<any> = await API.put(
      `/paymentApplication/change-status-to-applied/${identificationId}`,
      { user: { user_id: userId.toString() } }
    );
    return response.data;
  } catch (error) {
    console.error("Error changing status to applied:", error);
    throw error;
  }
};
