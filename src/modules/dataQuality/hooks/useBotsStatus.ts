import useSWR from "swr";
import { fetcher } from "@/utils/api/api";

import { IBotsStatusResponse } from "../types/automations";

export const getBotsStatusKey = (countryId?: number) =>
  countryId ? `/data/bots/status?id_country=${countryId}` : "/data/bots/status";

// Un backend sin soporte de `id_country` ignora el filtro y devuelve todos los países
// sin `summary`: esa respuesta no se muestra como si fuera la del país elegido.
export const isCountryResponseSupported = (
  response: IBotsStatusResponse | undefined,
  countryId?: number
) =>
  !countryId ||
  !response ||
  (Boolean(response.summary) && response.data.every((bot) => bot.id_country === countryId));

// Cada país es una key distinta de SWR: una respuesta tardía de otro país queda en
// su propia key y nunca reemplaza la data/summary del país seleccionado.
export const useBotsStatus = (countryId?: number) => {
  const { data, error, isLoading, mutate } = useSWR<IBotsStatusResponse>(
    getBotsStatusKey(countryId),
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000
    }
  );

  const isCountryFilterUnsupported = !isCountryResponseSupported(data, countryId);

  return {
    data: isCountryFilterUnsupported ? undefined : data?.data,
    summary: isCountryFilterUnsupported ? undefined : data?.summary,
    isLoading,
    error,
    isCountryFilterUnsupported,
    mutate
  };
};
