import useSWR from "swr";

import { fetcher } from "@/utils/api/api";
import { buildMatrixQuery } from "@/services/walletMatrix/walletMatrix";

import { GenericResponse } from "@/types/global/IGlobal";
import {
  AGING_BUCKETS,
  AgingBucket,
  IWalletMatrix,
  IWalletMatrixDetail,
  IWalletMatrixDetailRow,
  IWalletMatrixFilters,
  IWalletMatrixGroup,
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

/** Tamaño de página del detalle. El backend pagina; un grupo grande no cabe. */
const DETAIL_PAGE_SIZE = 200;

/** Todas las filas del detalle de un cliente en un tramo, paginando hasta el final. */
const fetchBucket = async (
  clientId: string,
  aging: AgingBucket,
  runId: string | undefined,
  query: string
): Promise<IWalletMatrixDetailRow[]> => {
  const url = (page: number) =>
    `/portfolio/matrix/detail?clientId=${encodeURIComponent(clientId)}&aging=${encodeURIComponent(aging)}&runId=${runId ?? ""}&page=${page}&limit=${DETAIL_PAGE_SIZE}&${query}`;

  const first: GenericResponse<IWalletMatrixDetail> = await fetcher(url(1));
  const rows = first.data?.rows ?? [];
  const total = first.data?.pagination?.total ?? rows.length;

  const restantes = Math.ceil(total / DETAIL_PAGE_SIZE) - 1;
  if (restantes <= 0) return rows;

  const resto: GenericResponse<IWalletMatrixDetail>[] = await Promise.all(
    Array.from({ length: restantes }, (_, i) => fetcher(url(i + 2)))
  );
  return rows.concat(...resto.map((r) => r.data?.rows ?? []));
};

/**
 * Facturas de un grupo de la tabla inferior.
 *
 * El detalle se pide por tramo y un grupo puede repartirse en varios, así que
 * se consultan sólo los tramos con monto y se concatenan. Se añade el estado
 * del grupo a los filtros para que el acotado lo haga el servidor; lo que no
 * se puede filtrar allá —la novedad concreta— se descarta aquí.
 */
export const useWalletGroupInvoices = (
  group: IWalletMatrixGroup | null,
  filters?: IWalletMatrixFilters,
  runId?: string
) => {
  const buckets = group
    ? AGING_BUCKETS.filter((_, i) => (group.byAging?.[i] ?? 0) > 0)
    : [];

  const query = buildMatrixQuery(
    group ? { ...filters, status: [group.statusKey] } : filters
  );

  // Con el modal cerrado no se pide nada.
  const key =
    group && buckets.length
      ? ["wallet-group-invoices", group.clientId, group.statusKey, group.noveltyId, runId, query]
      : null;

  const { data, error, isLoading } = useSWR(key, async () => {
    const porTramo = await Promise.all(
      buckets.map((aging) => fetchBucket(group!.clientId, aging, runId, query))
    );

    return porTramo
      .flat()
      .filter((row) => group!.noveltyId === null || row.noveltyId === group!.noveltyId);
  });

  return { rows: data ?? [], loading: isLoading, error };
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
