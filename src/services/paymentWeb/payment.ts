import { API } from "@/utils/api/api";

export interface IWompiSignatureRequest {
  reference: string;
  amount: number;
  currency?: string;
}

export interface IWompiSignatureResponse {
  integrity: string;
}

export interface IWompiWebhookPayload {
  order_id: string | number;
  transaction: any;
}

export const getWompiSignature = async (
  payload: IWompiSignatureRequest
): Promise<IWompiSignatureResponse> => {
  try {
    const response = await API.post("marketplace/wompi/signature", payload);
    const integrity =
      response.data?.integrity || response.data?.data?.integrity;

    if (!integrity) {
      throw new Error("No se encontró 'integrity' en la respuesta del backend");
    }
    return { integrity };
  } catch (error) {
    console.error("Error fetching Wompi signature:", error);
    throw error;
  }
};

export const sendWompiTransaction = async (
  payload: IWompiWebhookPayload
): Promise<void> => {
  try {
    await API.post("marketplace/wompi/webhook", payload);
  } catch (error) {
    console.error("Error enviando transacción Wompi al backend:", error);
    throw error;
  }
};

