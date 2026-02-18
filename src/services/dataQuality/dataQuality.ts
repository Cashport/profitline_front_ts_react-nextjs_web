import config from "@/config";
import instance, { API } from "@/utils/api/api";
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
  IParameterData,
  ICreateIntakeRequest,
  ICatalogMaterial,
  ICatalogSelectOption,
  ICreateCatalogRequest,
  IGetFiltersAlerts
} from "@/types/dataQuality/IDataQuality";

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

export const createIntake = async (modelData: ICreateIntakeRequest): Promise<any> => {
  const formData = new FormData();
  for (const key in modelData) {
    const value = (modelData as any)[key];
    formData.append(
      key,
      typeof value === "object" && !(value instanceof File) ? JSON.stringify(value) : value
    );
  }
  try {
    const response: GenericResponse<any> = await API.post(
      `${config.API_HOST}/data/client-archive-monthly`,
      formData
    );
    return response.data;
  } catch (error) {
    console.error("Error creating intake:", error);
    throw error;
  }
};

export const editIntake = async (
  intakeId: number,
  modelData: ICreateIntakeRequest
): Promise<any> => {
  const formData = new FormData();
  for (const key in modelData) {
    const value = (modelData as any)[key];
    if (value === null || value === undefined) continue;
    formData.append(
      key,
      typeof value === "object" && !(value instanceof File) ? JSON.stringify(value) : value
    );
  }
  try {
    const response: GenericResponse<any> = await API.put(
      `${config.API_HOST}/data/client-archive-monthly/${intakeId}`,
      formData
    );
    return response.data;
  } catch (error) {
    console.error("Error editing intake:", error);
    throw error;
  }
};

export const getCatalogMaterialsForSelect = async (
  countryId: number
): Promise<ICatalogMaterial[]> => {
  try {
    const response: GenericResponse<ICatalogMaterial[]> = await API.get(
      `${config.API_HOST}/data/catalog/material?country_id=${countryId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching catalog material:", error);
    throw error;
  }
};

export const getCatalogMaterialType = async (): Promise<ICatalogSelectOption[]> => {
  try {
    const response: GenericResponse<ICatalogSelectOption[]> = await API.get(
      "/data/catalog/material-type-vol"
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching catalog material type:", error);
    throw error;
  }
};

export const getMaterialProductType = async (): Promise<ICatalogSelectOption[]> => {
  try {
    const response: GenericResponse<ICatalogSelectOption[]> = await API.get(
      "/data/catalog/material-product-type"
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching material product type:", error);
    throw error;
  }
};

export const createCatalog = async (catalogData: ICreateCatalogRequest): Promise<any> => {
  try {
    const response: GenericResponse<any> = await API.post(
      `${config.API_HOST}/data/catalog/materials`,
      catalogData
    );
    return response.data;
  } catch (error) {
    console.error("Error creating catalog:", error);
    throw error;
  }
};

export const editCatalog = async (
  catalogId: number,
  catalogData: ICreateCatalogRequest
): Promise<any> => {
  try {
    const response: GenericResponse<any> = await API.put(
      `${config.API_HOST}/data/catalog/materials/${catalogId}`,
      catalogData
    );
    return response.data;
  } catch (error) {
    console.error("Error editing catalog:", error);
    throw error;
  }
};

export const deleteCatalog = async (catalogId: number): Promise<any> => {
  try {
    const response: GenericResponse<any> = await API.delete(
      `${config.API_HOST}/data/catalog/materials/${catalogId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting catalog:", error);
    throw error;
  }
};

export const uploadIntakeFile = async (
  id_archives_client_data: number,
  file: File
): Promise<any> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("id_archives_client_data", id_archives_client_data.toString());
  try {
    const response: GenericResponse<any> = await API.post(
      `${config.API_HOST}/data/create-intake`,
      formData
    );
    return response.data;
  } catch (error) {
    console.error("Error uploading intake file:", error);
    throw error;
  }
};

export const getAlertsFilters = async (): Promise<IGetFiltersAlerts> => {
  try {
    const response: GenericResponse<IGetFiltersAlerts> = await API.get(
      `${config.API_HOST}/data/filters`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching alerts filters:", error);
    throw error;
  }
};

export const downloadCSV = async (id_archives_client_data: number): Promise<Blob> => {
  try {
    const response = await instance.get(
      `${config.API_HOST}/data/sales-csv/${id_archives_client_data}`,
      {
        responseType: "blob"
      }
    );
    return response.data;
  } catch (error: any) {
    if (error?.response?.data instanceof Blob) {
      const text = await error.response.data.text();
      const parsed = JSON.parse(text);
      throw new Error(parsed.message || "Error al descargar el archivo");
    }
    throw error;
  }
};

export const deleteIntakeFile = async (fileId: number): Promise<any> => {
  console.log("Attempting to delete intake file with ID:", fileId);
  try {
    const response: GenericResponse<any> = await API.post(
      `${config.API_HOST}/data/archives-client-data/${fileId}/delete`
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting intake file:", error);
    throw error;
  }
};

export const downloadCatalogFile = async ({
  clientId,
  countryId
}: {
  clientId?: number | string;
  countryId?: number | string;
}) => {
  const params = [];
  if (clientId) params.push(`id_client=${clientId}`);
  if (countryId) params.push(`id_country=${countryId}`);
  const queryString = params.length > 0 ? `?${params.join("&")}` : "";
  try {
    const response: GenericResponse<{
      url: string;
      filename: string;
    }> = await API.get(`${config.API_HOST}/data/catalog/materials/download${queryString}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
