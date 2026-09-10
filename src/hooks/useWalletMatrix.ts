import useSWR from "swr";

import { fetcher } from "@/utils/api/api";
import { buildMatrixQuery } from "@/services/walletMatrix/walletMatrix";

import { GenericResponse } from "@/types/global/IGlobal";
import {
  AgingBucket,
  IWalletMatrix,
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
export const useWalletMatrix = (
  filters?: IWalletMatrixFilters,
  page = 1,
  limit = 50
) => {
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
 */
export const useWalletMatrixGroups = (
  runId?: string,
  clientId?: string,
  aging?: AgingBucket,
  calculateEndMonth = false
) => {
  // El endpoint sólo acepta estos cuatro parámetros. Mandarle los filtros de la
  // matriz no acota nada y ensucia la cache key: cada tecla del buscador pedía
  // de nuevo exactamente la misma respuesta.
  const params = new URLSearchParams();
  if (runId) params.set("runId", runId);
  if (clientId) params.set("clientId", clientId);
  if (aging) params.set("aging", aging);
  params.set("calculateEndMonth", calculateEndMonth ? "1" : "0");

  // Sin runId no se pide. El backend caería en "la última foto generada", que
  // no tiene por qué ser la que está pintada arriba: si el worker generó otra
  // entremedio, los grupos no cuadrarían con la matriz. Esperar a que la matriz
  // diga cuál es evita además la petición doble de cada montaje.
  const pathKey = runId ? `/portfolio/matrix/groups?${params}` : null;

  const { data, error, isLoading, mutate } = useSWR<GenericResponse<IWalletMatrixGroups>>(
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
