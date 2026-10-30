import useSWR from "swr";

import { useAppStore } from "@/lib/store/store";
import {
  blockingAlertsListPath,
  blockingAlertsSummaryPath,
  type BlockingAlertsListView
} from "@/services/blockingAlerts/blockingAlerts";
import type {
  IBlockingAlertsClient,
  IBlockingAlertsListQuery,
  IBlockingAlertsPage,
  IBlockingAlertsPointOfSale,
  IBlockingAlertsSummary
} from "@/types/blockingAlerts/IBlockingAlerts";
import type { GenericResponse } from "@/types/global/IGlobal";
import { fetcher } from "@/utils/api/api";

import { getBlockingAlertDetailMock } from "../mocked-data";

/** El proyecto va en el header: entra en la llave para no mezclar proyectos en la caché. */
const useBlockingAlertsApi = <T>(path: string) => {
  const projectId = useAppStore((s) => s.selectedProject?.ID);
  const { data, error, isLoading } = useSWR<GenericResponse<T>>(
    projectId ? [path, projectId] : null,
    ([url]: [string]) => fetcher(url),
    { revalidateOnFocus: false, keepPreviousData: true }
  );
  return { data: data?.data, error: error as Error | undefined, isLoading };
};

/** Total cartera y conteos por estado; con `clientUuid`, los de ese cliente. */
export const useBlockingAlertsSummary = (clientUuid?: string) => {
  const { data, ...rest } = useBlockingAlertsApi<IBlockingAlertsSummary>(
    blockingAlertsSummaryPath(clientUuid)
  );
  return { summary: data, ...rest };
};

/** Página de clientes o de puntos de venta, ya filtrada y ordenada por el API. */
export const useBlockingAlertsList = (
  view: BlockingAlertsListView,
  query: IBlockingAlertsListQuery
) => {
  const { data, ...rest } = useBlockingAlertsApi<
    IBlockingAlertsPage<IBlockingAlertsClient | IBlockingAlertsPointOfSale>
  >(blockingAlertsListPath(view, query));
  return { list: data, ...rest };
};

/** Detalle de un cliente o, con `shipToCode`, de uno de sus puntos de venta (simulado). */
export const useBlockingAlertDetail = (clientId: string, shipToCode?: string) => {
  const { data, error, isLoading } = useSWR(
    shipToCode
      ? `/blocking-alerts/${clientId}/points-of-sale/${shipToCode}`
      : `/blocking-alerts/${clientId}`,
    () => getBlockingAlertDetailMock(clientId, shipToCode),
    { revalidateOnFocus: false }
  );
  return { detail: data, error: error as Error | undefined, isLoading };
};
