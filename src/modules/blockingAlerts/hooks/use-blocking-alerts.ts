import useSWR from "swr";

import { getBlockingAlertDetailMock, getBlockingAlertsMock } from "../mocked-data";

/* Datos simulados mientras no existe el API: al conectarlo, la llave sigue siendo
   la URL y el fetcher pasa a ser `fetcher` de @/utils/api/api. */
const SWR_OPTIONS = { revalidateOnFocus: false };

/** Clientes y puntos de venta con su estado de bloqueo, y los totales de cada vista. */
export const useBlockingAlerts = () => {
  const { data, error, isLoading } = useSWR("/blocking-alerts", getBlockingAlertsMock, SWR_OPTIONS);
  return { alerts: data, error: error as Error | undefined, isLoading };
};

/** Detalle de un cliente o, con `shipToCode`, de uno de sus puntos de venta. */
export const useBlockingAlertDetail = (clientId: string, shipToCode?: string) => {
  const { data, error, isLoading } = useSWR(
    shipToCode
      ? `/blocking-alerts/${clientId}/points-of-sale/${shipToCode}`
      : `/blocking-alerts/${clientId}`,
    () => getBlockingAlertDetailMock(clientId, shipToCode),
    SWR_OPTIONS
  );
  return { detail: data, error: error as Error | undefined, isLoading };
};
