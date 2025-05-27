import useSWR, { mutate } from "swr";
import { fetcher } from "@/utils/api/api";
import { StatusFinancialDiscounts } from "@/types/financialDiscounts/IFinancialDiscounts";
import { GenericResponse } from "@/types/global/IGlobal";

interface Props {
  clientId: string;
  projectId: number;
  id?: number;
  line?: number[];
  subline?: number[];
  channel?: number[];
  zone?: number[];
  searchQuery?: string;
  page?: number;
}

export const useFinancialDiscounts = ({
  clientId,
  projectId,
  id,
  line,
  subline,
  channel,
  zone,
  searchQuery,
  page = 1
}: Props) => {
  const idQuery = id ? `&id=${id}` : "";
  const lineQuery = line && line.length > 0 ? `&line=${line.join(",")}` : "";
  const sublineQuery = subline && subline.length > 0 ? `&subline=${subline.join(",")}` : "";
  const channelQuery = channel && channel.length > 0 ? `&channel=${channel.join(",")}` : "";
  const zoneQuery = zone && zone.length > 0 ? `&zone=${zone.join(",")}` : "";
  const searchQueryParam = searchQuery
    ? `&searchQuery=${encodeURIComponent(searchQuery.toLowerCase().trim())}`
    : "";

  const pathKey = `/financial-discount/project/${projectId}/client/${clientId}?page=${page}${idQuery}${lineQuery}${sublineQuery}${channelQuery}${zoneQuery}${searchQueryParam}`;

  const { data, error } = useSWR<GenericResponse<StatusFinancialDiscounts[]>>(pathKey, fetcher, {});

  return {
    data: data?.data || [],
    isLoading: !error && !data,
    mutate
  };
};
