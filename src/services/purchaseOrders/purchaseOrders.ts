import config from "@/config";
import { API, ApiError } from "@/utils/api/api";
import instance from "@/utils/api/api";
import { GenericResponse } from "@/types/global/IGlobal";
import {
  IPurchaseOrderDetail,
  IPurchaseOrderFilters,
  IEditPurchaseOrderProduct,
  IHistoryTimelineEvent,
  IPurchaseOrderActionPayload,
  IApprover,
  IApproversResponse,
  IUploadPurchaseOrderResponse,
  IBatchesByPurchaseOrder,
  ICreatePurchaseOrderPayload,
  IGetAvailableDocuments
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

export const downloadPurchaseOrdersCSV = async ({
  orderIds,
  packageId
}: {
  orderIds?: string[];
  packageId?: number;
}): Promise<{
  url: string;
  filename: string;
}> => {
  if (!orderIds && !packageId) {
    throw new Error("Debe proporcionar orderIds o packageId para descargar el CSV");
  }
  if (orderIds && packageId) {
    throw new Error("Solo puede proporcionar orderIds o packageId, no ambos");
  }
  try {
    const response: GenericResponse<{
      url: string;
      filename: string;
    }> = await API.post(`${config.API_HOST}/purchaseorder/export-purchase-orders`, {
      order_ids: orderIds,
      package_id: packageId
    });
    return response.data;
  } catch (error) {
    console.error("Download plane error:", error);
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

export const sendToBackorder = async (purchase_order_id: string): Promise<any> => {
  try {
    const response: GenericResponse<any> = await API.post(
      `${config.API_HOST}/purchaseOrder/${purchase_order_id}/send-to-backorder`
    );
    return response.data;
  } catch (error) {
    console.error("Error sending purchase order to backorder:", error);
    throw error;
  }
};

export const sendToBackorderStock = async (
  purchase_order_id: string,
  saveRest: boolean
): Promise<any> => {
  try {
    const response: GenericResponse<any> = await API.post(
      `${config.API_HOST}/purchaseOrder/${purchase_order_id}/process-partial`,
      { saveRest }
    );
    return response.data;
  } catch (error) {
    console.error("Error sending purchase order to backorder stock:", error);
    throw error;
  }
};

export const getBatchesForProducts = async (purchaseOrderId: string) => {
  try {
    const response: GenericResponse<IBatchesByPurchaseOrder[]> = await API.get(
      `${config.API_HOST}/purchaseOrder/${purchaseOrderId}/batches`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching batches for products:", error);
    throw error;
  }
};

export const sendPackageToDispatch = async (packageId: string) => {
  try {
    const response: GenericResponse<any> = await API.post(
      `${config.API_HOST}/purchaseorder/${packageId}/send-package-to-dispatch`
    );
    return response.data;
  } catch (error) {
    console.error("Error sending package to dispatch:", error);
    throw error;
  }
};

export const sendPackageToBilling = async (packageId: string, send_approval?: number) => {
  const modelBody = { send_aprobation: send_approval };
  try {
    const response: GenericResponse<any> = await API.post(
      `${config.API_HOST}/purchaseorder/${packageId}/send-package-to-billing`,
      send_approval && modelBody
    );
    return response.data;
  } catch (error) {
    throw error as ApiError;
  }
};

export const sendMultiplePurchaseOrdersToBilling = async (
  orderIds: string[],
  modelData: {
    data: {
      purchase_order_id: string;
      invoice_id: string;
    }[];
    files: File[];
  }
) => {
  const formData = new FormData();
  formData.append("request", JSON.stringify({ data: modelData.data }));
  modelData.files.forEach((file) => formData.append("file", file));

  try {
    const response: GenericResponse<any> = await API.post(
      `${config.API_HOST}/purchaseOrder/invoice-package`,
      formData
    );
    return response.data;
  } catch (error) {
    console.error("Error sending multiple purchase orders to billing:", error);
    throw error;
  }
};

export const removePurchaseOrdersFromPackage = async (modelData: {
  package_id: number;
  marketplace_order_ids: number[];
}): Promise<any> => {
  try {
    const response: GenericResponse<any> = await API.post(
      `${config.API_HOST}/purchaseOrder/split`,
      modelData
    );
    return response.data;
  } catch (error) {
    console.error("Error removing purchase order from package:", error);
    throw error;
  }
};

export const sendPackageToApproval = async (
  packageId: number,
  approvers: { userId: number; order: number }[]
) => {
  try {
    const payload = {
      data: { approvers, packageId },
      observation: ""
    };

    const response: GenericResponse<any> = await API.post(
      `${config.API_HOST}/purchaseOrder/${packageId}/send-package-to-approval`,
      payload
    );
    return response.data;
  } catch (error) {
    console.error("Error sending package to approval:", error);
    throw error;
  }
};

export const deletePurchaseOrders = async (orderIds: number[]) => {
  try {
    const response: GenericResponse<any> = await API.post(
      `${config.API_HOST}/purchaseOrder/delete`,
      { marketplace_order_ids: orderIds }
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting purchase orders:", error);
    throw error;
  }
};

export const createPurchaseOrderBulk = async (
  files: File[],
  createPOBulk: ICreatePurchaseOrderPayload
) => {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append(file.name.slice(0, file.name.lastIndexOf(".")), file);
  });

  formData.append("request", JSON.stringify(createPOBulk));
  try {
    const res: GenericResponse<any> = await API.post(
      `${config.API_HOST}/purchaseOrder/bulk`,
      formData
    );
    return res.data;
  } catch (error) {
    console.error("Error creating purchase orders in bulk:", error);
    throw error;
  }
};

export const getPurchaseOrderChannels = async () => {
  try {
    const res: GenericResponse<{ id: number; name: string }[]> = await API.get(
      `${config.API_HOST}/purchaseOrder/usage-channels`
    );
    return res.data;
  } catch (error) {
    console.error("Error fetching purchase order channels:", error);
    throw error;
  }
};

export const getBatchesByProduct = async (purchaseOrderId: string, productId: string) => {
  try {
    const res: GenericResponse<IBatchesByPurchaseOrder[]> = await API.get(
      `${config.API_HOST}/purchaseOrder/${purchaseOrderId}/${productId}/batches-by-product`
    );
    return res.data;
  } catch (error) {
    console.error("Error fetching batches by product:", error);
    throw error;
  }
};

export const downloadAvailableDocuments = async ({
  packageId,
  orderIds,
  documents
}: {
  packageId?: number;
  orderIds?: number[];
  documents: string[];
}): Promise<Blob> => {
  if (!packageId && !orderIds) {
    throw new Error("Debe proporcionar packageId o orderIds para descargar los documentos");
  }
  if (packageId && orderIds) {
    throw new Error("Solo puede proporcionar packageId o orderIds, no ambos");
  }
  try {
    const response = await instance.post(
      `${config.API_HOST}/purchaseOrder/documents/download`,
      {
        ...(orderIds && { order_ids: orderIds }),
        ...(packageId && { package_id: packageId }),
        documents
      },
      { responseType: "blob", timeout: 60000 }
    );
    return response.data;
  } catch (error) {
    console.error("Error downloading documents:", error);
    throw error;
  }
};

export const getDownloadableFiles = async (packageId?: string, orderIds?: string[]) => {
  if (!packageId && !orderIds) {
    throw new Error(
      "Debe proporcionar packageId o orderIds para obtener los archivos descargables"
    );
  }
  if (packageId && orderIds) {
    throw new Error("Solo puede proporcionar packageId o orderIds, no ambos");
  }
  try {
    const response: GenericResponse<IGetAvailableDocuments> = await API.post(
      `${config.API_HOST}/purchaseOrder/documents/available`,
      {
        ...(orderIds && { order_ids: orderIds }),
        ...(packageId && { package_id: packageId })
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching downloadable files:", error);
    throw error;
  }
};
