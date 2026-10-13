import axios from "axios";

import { API, default as instance } from "@/utils/api/api";

import { GenericResponse } from "@/types/global/IGlobal";
import { IInvoiceBulkSearchData, InvoiceBulkSearchInput } from "@/types/invoices/IInvoices";

// El proyecto viaja en el header projectId (interceptores de api.ts), no en la ruta
const bulkSearchPath = (clientUUID: string) => `/invoice/bulk-search/client/${clientUUID}`;

// El archivo va tal cual y el backend lo lee (.xlsx, .csv o .txt); si hay archivo ignora id_erp_list
const buildBulkSearchBody = (input: InvoiceBulkSearchInput) => {
  if ("ids" in input) return { id_erp_list: input.ids };

  const formData = new FormData();
  formData.append("file", input.file);
  return formData;
};

/**
 * Clasifica los IDs ERP contra el cliente: encontradas, no encontradas, de otro
 * cliente y duplicadas. Busca en todo el proyecto y no tiene límite de IDs.
 */
export const searchInvoicesBulk = async (
  clientUUID: string,
  input: InvoiceBulkSearchInput,
  signal?: AbortSignal
): Promise<IInvoiceBulkSearchData> => {
  const response: GenericResponse<IInvoiceBulkSearchData> = await API.post(
    bulkSearchPath(clientUUID),
    buildBulkSearchBody(input),
    { signal }
  );
  return response.data;
};

/**
 * Descarga el .xlsx de resultados con la misma entrada de la búsqueda: una fila
 * por ID recibido, en el orden en que llegó.
 */
export const downloadInvoicesBulkSearch = async (
  clientUUID: string,
  input: InvoiceBulkSearchInput
): Promise<void> => {
  try {
    // `instance` y no `API`: el interceptor de `API` devuelve sólo el cuerpo y
    // aquí hacen falta los headers para leer el nombre del archivo.
    const response = await instance.post(
      `${bulkSearchPath(clientUUID)}/download`,
      buildBulkSearchBody(input),
      {
        responseType: "blob",
        timeout: 120000,
        // `instance` manda JSON por defecto y axios convertiría el FormData a JSON
        headers: "file" in input ? { "Content-Type": "multipart/form-data" } : undefined
      }
    );

    const disposition = (response.headers["content-disposition"] as string) || "";
    const filename =
      disposition.match(/filename="?([^";]+)"?/)?.[1] || "busqueda_masiva_resultados.xlsx";

    const url = window.URL.createObjectURL(response.data as Blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
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
    throw new Error(message || "No se pudo descargar el Excel de resultados.");
  }
};
