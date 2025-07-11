import useSWR from "swr";
import { useAppStore } from "@/lib/store/store";
import { fetcher } from "@/utils/api/api";
import { StatusFinancialDiscounts } from "@/types/financialDiscounts/IFinancialDiscounts";
import { GenericResponse } from "@/types/global/IGlobal";

interface Props {
  clientId: string;
  id?: number;
  line?: number[];
  subline?: number[];
  channel?: number[];
  zone?: number[];
  searchQuery?: string;
  page?: number;
  motive_id?: number;
}

export const useFinancialDiscounts = ({
  clientId,
  id,
  line,
  subline,
  channel,
  zone,
  searchQuery,
  motive_id,
  page = 1
}: Props) => {
  const { ID: projectId } = useAppStore((state) => state.selectedProject);

  const idQuery = id ? `&id=${id}` : "";
  const lineQuery = line && line.length > 0 ? `&line=${line.join(",")}` : "";
  const sublineQuery = subline && subline.length > 0 ? `&subline=${subline.join(",")}` : "";
  const channelQuery = channel && channel.length > 0 ? `&channel=${channel.join(",")}` : "";
  const zoneQuery = zone && zone.length > 0 ? `&zone=${zone.join(",")}` : "";
  const motiveQuery = motive_id ? `&motive_id=${motive_id}` : "";
  const searchQueryParam = searchQuery
    ? `&searchQuery=${encodeURIComponent(searchQuery.toLowerCase().trim())}`
    : "";

  const pathKey = `/financial-discount/project/${projectId}/client/${clientId}?page=${page}${idQuery}${lineQuery}${sublineQuery}${channelQuery}${zoneQuery}${searchQueryParam}${motiveQuery}`;

  const { data, error, mutate } = useSWR<GenericResponse<StatusFinancialDiscounts[]>>(
    pathKey,
    fetcher
  );

  return {
    data: data?.data || [],
    isLoading: !error && !data,
    mutate
  };
};
