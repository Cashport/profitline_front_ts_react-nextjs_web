import { getTranslator } from "@/i18n/translator";
import config from "@/config";
import { API } from "@/utils/api/api";
import {
  ICreateLocation,
  ICities,
  IResponseAddAddressToLocation,
  ILocation
} from "@/types/locations/ILocations";
import { MessageType } from "@/context/MessageContext";
import { GenericResponse } from "@/types/global/IGlobal";

export const fetchAllLocations = async (): Promise<ICities[]> => {
  try {
    const response: GenericResponse<ICities[]> = await API.get(`${config.API_HOST}/location`);
    if (response.status === 200) return response.data;
    return [];
  } catch (error) {
    return [];
  }
};

export const addAddressToLocation = async (
  data: {
    address: string;
    id: number;
    complement: string;
  },
  projectId: number,
  // eslint-disable-next-line no-unused-vars
  showMessage: (type: MessageType, content: string) => void
): Promise<IResponseAddAddressToLocation> => {
  const modelData: ICreateLocation = {
    address: data.address,
    city: data.id,
    complement: data.complement,
    project_id: projectId
  };

  try {
    const response: IResponseAddAddressToLocation = await API.post(
      `${config.API_HOST}/location`,
      modelData
    );

    if (response.success !== false) {
      showMessage("success", getTranslator("shared")("services.addressCreated"));
    } else {
      throw new Error("error");
    }
    return response;
  } catch (error) {
    console.warn("error creating new location: ", error);
    showMessage("error", getTranslator("shared")("services.createAddressError"));
    return error as any;
  }
};

export const getOneLocation = async (locationId: number, projectId: number): Promise<ILocation> => {
  try {
    const response: GenericResponse<ILocation> = await API.get(
      `${config.API_HOST}/location/${locationId}/project/${projectId}`
    );
    return response.data;
  } catch (error) {
    console.warn("Error getting location: ", error);
    return error as any;
  }
};
