import useSWR from "swr";

import { useDebounce } from "@/hooks/useDeabouce";
import { useAppStore } from "@/lib/store/store";
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
  // El proyecto va en el header de cada request; en la llave hace que se recargue al cambiarlo.
  const { ID: projectId } = useAppStore((s) => s.selectedProject);
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
    projectId ? ["/integration/profit360/branches", projectId, JSON.stringify(query)] : null,
    async () => {
      const res = await getBranches(query);
      return { ...res, projectId, fetchedAt: new Date().toISOString() };
    },
    SWR_OPTIONS
  );

  // keepPreviousData sirve al paginar o filtrar, pero no entre proyectos: mientras llegan las
  // sucursales del proyecto nuevo, se muestra cargando en vez de las del anterior.
  const current = data?.projectId === projectId ? data : undefined;

  return {
    branches: (current?.data ?? []).map(toBranch),
    total: current?.total ?? 0,
    totalClients: current?.totalClients ?? 0,
    page: current?.page ?? page,
    fetchedAt: current?.fetchedAt,
    error: error as Error | undefined,
    isLoading: isLoading || (!error && !current),
    isValidating
  };
};

/** Opciones del cuadro de filtros (GET /branches/filters), de todo el proyecto. */
export const useBranchesFilters = () => {
  const { ID: projectId } = useAppStore((s) => s.selectedProject);
  const { data, error, isLoading } = useSWR(
    projectId ? ["/integration/profit360/branches/filters", projectId] : null,
    getBranchesFilters,
    { revalidateOnFocus: false }
  );
  return { filters: data?.data, error: error as Error | undefined, isLoading };
};
