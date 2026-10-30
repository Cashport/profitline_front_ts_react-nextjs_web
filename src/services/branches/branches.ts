import type {
  IBranchesApiResponse,
  IBranchesFilters,
  IBranchesQuery,
  IBranchRegisteredUsersApi
} from "@/types/branches/IBranches";
import { GenericResponse } from "@/types/global/IGlobal";
import { API } from "@/utils/api/api";

// GET /integration/profit360/branches — paginado; buscar, filtrar y ordenar lo hace pharma 360.
export const getBranches = async (query: IBranchesQuery): Promise<IBranchesApiResponse> => {
  const qs = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== "") qs.append(key, String(value));
  });
  try {
    const response: IBranchesApiResponse = await API.get(
      `/integration/profit360/branches?${qs.toString()}`
    );
    return response;
  } catch (error) {
    console.error("Error fetching branches:", error);
    throw error;
  }
};

// GET /integration/profit360/branches/filters — solo llena el cuadro de filtros.
export const getBranchesFilters = async (): Promise<GenericResponse<IBranchesFilters>> => {
  try {
    const response: GenericResponse<IBranchesFilters> = await API.get(
      "/integration/profit360/branches/filters"
    );
    return response;
  } catch (error) {
    console.error("Error fetching branches filters:", error);
    throw error;
  }
};

// GET /integration/profit360/branches/registeredUsers — la sucursal y sus ejecutivos registrados.
export const getBranchRegisteredUsers = async (
  id: string
): Promise<GenericResponse<IBranchRegisteredUsersApi>> => {
  try {
    const response: GenericResponse<IBranchRegisteredUsersApi> = await API.get(
      `/integration/profit360/branches/registeredUsers?id=${encodeURIComponent(id)}`
    );
    return response;
  } catch (error) {
    console.error("Error fetching branch registered users:", error);
    throw error;
  }
};
