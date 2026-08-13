import { GenericResponse } from "@/types/global/IGlobal";
import {
  ICreateManualBonusBody,
  ICreateMarketAdminClientAddressBody,
  ICreatePromotionBody,
  IMarketAdminClientAddress,
  IMarketAdminClientsBatchBody,
  IProductInventoryItem,
  IUpdateMarketAdminClientAddressBody,
  IUpdateMarketAdminClientConfigBody,
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

// GET /product/:id/inventory — inventario por lote y bodega
export const getProductInventory = async (id: number | string) => {
  try {
    const response: GenericResponse<IProductInventoryItem[]> = await API.get(
      `/product/${id}/inventory`
    );
    return response.data;
  } catch (error) {
    console.error("Error al obtener el inventario del producto:", error);
    throw error;
  }
};

// ── Clientes ────────────────────────────────────────────────────────────────

// PUT /marketplace-admin/clients/batch — activar/inactivar en lote
export const updateMarketAdminClientsBatch = async (body: IMarketAdminClientsBatchBody) => {
  try {
    const response: GenericResponse<unknown> = await API.put(
      "/marketplace-admin/clients/batch",
      body
    );
    return response.data;
  } catch (error) {
    console.error("Error al actualizar los clientes en lote:", error);
    throw error;
  }
};

export const createMarketAdminClientAddress = async (
  clientId: string,
  body: ICreateMarketAdminClientAddressBody
) => {
  try {
    const response: GenericResponse<IMarketAdminClientAddress> = await API.post(
      `/marketplace-admin/clients/${clientId}/addresses`,
      body
    );
    return response.data;
  } catch (error) {
    console.error("Error al crear la dirección del cliente:", error);
    throw error;
  }
};

export const updateMarketAdminClientAddress = async (
  clientId: string,
  addressId: number,
  body: IUpdateMarketAdminClientAddressBody
) => {
  try {
    const response: GenericResponse<unknown> = await API.put(
      `/marketplace-admin/clients/${clientId}/addresses/${addressId}`,
      body
    );
    return response.data;
  } catch (error) {
    console.error("Error al actualizar la dirección del cliente:", error);
    throw error;
  }
};

// DELETE /marketplace-admin/clients/:client_id/addresses/:id — soft delete
export const deleteMarketAdminClientAddress = async (clientId: string, addressId: number) => {
  try {
    const response: GenericResponse<unknown> = await API.delete(
      `/marketplace-admin/clients/${clientId}/addresses/${addressId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error al eliminar la dirección del cliente:", error);
    throw error;
  }
};

// PUT /marketplace-admin/clients/:client_id/config — se envía solo lo que cambia
export const updateMarketAdminClientConfig = async (
  clientId: string,
  body: IUpdateMarketAdminClientConfigBody
) => {
  try {
    const response: GenericResponse<unknown> = await API.put(
      `/marketplace-admin/clients/${clientId}/config`,
      body
    );
    return response.data;
  } catch (error) {
    console.error("Error al actualizar la configuración del cliente:", error);
    throw error;
  }
};
