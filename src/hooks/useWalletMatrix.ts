import useSWR from "swr";

import { fetcher } from "@/utils/api/api";
import { buildMatrixQuery } from "@/services/walletMatrix/walletMatrix";

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
export const useWalletMatrix = (
  filters?: IWalletMatrixFilters,
  page = 1,
  limit = 50
) => {
  const query = buildMatrixQuery(filters);
  const pathKey = `/portfolio/matrix?page=${page}&limit=${limit}&${query}`;

  const { data, error, isLoading, mutate } = useSWR<GenericResponse<IWalletMatrix>>(
    pathKey,
    fetcher
  );

  return { data: data?.data, loading: isLoading, error, mutate };
};

/**
 * Detalle de una celda.
 *
 * Recibe los MISMOS filtros que la matriz más el cliente, el tramo y el
 * `runId` de la foto que el usuario tiene en pantalla. El `runId` importa:
 * sin él, si el worker regenera la foto entre el render y el clic, el
 * detalle vendría de una foto distinta y no cuadraría con la celda.
 */
export const useWalletMatrixDetail = (
  clientId?: string,
  aging?: AgingBucket,
  runId?: string,
  filters?: IWalletMatrixFilters,
  page = 1,
  limit = 50
) => {
  const query = buildMatrixQuery(filters);
  const pathKey =
    clientId && aging
      ? `/portfolio/matrix/detail?clientId=${encodeURIComponent(clientId)}&aging=${encodeURIComponent(aging)}&runId=${runId ?? ""}&page=${page}&limit=${limit}&${query}`
      : null;

  const { data, error, isLoading, mutate } = useSWR<GenericResponse<IWalletMatrixDetail>>(
    pathKey,
    fetcher
  );

  return { data: data?.data, loading: isLoading, error, mutate };
};

/**
 * Grupos de facturas: lo mismo que hay en la matriz con los filtros
 * actuales, agrupado por novedad/estado. Si hay celda seleccionada, se
 * acota a ella.
 */
export const useWalletMatrixGroups = (
  filters?: IWalletMatrixFilters,
  clientId?: string,
  aging?: AgingBucket,
  runId?: string
) => {
  const query = buildMatrixQuery(filters);
  const scope = [
    clientId && `clientId=${encodeURIComponent(clientId)}`,
    aging && `aging=${encodeURIComponent(aging)}`,
    runId && `runId=${runId}`
  ]
    .filter(Boolean)
    .join("&");

  const pathKey = `/portfolio/matrix/groups?${scope}&${query}`;

  const { data, error, isLoading, mutate } = useSWR<GenericResponse<IWalletMatrixGroups>>(
    pathKey,
    fetcher
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
