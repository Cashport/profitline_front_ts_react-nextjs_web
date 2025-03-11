import config from "@/config";
import { API } from "@/utils/api/api";

import { SUCCESS } from "@/utils/constants/globalConstants";
import { MessageInstance } from "antd/es/message/interface";

export const addClientType = async (
  name: string,
  project_id: number,
  messageApi: MessageInstance
) => {
  try {
    const response = await API.post(`/client/types`, {
      name,
      project_id
    });
    if (response.status === SUCCESS) {
      messageApi.open({
        type: "success",
        content: `Tipo de  fue cliente creado exitosamente.`
      });
    } else {
      messageApi.open({
        type: "error",
        content: "Oops ocurrio un error."
      });
    }
    return response;
  } catch (error) {
    throw error;
  }
};

//Functionr to remove a client type using this url client/types/idClientType
export const removeClientType = async (id: number, messageApi: MessageInstance) => {
  try {
    const response = await API.delete(`/client/types/${id}`);
    if (response.status === SUCCESS) {
      messageApi.open({
        type: "success",
        content: "Tipo de cliente eliminado exitosamente."
      });
    } else {
      messageApi.open({
        type: "error",
        content: "Oops ocurrio un error eliminando tipo de cliente."
      });
    }
    return response;
  } catch (error) {
    throw error;
  }
};

export const addDocumentsClientType = async (formData: FormData, messageApi: MessageInstance) => {
  try {
    const response = await API.post(`${config.API_HOST}/client/documents`, formData);
    if (response.status === SUCCESS) {
      messageApi.open({
        type: "success",
        content: "Tipo de Documento creado exitosamente."
      });
    } else {
      messageApi.open({
        type: "error",
        content: "Oops ocurrio un error creando tipo de documento."
      });
    }
    return response;
  } catch (error) {
    console.warn("error creando tipo de documento: ", error);
    throw error;
  }
};

export const removeDocumentsClientType = async (id: number, messageApi?: MessageInstance) => {
  try {
    const response = await API.delete(`/client/documents/${id}`);
    if (response.status === SUCCESS) {
      messageApi?.open({
        type: "success",
        content: "Tipo de Documento eliminado exitosamente."
      });
    } else {
      messageApi?.open({
        type: "error",
        content: "Oops ocurrio un error eliminando tipo de documento."
      });
    }
    return response;
  } catch (error) {
    console.warn("error eliminando tipo de documento: ", error);
    throw error;
  }
};
