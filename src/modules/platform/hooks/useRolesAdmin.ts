import useSWR from "swr";
import { fetcher } from "@/utils/api/api";
import { GenericResponse } from "@/types/global/IGlobal";
import { IAdminRole, ICatalogModule, IRoleDetail } from "@/types/roles/IRolesAdmin";
import { ROLES_ADMIN_KEY, ROLES_CATALOG_KEY, roleDetailKey } from "@/services/roles/rolesAdmin";

const options = { revalidateOnFocus: false };

export const useRolesCatalog = () => {
  const { data, error, isLoading, mutate } = useSWR<GenericResponse<ICatalogModule[]>>(
    ROLES_CATALOG_KEY,
    fetcher,
    options
  );
  return { catalog: data?.data, error, isLoading, mutate };
};

export const useAdminRoles = () => {
  const { data, error, isLoading, mutate } = useSWR<GenericResponse<IAdminRole[]>>(
    ROLES_ADMIN_KEY,
    fetcher,
    options
  );
  return { roles: data?.data, error, isLoading, mutate };
};

export const useRoleDetail = (rolId: number | null) => {
  const { data, error, isLoading, mutate } = useSWR<GenericResponse<IRoleDetail>>(
    rolId ? roleDetailKey(rolId) : null,
    fetcher,
    options
  );
  return { detail: data?.data, error, isLoading, mutate };
};
