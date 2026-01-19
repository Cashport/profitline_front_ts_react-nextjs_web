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
