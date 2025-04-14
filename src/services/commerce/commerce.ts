import { GenericResponse } from "@/types/global/IGlobal";
import { API } from "@/utils/api/api";
import {
  ICommerceAdresses,
  IConfirmOrderData,
  ICreateOrderData,
  IDiscountPackageAvailable,
  IEcommerceClient,
  IOrderConfirmedResponse,
  IOrderData,
  IProductData,
  ISingleOrder
} from "@/types/commerce/ICommerce";
import { MessageType } from "@/context/MessageContext";
import {
  InventoriesByWarehouse,
  WarehouseProductsStock
} from "@/components/molecules/modals/ChangeWarehouseModal/ChangeWarehouseModal";

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
  const response: GenericResponse<ICommerceAdresses[]> = await API.get(
    `/marketplace/clients/${clientId}/other-addresses`
  );
  return response;
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
  showMessage: (type: MessageType, content: string) => void
) => {
  try {
    const response: GenericResponse<{ id_order: number }> = await API.put(
      `/marketplace/projects/${projectId}/clients/${clientId}/draft-to-order/${orderId}`,
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
    if (response.success) {
      return { message: response.message, data: response.data };
    }
    return null;
  } catch (error) {
    return null;
  }
};

export const getInventoriesWarehouse = async (projectId: number, orderIds: number[]) => {
  try {
    const form = {
      projectId,
      orderIds
    };
    const response: GenericResponse<InventoriesByWarehouse[]> = await API.post(
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
    const response: GenericResponse<WarehouseProductsStock[]> = await API.post(
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
