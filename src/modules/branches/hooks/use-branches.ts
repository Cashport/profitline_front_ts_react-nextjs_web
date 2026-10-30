import useSWR from "swr";

import { useDebounce } from "@/hooks/useDeabouce";
import { getBranches, getBranchesFilters } from "@/services/branches/branches";
import type { IBranchesQuery } from "@/types/branches/IBranches";

import { PAGE_SIZE } from "../constants";
import { useBranchesStore } from "../stores/branches-store";
import { toBranch, toFilterParams } from "../utils/branches";

const SWR_OPTIONS = { revalidateOnFocus: false, keepPreviousData: true };

/**
 * La página de sucursales que se ve en la tabla. Buscar, filtrar, ordenar y paginar lo
 * hace pharma 360 (GET /branches): con miles de sucursales no se traen todas al navegador.
 */
export const useBranchesPage = () => {
  const search = useBranchesStore((s) => s.search);
  const filters = useBranchesStore((s) => s.filters);
  const sort = useBranchesStore((s) => s.sort);
  const page = useBranchesStore((s) => s.page);
  // Espera a que el usuario deje de escribir para no consultar en cada tecla.
  const debouncedSearch = useDebounce(search.trim(), 400);

  const query: IBranchesQuery = {
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch,
    ...toFilterParams(filters),
    sortField: sort.key,
    sortOrder: sort.dir === 1 ? "ASC" : "DESC"
  };

  const { data, error, isLoading, isValidating } = useSWR(
    ["/integration/profit360/branches", JSON.stringify(query)],
    async () => {
      const res = await getBranches(query);
      return { ...res, fetchedAt: new Date().toISOString() };
    },
    SWR_OPTIONS
  );

  return {
    branches: (data?.data ?? []).map(toBranch),
    total: data?.total ?? 0,
    totalClients: data?.totalClients ?? 0,
    page: data?.page ?? page,
    fetchedAt: data?.fetchedAt,
    error: error as Error | undefined,
    isLoading,
    isValidating
  };
};

/** Opciones del cuadro de filtros (GET /branches/filters), de todo el proyecto. */
export const useBranchesFilters = () => {
  const { data, error, isLoading } = useSWR(
    "/integration/profit360/branches/filters",
    getBranchesFilters,
    { revalidateOnFocus: false }
  );
  return { filters: data?.data, error: error as Error | undefined, isLoading };
};
