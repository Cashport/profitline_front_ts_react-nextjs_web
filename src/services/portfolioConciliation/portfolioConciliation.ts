import axios from "axios";

import { API, default as instance } from "@/utils/api/api";

import { GenericResponse } from "@/types/global/IGlobal";
import { IConciliationUpload } from "@/types/portfolioConciliation/IPortfolioConciliation";

// El proyecto viaja en el header projectId (interceptores de api.ts), no en la ruta
export const portfolioConciliationPath = (clientUUID: string) =>
  `/massive-action/portfolio-conciliation/client/${clientUUID}`;

/**
 * Sube el Excel de cartera del cliente. El backend responde 202 con la carga
 * en PROCESSING: el resultado se consulta con `GET .../uploads/:uuid`.
 */
export const uploadPortfolioConciliation = async (
  clientUUID: string,
  file: File
): Promise<IConciliationUpload> => {
  const formData = new FormData();
  formData.append("file", file);
  const response: GenericResponse<IConciliationUpload> = await API.post(
    portfolioConciliationPath(clientUUID),
    formData
  );
  return response.data;
};

/** Descarga el Excel original de una carga exitosa (versionado en S3). */
export const downloadConciliationUploadFile = async (
  clientUUID: string,
  upload: Pick<IConciliationUpload, "uuid" | "file_name">
): Promise<void> => {
  try {
    // `instance` y no `API`: el interceptor de `API` devuelve sólo el cuerpo.
    const response = await instance.get(
      `${portfolioConciliationPath(clientUUID)}/uploads/${upload.uuid}/file`,
      { responseType: "blob", timeout: 120000 }
    );

    const url = window.URL.createObjectURL(response.data as Blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = upload.file_name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    // Con responseType "blob" el error del backend también llega como Blob.
    let message: string | undefined;
    if (axios.isAxiosError(error) && error.response?.data instanceof Blob) {
      try {
        message = JSON.parse(await error.response.data.text())?.message;
      } catch {
        // Cuerpo que no es JSON (p. ej. un 502 del gateway): queda el texto por defecto.
      }
    }
    throw new Error(message || "No se pudo descargar el archivo de la carga.");
  }
};
