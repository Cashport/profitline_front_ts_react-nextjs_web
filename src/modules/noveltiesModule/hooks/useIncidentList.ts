import useSWR from "swr";

import { fetcher } from "@/utils/api/api";
import type { GenericResponsePage } from "@/types/global/IGlobal";
import type {
  IIncidentListData,
  IncidentCard,
  IncidentSortBy,
  IncidentSortDir
} from "@/types/novelties/INovelties";

interface UseIncidentListParams {
  page?: number;
  limit?: number;
  sortBy?: IncidentSortBy;
  sortDir?: IncidentSortDir;
  card?: IncidentCard | null;
  noveltyStatusId?: number | null;
  motiveId?: number | null;
  assignedTo?: number | null;
  coordinator?: string | null;
  search?: string;
  dateFrom?: string | null;
  dateTo?: string | null;
}

export const useIncidentList = ({
  page = 1,
  limit = 20,
  sortBy = "created_at",
  sortDir = "desc",
  card = null,
  noveltyStatusId = null,
  motiveId = null,
  assignedTo = null,
  coordinator = null,
  search = "",
  dateFrom = null,
  dateTo = null
}: UseIncidentListParams = {}) => {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));
  params.set("sort_by", sortBy);
  params.set("sort_dir", sortDir);

  if (card) params.set("card", card);
  if (noveltyStatusId) params.set("novelty_status_id", String(noveltyStatusId));
  if (motiveId) params.set("motive_id", String(motiveId));
  if (assignedTo) params.set("assigned_to", String(assignedTo));
  if (coordinator) params.set("coordinator", coordinator);
  const term = search.trim();
  if (term) params.set("search", term);
  if (dateFrom) params.set("date_from", dateFrom);
  if (dateTo) params.set("date_to", dateTo);

  // Los filtros van dentro de la cache key: cada combinación se cachea aparte.
  const { data, error, isLoading, mutate } = useSWR<GenericResponsePage<IIncidentListData>>(
    `/invoice/incident-list?${params.toString()}`,
    fetcher,
    { keepPreviousData: true }
  );

  return {
    items: data?.data?.items,
    summary: data?.data?.summary,
    pagination: data?.pagination ?? {
      actualPage: page,
      rowsperpage: limit,
      totalPages: 0,
      totalRows: 0
    },
    isLoading,
    error,
    mutate
  };
};
