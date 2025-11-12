import axios, { AxiosResponse } from "axios";
import config from "@/config";
import { API } from "@/utils/api/api";
import {
  ClientFormType,
  IClient,
  IClientWalletData,
  ICreateClient,
  IUpdateClient
} from "@/types/clients/IClients";
import { IBillingPeriodForm } from "@/types/billingPeriod/IBillingPeriod";

import { SUCCESS } from "@/utils/constants/globalConstants";
import { IAddAddressData } from "@/types/locations/ILocations";
import { GenericResponse } from "@/types/global/IGlobal";
import { MessageType } from "@/context/MessageContext";
import { stringToBoolean } from "@/utils/utils";

// create

export const createClient = async (
  idProject: string,
  rawData: ClientFormType,
  billingPeriod: IBillingPeriodForm,
  documents: any[],
  locationResponse: IAddAddressData,
  // eslint-disable-next-line no-unused-vars
  showMessage: (type: MessageType, content: string) => void
): Promise<any> => {
  const { infoClient: data } = rawData;

  const formatLocations = JSON.stringify([locationResponse]);

  const modelData: ICreateClient = {
    nit: data.nit,
    project_id: parseInt(idProject),
    client_name: data.client_name,
    business_name: data.business_name,
    phone: data.phone,
    condition_payment: data.condition_payment.value,
    email: data.email,
    radication_type: data.radication_type.value,
    document_type: data.document_type.value,
    locations: formatLocations,
    documents: documents,
    client_type_id: data.client_type.value,
    holding_id: data.holding_id?.value === 0 ? undefined : data.holding_id?.value,
    day_flag: typeof billingPeriod === "string" ? undefined : billingPeriod.day_flag === "true",
    day: typeof billingPeriod === "string" ? undefined : billingPeriod.day,
    order: typeof billingPeriod === "string" ? undefined : billingPeriod.order?.toLowerCase(),
    day_of_week:
      typeof billingPeriod === "string" ? undefined : billingPeriod.day_of_week?.toLowerCase()
  };

  const formData = new FormData();
  // Agregar los campos del modelo de datos al objeto FormData
  Object.keys(modelData).forEach((key) => {
    if (key === "documents" && Array.isArray(modelData[key])) {
      modelData[key].forEach((file: File) => {
        formData.append("documents", file);
      });
    } else if (modelData[key] !== undefined && modelData[key] !== null && modelData[key] !== "") {
      formData.append(key, modelData[key]);
    }
  });

  try {
    const response = await API.post(`${config.API_HOST}/client`, formData);

    if (response.status === SUCCESS) {
      showMessage("success", "El Cliente fue creado exitosamente.");
      return response;
    }

    return response;
  } catch (error) {
    console.warn("error creating new client: ", error);

    showMessage("error", "error creando cliente");

    throw error;
  }
};

export const getClientById = async (idUser: string, projectId: string): Promise<IClient> => {
  try {
    const response: GenericResponse<IClient> = await API.get(
      `${config.API_HOST}/client/${idUser}/project/${projectId}`
    );

    return response.data;
  } catch (error) {
    console.warn("error getting client by Id: ", error);
    return error as any;
  }
};

export const updateClient = async (
  idProject: string,
  clientId: string,
  rawData: ClientFormType,
  locationResponse: any,
  hasLocationChanged: boolean,
  // eslint-disable-next-line no-unused-vars
  showMessage: (type: MessageType, content: string) => void,
  billingPeriod?: IBillingPeriodForm
): Promise<any> => {
  const { infoClient: data } = rawData;

  const formatLocations = hasLocationChanged
    ? JSON.stringify([locationResponse])
    : JSON.stringify(locationResponse);

  const modelData: IUpdateClient & Record<string, any> = {
    business_name: data.business_name,
    phone: data.phone,
    condition_payment: data.condition_payment.value,
    email: data.email,
    radication_type: data.radication_type.value,
    document_type: data.document_type.value,
    locations: formatLocations,
    holding_id: data.holding_id.value,
    day_flag: stringToBoolean(billingPeriod?.day_flag),
    day: billingPeriod?.day,
    order: billingPeriod?.order?.toLowerCase(),
    day_of_week: billingPeriod?.day_of_week?.toLowerCase()
  };

  const formData = new FormData();

  Object.keys(modelData).forEach((key) => {
    if (modelData[key] !== undefined && modelData[key] !== null && modelData[key] !== "") {
      formData.append(key, modelData[key]);
    }
  });

  try {
    const response = await API.put(
      `${config.API_HOST}/client/${clientId}/project/${idProject}`,
      modelData
    );

    if (response.status === SUCCESS) {
      showMessage("success", "El Cliente fue actualizado exitosamente.");
      return response;
    }
    return response;
  } catch (error) {
    console.warn("error updating client: ", error);
    showMessage("error", "error actualizando cliente");
    throw error;
  }
};

