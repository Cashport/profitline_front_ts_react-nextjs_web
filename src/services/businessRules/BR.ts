import { getTranslator } from "@/i18n/translator";
import config from "@/config";
import { MessageInstance } from "antd/es/message/interface";
import { API } from "@/utils/api/api";
import { SUCCESS } from "@/utils/constants/globalConstants";

import { channel, IChanel } from "@/types/bre/IBRE";
import { GenericResponse } from "@/types/global/IGlobal";

export const getBusinessRulesByProjectId = async (idProject: number): Promise<IChanel[]> => {
  try {
    const response: GenericResponse<IChanel[]> = await API.get(
      `${config.API_HOST}/bussines-rule/project/${idProject}`
    );
    return response.data;
  } catch (error) {
    return error as any;
  }
};
export const getChannelByProjectId = async (idProject: number): Promise<channel[]> => {
  try {
    const response: GenericResponse<channel[]> = await API.get(
      `${config.API_HOST}/bussines-rule/project/${idProject}/channel`
    );
    return response.data;
  } catch (error) {
    return error as any;
  }
};

export const addChannelBR = async (
  project_id: number,
  channelDescription: string,
  messageApi: MessageInstance
) => {
  const sendData = {
    project_id,
    channel_description: channelDescription
  };
  try {
    const response = await API.post(`${config.API_HOST}/bussines-rule/project/channel`, sendData);
    if (response.status === SUCCESS) {
      messageApi.open({
        type: "success",
        content: getTranslator("shared")("services.channelCreated")
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
export const addLineBR = async (
  channelId: string,
  lineDescription: string,
  messageApi: MessageInstance
) => {
  const sendData = {
    channel_id: channelId,
    line_description: lineDescription
  };
  try {
    const response = await API.post(
      `${config.API_HOST}/bussines-rule/project/channel/line`,
      sendData
    );
    if (response.status === SUCCESS) {
      messageApi.open({
        type: "success",
        content: getTranslator("shared")("services.lineCreated")
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
export const addSublineBR = async (
  lineId: string,
  sublineDescription: string,
  messageApi: MessageInstance
) => {
  const sendData = {
    line_id: lineId,
    subline_description: sublineDescription
  };
  try {
    const response = await API.post(
      `${config.API_HOST}/bussines-rule/project/channel/line/subline`,
      sendData
    );
    if (response.status === SUCCESS) {
      messageApi.open({
        type: "success",
        content: getTranslator("shared")("services.sublineCreated")
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
export const removeChannelBR = async (
  project_id: number,
  channel_id: string,
  messageApi: MessageInstance
) => {
  try {
    const response = await API.delete(
      `${config.API_HOST}/bussines-rule/project/${project_id}/channel/${channel_id}`
    );
    if (response.status === SUCCESS) {
      messageApi.open({
        type: "success",
        content: getTranslator("shared")("services.channelDeleted")
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

export const removeLineBR = async (
  channel_id: number,
  line_id: number,
  messageApi: MessageInstance
) => {
  try {
    const response = await API.delete(
      `${config.API_HOST}/bussines-rule/channel/${channel_id}/line/${line_id}`
    );
    if (response.status === SUCCESS) {
      messageApi.open({
        type: "success",
        content: getTranslator("shared")("services.lineDeleted")
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

export const removeSublineBR = async (
  line_id: number,
  subline_id: number,
  messageApi: MessageInstance
) => {
  try {
    const response = await API.delete(
      `${config.API_HOST}/bussines-rule/line/${line_id}/subline/${subline_id}`
    );
    if (response.status === SUCCESS) {
      messageApi.open({
        type: "success",
        content: getTranslator("shared")("services.sublineDeleted")
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
