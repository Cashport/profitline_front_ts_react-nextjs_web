import useSWR from "swr";

import { fetcher } from "@/utils/api/api";
import { useAppStore } from "@/lib/store/store";
import { useDebounce } from "@/hooks/useDeabouce";
import { buildTowerQuery, towerPath } from "@/services/collectionTower/collectionTower";
import { USE_TOWER_MOCK } from "@/modules/recaudoModule/constants";

import { GenericResponse } from "@/types/global/IGlobal";
import { ICollectionTower, ICollectionTowerQuery } from "@/types/collectionTower/ICollectionTower";

const SEARCH_DEBOUNCE_MS = 300;

/** Datos de ejemplo con la forma del API. Se cargan aparte: con el API conectado no pesan. */
const fetchMock = async (query: ICollectionTowerQuery): Promise<GenericResponse<ICollectionTower>> => {
  const { buildTowerMock } = await import("@/modules/recaudoModule/utils/tower-mock");
  return { status: 200, message: "mock", data: buildTowerMock(query) };
};

/**
 * Torre de control de recaudo: todo el tablero en una respuesta.
 *
 * Los filtros van en la llave de SWR, así cada combinación se cachea aparte.
 * `keepPreviousData` deja el tablero anterior mientras llega el nuevo: el
 * skeleton queda sólo para la primera carga. La búsqueda va con debounce para
 * no pedir una torre por tecla.
 */
export const useCollectionTower = (filters: ICollectionTowerQuery) => {
  const projectId = useAppStore((s) => s.selectedProject?.ID);
  const search = useDebounce(filters.search, SEARCH_DEBOUNCE_MS);
  const query: ICollectionTowerQuery = { ...filters, search };
  const pathKey = projectId ? `${towerPath(projectId)}?${buildTowerQuery(query)}` : null;

  const { data, error, isLoading, isValidating } = useSWR<GenericResponse<ICollectionTower>>(
    pathKey,
    USE_TOWER_MOCK ? () => fetchMock(query) : fetcher,
    { keepPreviousData: true, revalidateOnFocus: false }
  );

  return {
    data: data?.data,
    loading: isLoading,
    /** Pidiendo con filtros nuevos mientras se muestra el tablero anterior. */
    validating: isValidating,
    error: error as Error | undefined
  };
};
