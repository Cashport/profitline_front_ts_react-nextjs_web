import config from "@/config";
import { API } from "@/utils/api/api";
import { GenericResponsePage } from "@/types/global/IGlobal";
import { IPurchaseOrder } from "@/types/purchaseOrders/purchaseOrders";

export const getAllOrdersUrl = (projectId: number): string => {
  return `${config.API_HOST}/purchaseOrder/all?projectId=${projectId}`;
};

export const getAllOrders = async (
  projectId: number
): Promise<GenericResponsePage<IPurchaseOrder[]>> => {
  try {
    const response: GenericResponsePage<IPurchaseOrder[]> = await API.get(
      getAllOrdersUrl(projectId)
    );

    return response;
  } catch (error) {
    throw error;
  }
};
