import config from "@/config";
import { API } from "@/utils/api/api";

export const generateLink = async (clientUUID: string, email: string): Promise<any> => {
  try {
    const response: any = await API.post(`${config.API_HOST}/external-link`, {
      client_uuid: clientUUID,
      email
    });

    return response;
  } catch (error) {
    return Promise.reject(error);
  }
};
