import { GenericResponse } from "@/types/global/IGlobal";
import { IAdvisorVisitDetail } from "@/types/visits/IVisits";
import { API } from "@/utils/api/api";

/** Detalle del día de un asesor: GET /visit-admin/users/:user_id/day-detail?date=YYYY-MM-DD. */
export const getAdvisorVisitDetail = async (userId: number, date: string) => {
  const response: GenericResponse<IAdvisorVisitDetail> = await API.get(
    `/visit-admin/users/${userId}/day-detail`,
    { params: { date } }
  );
  return response;
};
