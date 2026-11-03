import { getTranslator } from "@/i18n/translator";
import config from "@/config";
import { IZones } from "@/types/zones/IZones";
import { API, getIdToken } from "@/utils/api/api";
import { SUCCESS } from "@/utils/constants/globalConstants";
import { MessageInstance } from "antd/es/message/interface";

export const getAllZones = async ({ idProject }: { idProject: string }): Promise<IZones> => {
  try {
    const response: IZones = await API.get(`${config.API_HOST}/zone/project/${idProject}`);

    return response;
  } catch (error) {
    return error as any;
  }
};

export const addZone = async ({
  name,
  project_id,
  messageApi
}: {
  name: string;
  project_id: string;
  messageApi: MessageInstance;
}): Promise<any> => {
  try {
    const response = await API.post(`${config.API_HOST}/zone/`, {
      zone_description: name,
      project_id
    });
    if (response.status === SUCCESS) {
      messageApi.open({
        type: "success",
        content: getTranslator("shared")("services.zoneCreated")
      });
    } else {
      messageApi.open({
        type: "error",
        content: getTranslator("shared")("services.genericError")
      });
    }

    return response;
  } catch (error) {
    return error as any;
  }
};

export const removeZoneById = async ({
  idZone,
  messageApi
}: {
  idZone: string;
  messageApi: MessageInstance;
}): Promise<any> => {
  const token = await getIdToken();
  try {
    const response = await API.delete(`${config.API_HOST}/zone/${idZone}`, {
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Bearer ${token}`
      }
    });
    if (response.status === SUCCESS) {
      messageApi.open({
        type: "success",
        content: getTranslator("shared")("services.zoneDeleted")
      });
    } else {
      messageApi.open({
        type: "error",
        content: getTranslator("shared")("services.genericError")
      });
    }

    return response;
  } catch (error) {
    return error as any;
  }
};
