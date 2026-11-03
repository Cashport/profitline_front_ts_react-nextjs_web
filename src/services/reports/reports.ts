import { GenericResponse } from "@/types/global/IGlobal";
import {
  IPublishReportPayload,
  IReport,
  IReportsFilters,
  IReportType
} from "@/types/reports/IReports";
import { API } from "@/utils/api/api";

// GET /reports — informes del proyecto, lo más reciente primero
export const getReports = async ({ report_type_ids, from, to }: IReportsFilters) => {
  const response: GenericResponse<IReport[]> = await API.get("/reports", {
    // El back espera "1,3" y rechaza la lista vacía; axios omite los null.
    params: { report_type_ids: report_type_ids.join(",") || undefined, from, to }
  });
  return response;
};

// POST /reports — multipart/form-data: name, report_type_id y el archivo en la key "file"
export const createReport = async ({ name, report_type_id, file }: IPublishReportPayload) => {
  const formData = new FormData();
  formData.append("name", name);
  formData.append("report_type_id", String(report_type_id));
  formData.append("file", file);

  const response: GenericResponse<IReport> = await API.post("/reports", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return response;
};

// POST /reports/types — 409 si el nombre ya existe en el proyecto
export const createReportType = async (name: string) => {
  const response: GenericResponse<IReportType> = await API.post("/reports/types", { name });
  return response;
};