export const deleteClientById = async (
  idUser: string,
  projectId: string,
  // eslint-disable-next-line no-unused-vars
  showMessage: (type: MessageType, content: string) => void,
  onClose: () => void
): Promise<any> => {
  try {
    const response = await API.delete(`${config.API_HOST}/client/${idUser}/project/${projectId}`);

    if (response.status === SUCCESS) {
      showMessage("success", "El Cliente fue eliminado exitosamente.");
      onClose();
    } else {
      showMessage("error", "Oops ocurrio un error.");
      onClose();
    }

    return response;
  } catch (error) {
    console.warn("error deleting client by Id: ", error);
    return error as any;
  }
};

type PropsGetAllByProject = {
  idProject: string;
  city?: number[];
  holding?: number[];
  risk?: number[];
  payment_condition?: number[];
  radication_type?: number[];
  status?: number[];
};
export const getAllByProject = async (props: PropsGetAllByProject): Promise<IClient[]> => {
  const { city, holding, risk, payment_condition, radication_type, status, idProject } = props;
  const response: GenericResponse<IClient[]> = await API.get(`/client/project/${idProject}`, {
    params: {
      city,
      holding,
      risk,
      payment_condition,
      radication_type,
      status
    }
  });
  return response?.data;
};

export const changeClientStatus = async (
  clientId: string,
  newStatus: number,
  // eslint-disable-next-line no-unused-vars
  showMessage: (type: MessageType, content: string) => void
) => {
  try {
    const response = await API.put(`${config.API_HOST}/client/change-status/${clientId}`, {
      status: newStatus
    });

    if (response.status === 200) {
      showMessage("success", "Estado del cliente cambiado exitosamente.");
    } else {
      showMessage("error", "Oops, ocurrió un error cambiando el estado del cliente.");
    }
    return response;
  } catch (error) {
    console.warn("Error cambiando el estado del cliente: ", error);
    showMessage("error", "Oops, ocurrió un error cambiando el estado del cliente.");
    throw error;
  }
};

type PropsEditClientDocument = {
  clientId: string;
  documentId: number;
  file: File;
  // eslint-disable-next-line no-unused-vars
  showMessage: (type: MessageType, content: string) => void;
};
export const editClientDocument = async ({
  clientId,
  documentId,
  file,
  showMessage
}: PropsEditClientDocument) => {
  const modelData: { [key: string]: any } = {
    client_id: clientId,
    project_id: "1",
    document_id: documentId,
    file: file
  };

  const formData = new FormData();

  Object.keys(modelData).forEach((key) => {
    formData.append(key, modelData[key]);
  });

  try {
    const response = await API.put(`${config.API_HOST}/client/change-documents`, formData, {});

    if (response.status === SUCCESS) {
      showMessage("success", "Documento actualizado exitosamente.");
      return response;
    }
  } catch (error) {
    console.warn("Error editando documentos cliente: ", error);
    showMessage("error", "Oops, ocurrió un error editando el documento del cliente.");
    alert("error");
    throw error;
  }
};

export const getMobileToken = async (clientUUID: string): Promise<string> => {
  const body = {
    clientUUID
  };
  try {
    console.log("entrando uuid", clientUUID);
    const response: { status: number; message: string; token: string } = await API.post(
      `${config.API_HOST}/client/create-mobile-token`,
      body,
      {
        headers: {
          projectId: "165"
        }
      }
    );
    console.log("saliendo", response);

    if (response.status !== 200) {
      throw new Error(`Failed to get mobile token: ${response.message}`);
    }
    return response.token;
  } catch (error) {
    console.error("error getting mobile token: ", error);
    throw error;
  }
};

export const getClientWallet = async (token: string): Promise<IClientWalletData> => {
  try {
    const response: AxiosResponse<GenericResponse<IClientWalletData>> = await axios.get(
      `${config.API_HOST}/client/cartera`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    console.log("response client wallet: ", response);
    return response.data.data;
  } catch (error) {
    console.error("error getting client wallet: ", error);
    throw error;
  }
};

export const getPayloadByTicket = async (ticketId: string): Promise<any> => {
  try {
    const response = await API.get(`${config.API_HOST}/client/get-payload-by-ticket`, {
      params: { ticketId }
    });
    const data = response?.data?.data || response?.data || response;

    return data;
  } catch (error) {
    console.warn("error getting payload by ticket: ", error);
    return null;
  }
};
