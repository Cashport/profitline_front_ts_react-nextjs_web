import { useEffect, useMemo } from "react";
import useSWR, { useSWRConfig } from "swr";

import { fetcher } from "@/utils/api/api";
import { useAppStore } from "@/lib/store/store";
import { useDebounce } from "@/hooks/useDeabouce";
import {
  buildTowerQuery,
  towerCatalogsPath,
  towerPath
} from "@/services/collectionTower/collectionTower";
import { USE_TOWER_MOCK } from "@/modules/recaudoModule/constants";

import { GenericResponse } from "@/types/global/IGlobal";
import {
  ICollectionTower,
  ICollectionTowerQuery,
  ITowerBoard,
  ITowerCatalogsResponse
} from "@/types/collectionTower/ICollectionTower";

const SEARCH_DEBOUNCE_MS = 300;
/** Mientras el backend genera la foto de recaudo (202) se reintenta cada pocos segundos. */
const PENDING_POLL_MS = 5000;

/** La foto todavía no existe: el backend la está generando. */
interface ITowerPending {
  snapshotPending: true;
}

type BoardResponse = GenericResponse<ITowerBoard | ITowerPending>;
type CatalogsResponse = GenericResponse<ITowerCatalogsResponse | ITowerPending>;

const isPending = (data?: unknown): data is ITowerPending =>
  Boolean(data && typeof data === "object" && "snapshotPending" in data);

const pendingPoll = (latest?: GenericResponse<unknown>) =>
  isPending(latest?.data) ? PENDING_POLL_MS : 0;

const boardOf = (response?: BoardResponse) =>
  response && !isPending(response.data) ? (response.data as ITowerBoard) : undefined;

const catalogsOf = (response?: CatalogsResponse) =>
  response && !isPending(response.data) ? (response.data as ITowerCatalogsResponse) : undefined;

/** El tablero con sus catálogos, como lo leen los componentes. */
const withCatalogs = (
  board?: ITowerBoard,
  catalogs?: ITowerCatalogsResponse
): ICollectionTower | undefined =>
  board && catalogs ? { ...board, catalogs: catalogs.catalogs } : undefined;

/** Datos de ejemplo con la forma del API. Se cargan aparte: con el API conectado no pesan. */
const fetchMock = async (query: ICollectionTowerQuery): Promise<GenericResponse<ITowerBoard>> => {
  const { buildTowerMock } = await import("@/modules/recaudoModule/utils/tower-mock");
  return { status: 200, message: "mock", data: { ...buildTowerMock(query), runId: "mock" } };
};

const fetchMockCatalogs = async (
  query: ICollectionTowerQuery
): Promise<GenericResponse<ITowerCatalogsResponse>> => {
  const { buildTowerMock } = await import("@/modules/recaudoModule/utils/tower-mock");
  return {
    status: 200,
    message: "mock",
    data: { runId: "mock", catalogs: buildTowerMock(query).catalogs }
  };
};

/**
 * Torre de control de recaudo, leída de la foto que el backend genera cada
 * 30 minutos. La primera vez (sin foto) el API responde 202 y se reintenta
 * hasta que la foto esté lista.
 *
 * Dos pedidos en paralelo: el tablero de los filtros (llave por filtros, así
 * cada combinación se cachea aparte) y los catálogos, una vez por foto: en un
 * proyecto grande son casi todo el peso y no cambian con los filtros. Si el
 * tablero llega de una foto nueva (`runId`), los catálogos se piden otra vez.
 *
 * Hay dos tableros: `data`, el de los filtros actuales (undefined mientras
 * llega: el tablero muestra el skeleton), y `lastData`, el último recibido,
 * para que el encabezado (catálogos, periodos) no se apague entre filtros.
 * La búsqueda va con debounce para no pedir una torre por tecla.
 */
export const useCollectionTower = (filters: ICollectionTowerQuery) => {
  const projectId = useAppStore((s) => s.selectedProject?.ID);
  const search = useDebounce(filters.search, SEARCH_DEBOUNCE_MS);
  const query: ICollectionTowerQuery = { ...filters, search };
  const pathKey = projectId ? `${towerPath(projectId)}?${buildTowerQuery(query)}` : null;
  const { cache } = useSWRConfig();

  const {
    data: laggy,
    error: boardError,
    isValidating
  } = useSWR<BoardResponse>(pathKey, USE_TOWER_MOCK ? () => fetchMock(query) : fetcher, {
    keepPreviousData: true,
    revalidateOnFocus: false,
    refreshInterval: pendingPoll
  });
  const {
    data: catalogsResponse,
    error: catalogsError,
    mutate: refreshCatalogs
  } = useSWR<CatalogsResponse>(
    projectId ? towerCatalogsPath(projectId) : null,
    USE_TOWER_MOCK ? () => fetchMockCatalogs(query) : fetcher,
    { revalidateOnFocus: false, refreshInterval: pendingPoll }
  );

  // Con keepPreviousData, `laggy` puede ser la respuesta de los filtros
  // anteriores. La de estos filtros es la que está en la caché para la llave:
  // se lee ahí, y no de isLoading, porque en el primer render tras cambiar de
  // llave SWR todavía no marca la carga y el tablero viejo se pintaba completo.
  const current = pathKey ? (cache.get(pathKey)?.data as BoardResponse | undefined) : undefined;
  const board = boardOf(current);
  const lastBoard = board ?? boardOf(laggy);
  const catalogs = catalogsOf(catalogsResponse);

  // Foto nueva: los catálogos que hay son de la anterior.
  const boardRun = board?.runId;
  const catalogsRun = catalogs?.runId;
  useEffect(() => {
    if (boardRun && catalogsRun && boardRun !== catalogsRun) refreshCatalogs();
  }, [boardRun, catalogsRun, refreshCatalogs]);

  const data = useMemo(() => withCatalogs(board, catalogs), [board, catalogs]);
  const lastData = useMemo(() => withCatalogs(lastBoard, catalogs), [lastBoard, catalogs]);
  const error = (boardError ?? catalogsError) as Error | undefined;

  return {
    /** Sin proyecto elegido no se pide nada: el tablero muestra un aviso en vez de cargar. */
    noProject: !projectId,
    /** El backend está generando la foto: se muestra el skeleton y se reintenta. */
    pending: isPending(current?.data) || isPending(catalogsResponse?.data),
    /** Tablero de los filtros actuales. */
    data,
    /** Último tablero recibido (de estos filtros o de los anteriores). */
    lastData,
    /** Sin tablero para estos filtros todavía: skeleton. */
    loading: Boolean(pathKey) && !data && !error,
    /** Revalidando en segundo plano un tablero que ya está en pantalla. */
    refreshing: isValidating && Boolean(data),
    error
  };
};
