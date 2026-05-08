import { GenericResponse } from "@/types/global/IGlobal";
import { API, ApiError } from "@/utils/api/api";
import {
  ICommerceAddressesData,
  IConfirmOrderData,
  ICreateOrderData,
  IDiscountPackageAvailable,
  IEcommerceClient,
  IGeneratePaymentLinkResponse,
  IInventoriesByWarehouse,
  IMarketplaceOrdersFilters,
  IOrderConfirmedResponse,
  IOrderData,
  IPaymentLinkData,
  IProductData,
  ISalesDashboard,
  ISingleOrder,
  IWarehouseProductsStock
} from "@/types/commerce/ICommerce";
import { MessageType } from "@/context/MessageContext";

export const getAllOrders = async (projectId: number) => {
  const response: GenericResponse<IOrderData[]> = await API.get(
    `/marketplace/projects/${projectId}/orders`
  );
  return response;
};

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

export const getProductsByClient = async (projectId: number, clientId: string) => {
  const response: GenericResponse<IProductData[]> = await API.get(
    `/marketplace/projects/${projectId}/clients/${clientId}/products`
  );
  return response;
};

export const getAdresses = async (clientId: string) => {
  try {
    const response: GenericResponse<ICommerceAddressesData> = await API.get(
      `/marketplace/clients/${clientId}/other-addresses`
    );
    return response.data;
  } catch (error) {
    console.error("Error al obtener las direcciones del cliente:", error);
    throw Error("Error al obtener las direcciones del cliente");
  }
};

export const getDiscounts = async (
  projectId: number,
  clientId: string
): Promise<GenericResponse<IDiscountPackageAvailable[]>> => {
  try {
    const response: GenericResponse<IDiscountPackageAvailable[]> = await API.get(
      `/marketplace/projects/${projectId}/clients/${clientId}/discounts-packages`
    );

    return response;
  } catch (error) {
    console.error(error);
    return error as GenericResponse<IDiscountPackageAvailable[]>;
  }
};

export const confirmOrder = async (
  projectId: number,
  clientId: string,
  data: IConfirmOrderData
) => {
  try {
    const response: GenericResponse<IOrderConfirmedResponse> = await API.post(
      `/marketplace/projects/${projectId}/clients/${clientId}/order-confirmation-package`,
      data
    );
    return response;
  } catch (error) {
    throw error;
  }
};

export const createOrder = async (
  projectId: number,
  clientId: string,
  data: ICreateOrderData,
  // eslint-disable-next-line no-unused-vars
  showMessage: (type: MessageType, content: string) => void,
  paymentSupport?: File
): Promise<GenericResponse<{ id_order: number; notificationId: number }>> => {
  let response: GenericResponse<{ id_order: number; notificationId: number }>;
  const url = `/marketplace/projects/${projectId}/clients/${clientId}/create-order`;
  if (paymentSupport) {
    const formData = new FormData();
    formData.append("request", JSON.stringify(data));
    formData.append("file", paymentSupport);

    response = await API.post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
  } else {
    response = await API.post(url, data);
  }

  if (response.status !== 200) {
    throw response;
  }
  showMessage("success", "Orden creada correctamente");
  return response;
};

