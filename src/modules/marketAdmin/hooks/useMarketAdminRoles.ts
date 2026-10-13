import useSWR from "swr";

import { fetcher } from "@/utils/api/api";
import { GenericResponse } from "@/types/global/IGlobal";
import { IRol } from "@/types/roles/IRoles";

// GET /role — roles del proyecto, usados para el filtro de Rol del listado.
// No se usa getAllRoles() de services/roles: ese servicio devuelve el Error en
// vez de relanzarlo, y el consumidor termina haciendo .map sobre un Error.
export const useMarketAdminRoles = () => {
  const { data, error, isLoading } = useSWR<GenericResponse<IRol[]>>("/role", fetcher);

  return { data: data?.data ?? [], isLoading, error };
};
