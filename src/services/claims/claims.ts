import config from "@/config";
import { API } from "@/utils/api/api";

import { GenericResponse } from "@/types/global/IGlobal";
import { IClaim, ICreateClaimPayload, IUpdateClaimPayload } from "@/types/claims/IClaims";

export const createClaim = async (
  payload: ICreateClaimPayload
): Promise<GenericResponse<IClaim>> => {
  try {
    const response: GenericResponse<IClaim> = await API.post(`${config.API_HOST}/claims`, payload);
    return response;
  } catch (error) {
    console.error("Error creating claim:", error);
    throw error;
  }
};

export const updateClaim = async (
  claimId: number,
  payload: IUpdateClaimPayload
): Promise<GenericResponse<IClaim>> => {
  try {
    const response: GenericResponse<IClaim> = await API.put(
      `${config.API_HOST}/claims/${claimId}`,
      payload
    );
    return response;
  } catch (error) {
    console.error("Error updating claim:", error);
    throw error;
  }
};

export const deleteClaim = async (claimId: number): Promise<GenericResponse<null>> => {
  try {
    const response: GenericResponse<null> = await API.delete(
      `${config.API_HOST}/claims/${claimId}`
    );
    return response;
  } catch (error) {
    console.error("Error deleting claim:", error);
    throw error;
  }
};
