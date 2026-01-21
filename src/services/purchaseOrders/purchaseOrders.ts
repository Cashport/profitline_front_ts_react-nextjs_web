import config from "@/config";
import { API } from "@/utils/api/api";
import { GenericResponse, GenericResponsePage } from "@/types/global/IGlobal";
import {
  IPurchaseOrder,
  IPurchaseOrderDetail,
  IPurchaseOrderFilters,
  IEditPurchaseOrderProduct,
  IHistoryTimelineEvent
} from "@/types/purchaseOrders/purchaseOrders";

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

export const getOrderById = async (orderId: string): Promise<IPurchaseOrderDetail> => {
  try {
    const response: GenericResponse<IPurchaseOrderDetail> = await API.get(
      `${config.API_HOST}/purchaseorder/${orderId}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const editPurchaseOrder = async (
  orderId: string,
  updatedData: Partial<IPurchaseOrderDetail>
): Promise<IPurchaseOrderDetail> => {
  try {
    const response: GenericResponse<IPurchaseOrderDetail> = await API.patch(
      `${config.API_HOST}/purchaseorder/${orderId}`,
      updatedData
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const editPurchaseOrderProducts = async (
  orderId: string,
  productsData: IEditPurchaseOrderProduct[]
): Promise<IPurchaseOrderDetail> => {
  try {
    const response: GenericResponse<IPurchaseOrderDetail> = await API.patch(
      `${config.API_HOST}/purchaseorder/${orderId}/products`,
      { products: productsData }
    );
    return response.data;
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

export const getHistoryTimelineEvents = async (
  orderId: string
): Promise<IHistoryTimelineEvent[]> => {
  try {
    const response: GenericResponse<IHistoryTimelineEvent[]> = await API.get(
      `${config.API_HOST}/purchaseorder/${orderId}/events`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
