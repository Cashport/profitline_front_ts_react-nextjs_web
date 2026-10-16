/**
 * Servicio API de referencias dinamicas (HU-DT-REF-001, F3).
 * Consume los endpoints reales implementados en profitline_back (/api/data).
 * El `projectId` y el token los inyecta el interceptor de `API`.
 */

import config from "@/config";
import { API } from "@/utils/api/api";
import { GenericResponse } from "@/types/global/IGlobal";
import {
  IReferenceFile,
  IReferenceFilesFilters,
  IReferenceType
} from "@/types/dataQuality/IDataQuality";
import {
  buildReferenceCreateFormData,
  buildReferenceFilesQuery
} from "@/modules/dataQuality/references/references.utils";

const BASE = `${config.API_HOST}/data`;

export interface IReferenceCountry {
  id: number;
  country_name: string;
}

export interface IReferenceRegion {
  id: number;
  abbreviation: string;
  region_code: string;
  country_count: number;
}

export interface IReferenceClient {
  id: number;
  id_client: number;
  client_name: string;
  id_country: number | null;
  country_name?: string | null;
}

export const getReferenceTypes = async (): Promise<IReferenceType[]> => {
  const response: GenericResponse<IReferenceType[]> = await API.get(`${BASE}/reference-types`);
  return response.data;
};

export const getReferenceFiles = async (
  filters: IReferenceFilesFilters = {}
): Promise<IReferenceFile[]> => {
  const path = buildReferenceFilesQuery(filters);
  const response: GenericResponse<IReferenceFile[]> = await API.get(path);
  return response.data;
};

export const getReferenceFileDetail = async (id: number): Promise<IReferenceFile> => {
  const response: GenericResponse<IReferenceFile> = await API.get(`${BASE}/reference-files/${id}`);
  return response.data;
};

export interface ICreateReferenceFileInput {
  referenceType: string;
  scopeLevel: IReferenceFile["scope_level"];
  ownerId: number;
  description?: string | null;
  sheetName?: string | null;
  headerRow?: number | null;
  file: File;
}

export const createReferenceFile = async (
  input: ICreateReferenceFileInput
): Promise<IReferenceFile> => {
  const formData = buildReferenceCreateFormData({
    referenceType: input.referenceType,
    scopeLevel: input.scopeLevel,
    ownerId: input.ownerId,
    description: input.description,
    sheetName: input.sheetName,
    headerRow: input.headerRow,
    file: input.file
  });
  const response: GenericResponse<IReferenceFile> = await API.post(
    `${BASE}/reference-files`,
    formData
  );
  return response.data;
};

export interface IReplaceReferenceFileOptions {
  description?: string | null;
  sheetName?: string | null;
  headerRow?: number | null;
}

export const replaceReferenceFile = async (
  id: number,
  file: File,
  options: IReplaceReferenceFileOptions = {}
): Promise<IReferenceFile> => {
  const formData = new FormData();
  formData.append("file", file);
  if (options.description) formData.append("description", options.description);
  if (options.sheetName) formData.append("sheet_name", options.sheetName);
  if (options.headerRow !== undefined && options.headerRow !== null) {
    formData.append("header_row", String(options.headerRow));
  }
  const response: GenericResponse<IReferenceFile> = await API.patch(
    `${BASE}/reference-files/${id}/file`,
    formData
  );
  return response.data;
};

export const setReferenceFileStatus = async (
  id: number,
  isActive: boolean
): Promise<IReferenceFile> => {
  const response: GenericResponse<IReferenceFile> = await API.patch(
    `${BASE}/reference-files/${id}/status`,
    { is_active: isActive ? 1 : 0 }
  );
  return response.data;
};

// ---------------------------------------------------------------------------
// Catalogos auxiliares (solo lectura) para resolver nombres y selectores.
// ---------------------------------------------------------------------------

export const getReferenceCountries = async (): Promise<IReferenceCountry[]> => {
  const response: GenericResponse<IReferenceCountry[]> = await API.get(
    `${config.API_HOST}/location/countries`
  );
  return response.data;
};

/** Regiones de negocio `data.region` (NO usar /location/regions: son plazas). */
export const getReferenceRegions = async (): Promise<IReferenceRegion[]> => {
  const response: GenericResponse<IReferenceRegion[]> = await API.get(`${BASE}/regions`);
  return response.data;
};

/** Todos los clientes del proyecto (data.client_data). */
export const getReferenceClients = async (): Promise<IReferenceClient[]> => {
  const response: GenericResponse<IReferenceClient[]> = await API.get(`${BASE}/clients`);
  return response.data;
};
