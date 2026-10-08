import { useMemo } from "react";
import useSWR, { KeyedMutator } from "swr";

import { fetcher } from "@/utils/api/api";
import { IBotHealth, IBotHealthResponse, IBotHealthSummary } from "@/types/bots/IBotHealth";
import { mapRawStatusToHealthStatus } from "@/components/organisms/BotHealth/botStatusMap";

interface PropsUseBotsHealth {
  page: number;
  pageSize: number;
  searchQuery?: string;
  pais?: string;
  estado?: string;
}

interface UseBotsHealthResult {
  data: IBotHealth[];
  summary: IBotHealthSummary;
  total: number;
  isLoading: boolean;
  error: unknown;
  mutate: KeyedMutator<IBotHealthResponse>;
}

const buildSummary = (bots: IBotHealth[]): IBotHealthSummary =>
  bots.reduce(
    (acc, bot) => {
      acc.total += 1;
      switch (mapRawStatusToHealthStatus(bot.estado)) {
        case "Operativo":
          acc.operativo += 1;
          break;
        case "Con fallas":
          acc.con_fallas += 1;
          break;
        case "Ejecutando":
          acc.ejecutando += 1;
          break;
        case "En revisión":
          acc.en_revision += 1;
          break;
      }
      return acc;
    },
    { total: 0, operativo: 0, con_fallas: 0, ejecutando: 0, en_revision: 0 }
  );

// GET /data/bots/status no soporta paginación ni filtros server-side (devuelve
// el listado completo del proyecto activo); el header `projectid` lo inyecta
// automáticamente el interceptor de `instance` en @/utils/api/api. Paginación,
// búsqueda y resumen de estados se calculan en cliente a partir del array completo.
export const useBotsHealth = ({
  page,
  pageSize,
  searchQuery,
  pais,
  estado
}: PropsUseBotsHealth): UseBotsHealthResult => {
  const { data, error, isLoading, mutate } = useSWR<IBotHealthResponse>(
    "/data/bots/status",
    fetcher
  );

  const allBots = useMemo(() => data?.data || [], [data]);

  const filteredBots = useMemo(() => {
    const normalizedSearch = searchQuery?.toLowerCase().trim();
    return allBots.filter((bot) => {
      const matchesSearch = normalizedSearch
        ? bot.bot.toLowerCase().includes(normalizedSearch) ||
          bot.cliente.toLowerCase().includes(normalizedSearch)
        : true;
      const matchesPais = pais ? bot.pais === pais : true;
      const matchesEstado = estado ? mapRawStatusToHealthStatus(bot.estado) === estado : true;
      return matchesSearch && matchesPais && matchesEstado;
    });
  }, [allBots, searchQuery, pais, estado]);

  const paginatedBots = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredBots.slice(start, start + pageSize);
  }, [filteredBots, page, pageSize]);

  return {
    data: paginatedBots,
    summary: buildSummary(allBots),
    total: filteredBots.length,
    isLoading,
    error,
    mutate
  };
};

