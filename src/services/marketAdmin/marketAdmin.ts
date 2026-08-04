import { GenericResponse } from "@/types/global/IGlobal";
import {
  ICreateManualBonusBody,
  ICreatePromotionBody,
  IUpdateMarketAdminProductBody
} from "@/types/marketAdmin/IMarketAdmin";
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

// PUT /product/:id — multipart/form-data, se envía solo lo que cambia
export const updateMarketAdminProduct = async (
  id: number | string,
  body: IUpdateMarketAdminProductBody
) => {
  try {
    const formData = new FormData();
    Object.entries(body).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        formData.append(key, value as string | Blob);
      }
    });

    const response: GenericResponse<unknown> = await API.put(`/product/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return response.data;
  } catch (error) {
    console.error("Error al actualizar el producto:", error);
    throw error;
  }
};
