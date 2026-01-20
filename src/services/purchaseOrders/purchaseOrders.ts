import config from "@/config";
import { API } from "@/utils/api/api";
import { GenericResponse, GenericResponsePage } from "@/types/global/IGlobal";
import { IPurchaseOrder, IPurchaseOrderFilters } from "@/types/purchaseOrders/purchaseOrders";

export const getAllOrders = async (
  projectId: number
): Promise<GenericResponsePage<IPurchaseOrder[]>> => {
  try {
    const response: GenericResponsePage<IPurchaseOrder[]> = await API.get(
      `${config.API_HOST}/purchaseOrder/all`
    );

    return response;
  } catch (error) {
    throw error;
  }
};

export const getFilters = async (projectId: number): Promise<IPurchaseOrderFilters> => {
  try {
    const response: GenericResponse<IPurchaseOrderFilters> = await API.get(
      `${config.API_HOST}/purchaseOrder/filters/catalog?projectId=${projectId}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getOrderById = async (orderId: number): Promise<any> => {
  try {
    const response: IPurchaseOrder = await API.get(`${config.API_HOST}/purchaseorder/${orderId}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const uploadPurchaseOrder = async (file: File): Promise<any> => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("interno", "true");

    const response: any = await API.post(`${config.API_PURCHASE_ORDERS_AI}`, formData);
    return response;
  } catch (error) {
    throw error;
  }
};
