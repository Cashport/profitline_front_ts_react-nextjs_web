import { GenericResponse } from "@/types/global/IGlobal";
import { API } from "@/utils/api/api";
import {
  ICommerceAdresses,
  IConfirmOrderData,
  ICreateOrderData,
  IEcommerceClient,
  IOrderConfirmedResponse,
  IProductData,
  ISingleOrder
} from "@/types/commerce/ICommerce";
import { MessageType } from "@/context/MessageContext";

export const getSingleOrder = async (projectId: number, orderId: number) => {
  const response: GenericResponse<ISingleOrder[]> = await API.get(
    `/marketplace/projects/${projectId}/order/${orderId}`
  );
  return response;
};

export const getClients = async (projectId: number) => {
  const response: GenericResponse<IEcommerceClient[]> = await API.get(
    `/marketplace/projects/${projectId}/clients`
  );
  return response;
};

export const getProductsByClient = async (projectId: number, clientId: number) => {
  const response: GenericResponse<IProductData[]> = await API.get(
    `/marketplace/projects/${projectId}/clients/${clientId}/products`
  );
  return response;
};

export const getAdresses = async (clientId: number) => {
  const response: GenericResponse<ICommerceAdresses[]> = await API.get(
    `/marketplace/clients/${clientId}/other-addresses`
  );
  return response;
};

export const confirmOrder = async (
  projectId: number,
  clientId: number,
  data: IConfirmOrderData
) => {
  try {
    const response: GenericResponse<IOrderConfirmedResponse> = await API.post(
      `/marketplace/projects/${projectId}/clients/${clientId}/order-confirmation`,
      data
    );
    return response;
  } catch (error) {
    return error;
  }
};

export const createOrder = async (
  projectId: number,
  clientId: number,
  data: ICreateOrderData,
  showMessage: (type: MessageType, content: string) => void
) => {
  try {
    const response: GenericResponse<{ id_order: number }> = await API.post(
      `/marketplace/projects/${projectId}/clients/${clientId}/create-order`,
      data
    );
    if (response.status !== 200) {
      throw response;
    }
    showMessage("success", "Orden creada correctamente");
    return response;
  } catch (error) {
    showMessage("error", "Error al crear orden");
    return error;
  }
};

export const createDraft = async (
  projectId: number,
  clientId: number,
  data: ICreateOrderData,
  showMessage: (type: MessageType, content: string) => void
) => {
  try {
    const response: GenericResponse<{ id_order: number }> = await API.post(
      `/marketplace/projects/${projectId}/clients/${clientId}/create-draft`,
      data
    );
    if (response.status !== 200) {
      throw response;
    }
    showMessage("success", "Borrador guardado correctamente");
    return response;
  } catch (error) {
    showMessage("error", "Error al guardar el borrador");
    return error;
  }
};
