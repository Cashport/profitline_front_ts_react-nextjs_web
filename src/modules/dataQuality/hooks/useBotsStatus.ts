import useSWR from "swr";
import { fetcher } from "@/utils/api/api";

import { IBotsStatusResponse } from "../types/automations";

export const getBotsStatusKey = (countryId?: number) =>
  countryId ? `/data/bots/status?id_country=${countryId}` : "/data/bots/status";

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

  return {
    data: data?.data,
    summary: data?.summary,
    isLoading,
    error,
    mutate
  };
};
