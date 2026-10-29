import axios from "axios";

import { GenericResponse } from "@/types/global/IGlobal";
import {
  IUpsertVisitFormBody,
  IVisitForm,
  IVisitFormListItem,
  IVisitFormResponsesExportParams,
  IVisitFormsFilters
} from "@/types/surveys/ISurveys";
import instance, { API } from "@/utils/api/api";

// GET /visit-forms — encuestas del proyecto con sus conteos
export const getVisitForms = async ({ status, created_by, from, to }: IVisitFormsFilters) => {
  const response: GenericResponse<IVisitFormListItem[]> = await API.get("/visit-forms", {
    // El back espera "ACTIVE,INACTIVE" / "7,9" y rechaza la lista vacía; axios omite los null.
    params: {
      status: status.join(",") || undefined,
      created_by: created_by.join(",") || undefined,
      from,
      to
    }
  });
  return response;
};

// POST /visit-forms — crea la versión 1. 400 trae data.errors; 409 si el nombre ya existe
export const createVisitForm = async (body: IUpsertVisitFormBody) => {
  const response: GenericResponse<IVisitForm> = await API.post("/visit-forms", body);
  return response;
};

// PUT /visit-forms/:form_id — solo lo que cambia; una definición distinta publica la versión siguiente
export const updateVisitForm = async (formId: number, body: IUpsertVisitFormBody) => {
  const response: GenericResponse<IVisitForm> = await API.put(`/visit-forms/${formId}`, body);
  return response;
};

/** Descarga las respuestas del periodo en Excel o CSV. */
export const exportVisitFormResponses = async (
  formId: number,
  params: IVisitFormResponsesExportParams
): Promise<void> => {
  try {
    // `instance` y no `API`: el interceptor de `API` devuelve sólo el cuerpo y
    // aquí hacen falta los headers para leer el nombre del archivo.
    const response = await instance.get(`/visit-forms/${formId}/responses/export`, {
      params,
      responseType: "blob",
      timeout: 60000
    });

    const disposition = (response.headers["content-disposition"] as string) || "";
    const filename =
      disposition.match(/filename="?([^";]+)"?/)?.[1] ||
      `respuestas_${params.from}_${params.to}.${params.format}`;

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
    throw new Error(message || "No se pudieron descargar las respuestas.");
  }
};
