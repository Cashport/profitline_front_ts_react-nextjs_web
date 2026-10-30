import useSWR from "swr";

import { getBranchRegisteredUsers } from "@/services/branches/branches";
import type { IBranchDetail } from "@/types/branches/IBranches";
import { ApiError } from "@/utils/api/api";

import { getUsersMock } from "../mocked-data";
import { toBranch } from "../utils/branches";

const SWR_OPTIONS = { revalidateOnFocus: false };

/**
 * Información de la sucursal y sus ejecutivos registrados
 * (GET /integration/profit360/branches/registeredUsers). `null` si la sucursal no existe.
 * Por ahora es solo lectura: agregar y eliminar usuarios llegan con sus endpoints.
 */
export const useBranchDetail = (branchId: string) => {
  const { data, error, isLoading } = useSWR(
    ["/integration/profit360/branches/registeredUsers", branchId],
    async (): Promise<IBranchDetail | null> => {
      try {
        const res = await getBranchRegisteredUsers(branchId);
        return {
          branch: toBranch(res.data.branch),
          users: res.data.users.map((u) => ({
            id: u.IdUsuario,
            name: u.NombreEjecutivo || u.CorreoEjecutivo || "Sin nombre",
            email: u.CorreoEjecutivo ?? ""
          }))
        };
      } catch (err) {
        // 404: no existe; 400: el id de la URL no es un GUID válido.
        if (err instanceof ApiError && (err.status === 404 || err.status === 400)) return null;
        throw err;
      }
    },
    SWR_OPTIONS
  );

  return { detail: data, error: error as Error | undefined, isLoading };
};

/**
 * Usuarios que se pueden asignar a una sucursal (modal "Agregar usuarios").
 * SIMULADO: el modal aún no se muestra; se conecta cuando exista el endpoint.
 */
export const useAssignableUsers = (enabled: boolean) => {
  const { data, isLoading } = useSWR(enabled ? "/users" : null, getUsersMock, SWR_OPTIONS);
  return { users: data ?? [], isLoading };
};
