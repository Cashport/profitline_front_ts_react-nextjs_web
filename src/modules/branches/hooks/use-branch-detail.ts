import useSWR from "swr";

import {
  addBranchUsers,
  getBranchesAllUsers,
  getBranchRegisteredUsers,
  removeBranchUsers
} from "@/services/branches/branches";
import type { IBranchDetail, IBranchUser } from "@/types/branches/IBranches";
import { useAppStore } from "@/lib/store/store";
import { ApiError } from "@/utils/api/api";

import { toBranch } from "../utils/branches";

const SWR_OPTIONS = { revalidateOnFocus: false };

/**
 * Información de la sucursal y sus ejecutivos registrados
 * (GET /integration/profit360/branches/registeredUsers). `null` si la sucursal no existe.
 */
export const useBranchDetail = (branchId: string) => {
  const { ID: projectId } = useAppStore((s) => s.selectedProject);
  const { data, error, isLoading, mutate } = useSWR(
    projectId ? ["/integration/profit360/branches/registeredUsers", projectId, branchId] : null,
    async (): Promise<IBranchDetail | null> => {
      try {
        const res = await getBranchRegisteredUsers(branchId);
        return {
          branch: toBranch(res.data.branch),
          canEdit: res.data.PuedeEditar === true,
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

  /** Asigna usuarios a la sucursal (POST AddUsers) y vuelve a leer la lista real. */
  const addUsers = async (users: IBranchUser[]) => {
    const res = await addBranchUsers(
      branchId,
      users.map((u) => u.id)
    );
    await mutate();
    return res.data;
  };

  /** Desvincula un usuario de la sucursal (PUT RemoveUsers) y vuelve a leer la lista real. */
  const removeUser = async (user: IBranchUser) => {
    const res = await removeBranchUsers(branchId, [user.id]);
    await mutate();
    return res.data;
  };

  return { detail: data, error: error as Error | undefined, isLoading, addUsers, removeUser };
};

/**
 * Usuarios que se pueden asignar a una sucursal (modal "Agregar usuarios"):
 * GET /integration/profit360/branches/AllUsers. Solo nombre y correo.
 */
export const useAssignableUsers = (enabled: boolean) => {
  const { ID: projectId } = useAppStore((s) => s.selectedProject);
  const { data, error, isLoading } = useSWR(
    enabled && projectId ? ["/integration/profit360/branches/AllUsers", projectId] : null,
    async (): Promise<IBranchUser[]> => {
      const res = await getBranchesAllUsers();
      return res.data.map((u) => ({
        id: u.IdUsuario,
        name: u.NombreUsuario || u.CorreoUsuario || "Sin nombre",
        email: u.CorreoUsuario ?? ""
      }));
    },
    SWR_OPTIONS
  );
  return { users: data ?? [], error: error as Error | undefined, isLoading };
};
