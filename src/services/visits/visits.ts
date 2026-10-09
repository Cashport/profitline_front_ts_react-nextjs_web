import { GenericResponse } from "@/types/global/IGlobal";
import { IAdvisorVisitDetail } from "@/types/visits/IVisits";
import { API } from "@/utils/api/api";

/** Detalle del día de un asesor: GET /visit-admin/users/:user_id/day-detail. */
export const getAdvisorVisitDetail = async (userId: number) => {
  const response: GenericResponse<IAdvisorVisitDetail> = await API.get(
    `/visit-admin/users/${userId}/day-detail`
  );
  return response;
};
