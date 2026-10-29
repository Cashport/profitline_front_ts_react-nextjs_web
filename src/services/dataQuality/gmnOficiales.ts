/**
 * Servicio API del catalogo maestro de GMN oficiales (HU GMN + MATCH).
 * Consume los endpoints reales de profitline_back (/api/data).
 * El `projectId` y el token los inyecta el interceptor de `API`.
 */

import config from "@/config";
import { API } from "@/utils/api/api";
import { GenericResponse } from "@/types/global/IGlobal";
import {
  IGmnOficialesLoadResult,
  IGmnOficialesLoadRow,
  IGmnOficialesValidationReport
} from "@/types/dataQuality/IDataQuality";
import { buildGmnOficialesFormData } from "@/modules/dataQuality/gmnOficiales/gmnOficiales.utils";

const BASE = `${config.API_HOST}/data`;

/**
 * Validacion previa (dry-run) del archivo oficial. NO escribe en base de datos:
 * verifica estructura, paises y duplicados para mostrarlos antes de confirmar.
 */
export const validateGmnOficiales = async (
  file: File,
  useAsTemplate?: boolean
): Promise<IGmnOficialesValidationReport> => {
  const formData = buildGmnOficialesFormData(file);
  if (useAsTemplate !== undefined) {
    formData.append("use_as_template", String(useAsTemplate));
  }
  const response: GenericResponse<IGmnOficialesValidationReport> = await API.post(
    `${BASE}/catalog/material-master/validate`,
    formData
  );
  return response.data;
};

/** Carga transaccional e idempotente del catalogo oficial de GMN. */
export const uploadGmnOficiales = async (
  file: File,
  useAsTemplate?: boolean
): Promise<IGmnOficialesLoadResult> => {
  const formData = buildGmnOficialesFormData(file);
  if (useAsTemplate !== undefined) {
    formData.append("use_as_template", String(useAsTemplate));
  }
  const response: GenericResponse<IGmnOficialesLoadResult> = await API.post(
    `${BASE}/catalog/material-master/upload`,
    formData
  );
  return response.data;
};

/** Ultima carga registrada (puede ser null si nunca se ha cargado). */
export const getGmnOficialesStatus = async (): Promise<IGmnOficialesLoadRow | null> => {
  const response: GenericResponse<IGmnOficialesLoadRow | null> = await API.get(
    `${BASE}/catalog/material-master/status`
  );
  return response.data;
};
