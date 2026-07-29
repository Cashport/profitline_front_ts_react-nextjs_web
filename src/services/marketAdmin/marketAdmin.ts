import { GenericResponse } from "@/types/global/IGlobal";
import { ICreatePromotionBody } from "@/types/marketAdmin/IMarketAdmin";
import { API } from "@/utils/api/api";

export const createBonification = async (body: ICreatePromotionBody) => {
  try {
    const response: GenericResponse<unknown> = await API.post("/promotion", body);
    return response.data;
  } catch (error) {
    console.error("Error al crear la promoción:", error);
    throw error;
  }
};
