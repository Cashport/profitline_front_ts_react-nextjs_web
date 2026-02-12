import config from "@/config";
import { API } from "@/utils/api/api";
import { GenericResponse } from "@/types/global/IGlobal";
import {
  IPurchaseOrderDetail,
  IPurchaseOrderFilters,
  IEditPurchaseOrderProduct,
  IHistoryTimelineEvent,
  IPurchaseOrderActionPayload,
  IApprover,
  IApproversResponse,
  IUploadPurchaseOrderResponse
} from "@/types/purchaseOrders/purchaseOrders";
import { PurchaseOrderUpdatePayload } from "@/modules/purchaseOrders/types/forms";

export const getFilters = async (projectId: number): Promise<IPurchaseOrderFilters> => {
  try {
    const response: GenericResponse<IPurchaseOrderFilters> = await API.get(
      `${config.API_HOST}/purchaseOrder/filters/catalog?projectId=${projectId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching purchase order filters:", error);
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
    console.error("Error fetching purchase order by ID:", error);
    throw error;
  }
};

export const editPurchaseOrder = async (
  orderId: string,
  updatedData: PurchaseOrderUpdatePayload
): Promise<IPurchaseOrderDetail> => {
  try {
    const response: GenericResponse<IPurchaseOrderDetail> = await API.patch(
      `${config.API_HOST}/purchaseorder/${orderId}`,
      updatedData
    );
    return response.data;
  } catch (error) {
    console.error("Error editing purchase order:", error);
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
    console.error("Error editing purchase order products:", error);
    throw error;
  }
};

export const uploadPurchaseOrder = async (file: File): Promise<IUploadPurchaseOrderResponse> => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("interno", "true");

    const response: GenericResponse<IUploadPurchaseOrderResponse> = await API.post(
      `${config.API_PURCHASE_ORDERS_AI}`,
      formData
    );
    console.log("File upload response:", response);
    return response.data;
  } catch (error) {
    console.error("File upload error:", error);
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
    console.error("Error fetching timeline events:", error);
    throw error;
  }
};

export const downloadPurchaseOrdersCSV = async (
  orderIds: string[]
): Promise<{
  url: string;
  filename: string;
}> => {
  try {
    const response: {
      url: string;
      filename: string;
    } = await API.post(`${config.API_HOST}/purchaseorder/export-purchase-orders`, {
      order_ids: orderIds
    });
    return response;
  } catch (error) {
    console.error("CSV download error:", error);
    throw error;
  }
};

export const getApprovers = async (): Promise<IApprover[]> => {
  const templateId = 3;
  try {
    const response: IApproversResponse = await API.get(
      `${config.API_HOST}/approval/templates/${templateId}/approvers`
    );
    return response.approvers;
  } catch (error) {
    console.error("Error fetching approvers:", error);
    throw error;
  }
};

export const purchaseOrderActions = async (
  purchase_order_id: string,
  payload: IPurchaseOrderActionPayload,
  files?: File | File[]
): Promise<any> => {
  try {
    const formData = new FormData();
    formData.append("request", JSON.stringify(payload));

    if (payload.action === "invoice" && files) {
      if (Array.isArray(files)) {
        files.forEach((file) => formData.append("file", file));
      } else {
        formData.append("file", files);
      }
    }

    const response: GenericResponse<any> = await API.post(
      `${config.API_HOST}/purchaseOrder/${purchase_order_id}/action`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data;
  } catch (error) {
    console.error("Error executing purchase order action:", error);
    throw error;
  }
};

export const sendToBilling = async (purchase_order_id: string): Promise<any> => {
  try {
    const response: GenericResponse<any> = await API.post(
      `${config.API_HOST}/purchaseOrder/${purchase_order_id}/send-to-billing`
    );
    return response.data;
  } catch (error) {
    console.error("Error sending purchase order to billing:", error);
    throw error;
  }
};
