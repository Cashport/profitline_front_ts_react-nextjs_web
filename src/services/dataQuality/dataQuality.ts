import config from "@/config";
import { API } from "@/utils/api/api";
import { GenericResponse } from "@/types/global/IGlobal";
import {
  ISummaryCountries,
  IClientDataList,
  ICreateClientRequest,
  ICreateClientResponse,
  IUpdateClientRequest,
  IUpdateClientResponse,
  IDeleteClientResponse,
  IClientDetail,
  IParameterData
} from "@/types/dataQuality/IDataQuality";
import { useAppStore } from "@/lib/store/store";

export const getSummaryCountries = async (projectId: number): Promise<ISummaryCountries> => {
  try {
    const response: GenericResponse<ISummaryCountries> = await API.get(
      `${config.API_HOST}/data/countries-summary/${projectId}?page=1&limit=10`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching summary countries:", error);
    throw error;
  }
};

export const getClientData = async (
  idCountry: string,
  idProject: number,
  limit: number = 10,
  page: number = 1
): Promise<IClientDataList> => {
  try {
    const response: GenericResponse<IClientDataList> = await API.get(
      `${config.API_HOST}/data/sumary/${idCountry}/${idProject}?limit=${limit}&page=${page}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching client data:", error);
    throw error;
  }
};

export const createClient = async (
  clientData: ICreateClientRequest
): Promise<ICreateClientResponse> => {
  try {
    const response: GenericResponse<ICreateClientResponse> = await API.post(
      `${config.API_HOST}/data/create-client`,
      clientData
    );
    return response.data;
  } catch (error) {
    console.error("Error creating client:", error);
    throw error;
  }
};

export const updateClient = async (
  clientId: number,
  clientData: IUpdateClientRequest
): Promise<IUpdateClientResponse> => {
  try {
    const response: GenericResponse<IUpdateClientResponse> = await API.put(
      `${config.API_HOST}/data/client/${clientId}`,
      clientData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating client:", error);
    throw error;
  }
};

export const deleteClient = async (clientId: number): Promise<IDeleteClientResponse> => {
  try {
    const response: GenericResponse<IDeleteClientResponse> = await API.delete(
      `${config.API_HOST}/data/client/${clientId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting client:", error);
    throw error;
  }
};

export const getClientDetail = async (
  idClient: string,
  idProject: number
): Promise<IClientDetail> => {
  try {
    const response: GenericResponse<IClientDetail> = await API.get(
      `${config.API_HOST}/data/client-detail/${idClient}/${idProject}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching client detail:", error);
    throw error;
  }
};

export const getParametersData = async (
  projectId: number,
  clientId: string
): Promise<IParameterData> => {
  try {
    const response: GenericResponse<IParameterData> = await API.get(
      `${config.API_HOST}/data/clients/${clientId}/parametrization/${projectId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching parameters data:", error);
    throw error;
  }
};

export const createIntake = async (modelData: {
  file: File;
  id_client_data: number;
  id_type_archive: number;
  id_status: number;
}): Promise<void> => {
  const formData = new FormData();
  for (const key in modelData) {
    formData.append(key, (modelData as any)[key]);
  }
  try {
    const response: GenericResponse<void> = await API.post(
      `${config.API_HOST}/data/client-archive-monthly`,
      formData
    );
    return response.data;
  } catch (error) {
    console.error("Error creating intake:", error);
    throw error;
  }
};
