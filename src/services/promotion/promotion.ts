import { GenericResponse } from "@/types/global/IGlobal";
import { API } from "@/utils/api/api";

export interface IPromotion {
  id: number;
  name: string;
  isFlex: boolean;
}

export const getPromotions = async (client_id: string) => {
  try {
    const response: GenericResponse<{
      promotions: IPromotion[];
    }> = await API.get(`/promotion/${client_id}/eligible/client`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener documentos promociones:", error);
    throw error;
  }
};
