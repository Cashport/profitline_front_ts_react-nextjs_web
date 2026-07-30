import { GenericResponse } from "@/types/global/IGlobal";
import { ICreateManualBonusBody, ICreatePromotionBody } from "@/types/marketAdmin/IMarketAdmin";
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

export const createManualBonus = async (body: ICreateManualBonusBody) => {
  try {
    const response: GenericResponse<unknown> = await API.post("/manager-bonification", body);
    return response.data;
  } catch (error) {
    console.error("Error al crear el bonificado manual:", error);
    throw error;
  }
};
