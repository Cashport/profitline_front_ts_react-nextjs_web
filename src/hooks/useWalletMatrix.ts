import useSWR from "swr";

import { fetcher } from "@/utils/api/api";
import { buildMatrixGroupsQuery, buildMatrixQuery } from "@/services/walletMatrix/walletMatrix";

import { GenericResponse } from "@/types/global/IGlobal";
import {
  AgingBucket,
  IWalletMatrix,
  IWalletMatrixDetail,
  IWalletMatrixFilters,
  IWalletMatrixGroups,
  IWalletMatrixStatus
} from "@/types/portfolios/IWalletMatrix";

/**
 * Matriz de Control: clientes × tramos de edad.
 *
 * Los filtros van dentro de la cache key de SWR (mismo patrón que
 * `useGeneralPortfolio`), así cada combinación se cachea por separado.
 */
export const useWalletMatrix = (filters?: IWalletMatrixFilters, page = 1, limit = 50) => {
  const query = buildMatrixQuery(filters);
  const pathKey = `/portfolio/matrix?page=${page}&limit=${limit}&${query}`;

  // `keepPreviousData` evita que la tabla desaparezca al cambiar un filtro o
  // al escribir en el buscador: se mantiene la matriz anterior mientras llega
  // la nueva. El skeleton queda entonces sólo para la primera carga, que es
  // cuando de verdad no hay nada que mostrar.
  const { data, error, isLoading, mutate } = useSWR<GenericResponse<IWalletMatrix>>(
    pathKey,
    fetcher,
    { keepPreviousData: true }
  );

  return { data: data?.data, loading: isLoading, error, mutate };
};

/**
 * Grupos de facturas de una foto, agrupados por novedad/estado.
 *
 * Con `clientId` trae todos los grupos de ese cliente sin importar el tramo;
 * sumándole `aging` se queda con los que tienen facturas en ese rango, y OJO:
 * el total de cada grupo llega acotado a lo que cae en el tramo pedido, no es
 * el total del grupo.
 *
 * Recibe los mismos `filters` que la matriz: el serializador se queda sólo con
 * los que este endpoint acepta, así que ordenar o paginar la matriz no vuelve a
 * pedir los grupos.
 */
export const useWalletMatrixGroups = (
  runId?: string,
  clientId?: string,
  aging?: AgingBucket,
  filters?: IWalletMatrixFilters
) => {
  const query = buildMatrixGroupsQuery(
    { runId, clientId, aging, calculateEndMonth: filters?.calculateEndMonth },
    filters
  );

  // Sin runId no se pide. El backend caería en "la última foto generada", que
  // no tiene por qué ser la que está pintada arriba: si el worker generó otra
  // entremedio, los grupos no cuadrarían con la matriz. Esperar a que la matriz
  // diga cuál es evita además la petición doble de cada montaje.
  const pathKey = runId ? `/portfolio/matrix/groups?${query}` : null;

  const { data, error, isLoading, mutate } = useSWR<GenericResponse<IWalletMatrixGroups>>(
    pathKey,
    fetcher,
    { keepPreviousData: true }
  );

  return { data: data?.data, loading: isLoading, error, mutate };
};

export interface IWalletMatrixDetailParams {
  runId: string;
  clientId: string;
  /** statusKey crudo del grupo (CONCILIADO, SIN_CONCILIAR, …). */
  status: string;
  /** null → se manda la cadena "null": documentos sin novedad asociada. */
  noveltyId: number | null;
}

/**
 * Documentos exactos de un grupo de la matriz (cliente × estado × novedad),
 * paginados, sobre la misma foto que está pintada. Sin `params` no pide nada:
 * los grupos con novedad leen sus documentos de /invoice/incident-detail.
 */
export const useWalletMatrixDetail = (
  params: IWalletMatrixDetailParams | null,
  page = 1,
  limit = 25
) => {
  let pathKey: string | null = null;
  if (params) {
    const query = new URLSearchParams({
      runId: params.runId,
      clientId: params.clientId,
      status: params.status,
      noveltyId: params.noveltyId === null ? "null" : String(params.noveltyId),
      page: String(page),
      limit: String(limit)
    });
    pathKey = `/portfolio/matrix/detail?${query}`;
  }

  // `keepPreviousData`: al paginar se conserva la página anterior en pantalla
  // hasta que llega la nueva, en vez de vaciar la tabla.
  const { data, error, isLoading, mutate } = useSWR<GenericResponse<IWalletMatrixDetail>>(
    pathKey,
    fetcher,
    { keepPreviousData: true }
  );

  return { data: data?.data, loading: isLoading, error, mutate };
};

/**
 * Estado de la última actualización.
 *
 * Hace polling solo mientras hay una corrida en curso. Es el respaldo del
 * socket: si el evento no llega (por ejemplo, porque el usuario está
 * conectado a otra réplica del backend), la pantalla igual se entera de
 * que la actualización terminó.
 */
export const useWalletMatrixStatus = (enablePolling = false) => {
  const { data, error, isLoading, mutate } = useSWR<GenericResponse<IWalletMatrixStatus>>(
    `/portfolio/matrix/status`,
    fetcher,
    { refreshInterval: enablePolling ? 5000 : 0 }
  );

  return { data: data?.data, loading: isLoading, error, mutate };
};
