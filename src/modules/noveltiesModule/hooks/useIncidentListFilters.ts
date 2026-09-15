import useSWR from "swr";

import { fetcher } from "@/utils/api/api";
import type { GenericResponse } from "@/types/global/IGlobal";
import type { IIncidentListFilters } from "@/types/novelties/INovelties";

/** Catálogo canonicalizado de GET /invoice/incident-list/filters, en un solo fetch. */
export const useIncidentListFilters = () => {
  const { data, error, isLoading } = useSWR<GenericResponse<IIncidentListFilters>>(
    "/invoice/incident-list/filters",
    fetcher,
    { revalidateOnFocus: false }
  );

  return { filters: data?.data, isLoading, error };
};