export const createDraft = async (
  projectId: number,
  clientId: string,
  data: ICreateOrderData,
  // eslint-disable-next-line no-unused-vars
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

export const deleteOrders = async (
  ordersId: number[],
  // eslint-disable-next-line no-unused-vars
  showMessage: (type: MessageType, content: string) => void
) => {
  const ordersIds = {
    orders_ids: ordersId
  };
  try {
    const response: GenericResponse<[]> = await API.delete(`/marketplace/orders`, {
      data: ordersIds
    });
    if (response.status !== 200) {
      throw response;
    }
    showMessage("success", "Orden eliminada correctamente");
    return response;
  } catch (error) {
    showMessage("error", "Error al eliminar ordenes");
    return error;
  }
};

export const createOrderFromDraft = async (
  projectId: number,
  clientId: string,
  orderId: number,
  data: ICreateOrderData,
  // eslint-disable-next-line no-unused-vars
  showMessage: (type: MessageType, content: string) => void,
  paymentSupport?: File
) => {
  try {
    let response: GenericResponse<{ id_order: number }>;

    // si el cliente adjunta soporte de pago al crear la orden desde el borrador
    const url = `/marketplace/projects/${projectId}/clients/${clientId}/draft-to-order/${orderId}`;
    if (paymentSupport) {
      const formData = new FormData();
      formData.append("data", JSON.stringify(data));
      formData.append("file", paymentSupport);

      response = await API.put(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
    } else {
      response = await API.put(url, data);
    }

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

export const changeOrderState = async (
  ordersIds: number[],
  // eslint-disable-next-line no-unused-vars
  showMessage: (type: MessageType, content: string) => void
) => {
  const modelData = {
    ids: ordersIds
  };
  try {
    const response: GenericResponse<any> = await API.put(
      `/marketplace/orders/change-status`,
      modelData
    );
    if (response.status !== 200) {
      throw response;
    }
    showMessage("success", "Estado cambiado correctamente");
    return response;
  } catch (error) {
    showMessage("error", "Error al cambiar el estado de la orden");
    throw error;
  }
};
interface DownloadResponse {
  message: string;
  data: string; // El contenido del CSV en formato string
}

export const dowloadOrderCSV = async (
  ordersIds: number[],
  projectId: number
): Promise<DownloadResponse | null> => {
  const ordersIdsObject = {
    order_ids: ordersIds
  };
  const formData = new FormData();
  formData.append("request", JSON.stringify(ordersIdsObject));

  try {
    const response: GenericResponse<string> = await API.post(
      `/marketplace/projects/${projectId}/downloadtxtorders`,
      formData
    );
    return { message: response.message, data: response.data };
  } catch (error) {
    if (error instanceof ApiError) {
      return { message: error.message, data: "" };
    }
    return null;
  }
};

export const downloadPartialOrderCSV = async (orderId: number, sendToBackorder: boolean) => {
  try {
    const payload = { sendToBackorder };
    const formData = new FormData();
    formData.append("request", JSON.stringify(payload));
    const response: GenericResponse<{
      txtContent: string;
      createdBackorderId: number | undefined;
    }> = await API.post(`/marketplace/orders/${orderId}/download-csv`, formData);
    return response.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw new Error(error.message || "Error al descargar el CSV parcial");
    }
    throw new Error("Error desconocido al descargar el CSV parcial");
  }
};
export const getInventoriesWarehouse = async (projectId: number, orderIds: number[]) => {
  try {
    const form = {
      projectId,
      orderIds
    };
    const response: GenericResponse<IInventoriesByWarehouse[]> = await API.post(
      `/warehouse/calculate-warehouses-availables`,
      form
    );

    if (response.success) {
      return response.data;
    }

    throw new Error(response.message || "Error al obtener las bodegas");
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Error desconocido al al obtener las bodegas"
    );
  }
};
export const getWarehouseProducts = async (
  projectId: number,
  warehouseId: number,
  orderId: number
) => {
  try {
    const form = {
      projectId,
      warehouseId,
      orderIds: [orderId]
    };
    const response: GenericResponse<IWarehouseProductsStock[]> = await API.post(
      `/warehouse/get-warehouse-details-by-order`,
      form
    );

    if (response.success) {
      return response.data;
    }

    throw new Error(response.message || `Error al obtener stock de la bodega ${warehouseId}`);
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : `Error desconocido al obtener stock de la bodega ${warehouseId}`
    );
  }
};
export const updateWarehouse = async (orderIds: number[], warehouseId: number) => {
  const payload = { orderIds, warehouseId };
  const response: GenericResponse<any> = await API.put("/marketplace/orders/warehouse", payload);

  if (response.success) {
    return response.success;
  } else {
    throw new Error(response.message || `Error al actualizar bodega`);
  }
};

export const getOrdersFilter = async () => {
  try {
    const response: GenericResponse<IMarketplaceOrdersFilters> =
      await API.get(`/marketplace/filter`);
    return response.data;
  } catch (error) {
    throw new Error("Error al obtener los filtros de órdenes");
  }
};

export const registerNewClient = async (guestData: {
  email: string;
  name: string;
  documentType: number;
  document: string;
  phoneNumber: string;
}) => {
  const body = {
    guestData
  };
  try {
    const response: GenericResponse<{
      email: string;
      name: string;
      documentType: number;
      document: string;
      phoneNumber: string;
      projectId: number;
      uuid: string;
    }> = await API.post(`/marketplace-guest/register-guest`, body);
    return response.data;
  } catch (error) {
    console.error("Error al registrar nuevo cliente:", error);
    throw new Error("Error al registrar nuevo cliente");
  }
};

export const sendInvitationMarketplace = async (email: string) => {
  const body = {
    email
  };
  try {
    const response: GenericResponse<any> = await API.post(`/marketplace/invite-guest`, body);
    return response.data;
  } catch (error) {
    console.error("Error al enviar invitación:", error);
    throw new Error("Error al enviar invitación");
  }
};

export const getMarketplaceConfig = async () => {
  try {
    const response: GenericResponse<{ id: number; name: string; value: string }[]> = await API.get(
      `/marketplace/marketplace-config`
    );
    return response.data;
  } catch (error) {
    console.error("Error al obtener la configuración del marketplace:", error);
    throw new Error("Error al obtener la configuración del marketplace");
  }
};

export const changeStatusOrder = async (orderId: number) => {
  try {
    const response: GenericResponse<any> = await API.post(
      `/marketplace/orders/${orderId}/mark-created`
    );
    return response.data;
  } catch (error) {
    console.error("Error al cambiar el estado de la orden:", error);
    throw new Error(
      error instanceof Error ? error.message : "Error al cambiar el estado de la orden"
    );
  }
};

// For dashboard sales data

export const getSalesDashboard = async () => {
  try {
    const response: GenericResponse<ISalesDashboard> = await API.get(`/galderma-dashboard/sellers`);
    return response.data;
  } catch (error) {
    console.error("Error fetching sales dashboard data:", error);
    throw error;
  }
};

export const generatePaymentLink = async (clientId: string, modelData: IPaymentLinkData) => {
  try {
    const response: GenericResponse<IGeneratePaymentLinkResponse> = await API.post(
      `/marketplace/clients/${clientId}/payment-links`,
      modelData
    );
    return response.data;
  } catch (error) {
    console.error("Error al generar el link de pago:", error);
    throw error;
  }
};
