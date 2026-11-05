import { GenericResponse } from "@/types/global/IGlobal";
import {
  IClosingComment,
  IClosingDataResponse,
  IClosingHistoryResponse,
  IClosingInfo
} from "@/types/closings/IClosings";
import { API } from "@/utils/api/api";

// GET /portfolio-closings — cierres del proyecto (en proceso o listos), el más reciente primero
export const getClosings = async () => {
  const response: GenericResponse<IClosingInfo[]> = await API.get("/portfolio-closings");
  return response.data;
};

// GET /portfolio-closings/:id — estado de una carga (se consulta mientras está en PROCESSING)
export const getClosing = async (id: number) => {
  const response: GenericResponse<IClosingInfo> = await API.get(`/portfolio-closings/${id}`);
  return response.data;
};

// POST /portfolio-closings — multipart: period (AAAA-MM) y el Excel en "file". Responde 202.
export const uploadClosing = async (period: string, file: File) => {
  const formData = new FormData();
  formData.append("period", period);
  formData.append("file", file);
  const response: GenericResponse<IClosingInfo> = await API.post("/portfolio-closings", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return response.data;
};

// DELETE /portfolio-closings/:id — libera el mes para volver a cargarlo
export const deleteClosing = async (id: number) => {
  await API.delete(`/portfolio-closings/${id}`);
};

// GET /portfolio-closings/template — plantilla vacía con un ejemplo por hoja
export const downloadClosingTemplate = async () => {
  const blob: Blob = await API.get("/portfolio-closings/template", { responseType: "blob" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "Plantilla_cierre.xlsx";
  link.click();
  URL.revokeObjectURL(url);
};

export const getClosingData = async (period: string) => {
  const response: GenericResponse<IClosingDataResponse> = await API.get(
    "/portfolio-closings/data",
    { params: { period } }
  );
  return response.data;
};

export const getClosingHistory = async () => {
  const response: GenericResponse<IClosingHistoryResponse> = await API.get(
    "/portfolio-closings/history"
  );
  return response.data;
};

export const getClosingComments = async () => {
  const response: GenericResponse<IClosingComment[]> = await API.get(
    "/portfolio-closings/comments"
  );
  return response.data;
};

export const createClosingComment = async (payload: {
  period: string;
  nit: string;
  comment: string;
}) => {
  const response: GenericResponse<IClosingComment> = await API.post(
    "/portfolio-closings/comments",
    payload
  );
  return response.data;
};

export const updateClosingComment = async (id: number, comment: string) => {
  const response: GenericResponse<IClosingComment> = await API.put(
    `/portfolio-closings/comments/${id}`,
    { comment }
  );
  return response.data;
};

export const deleteClosingComment = async (id: number) => {
  await API.delete(`/portfolio-closings/comments/${id}`);
};
