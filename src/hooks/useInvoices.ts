import useSWR from "swr";
import { fetcher } from "@/utils/api/api";
import { IInvoices } from "@/types/invoices/IInvoices";
import { useParams } from "next/navigation";
import { extractSingleParam } from "@/utils/utils";

interface Params {
  page?: number;
  limit?: number;
  paymentAgreement?: number;
  radicationType?: number;
  lines?: number[];
  sublines?: number[];
  zones?: number[];
  channels?: number[];
  searchQuery?: string;
  statusId?: string | number;
}

export const useInvoices = ({
  paymentAgreement,
  radicationType,
  lines,
  zones,
  sublines,
  channels,
  searchQuery,
  page = 1,
  limit = 50
}: Params) => {
  const params = useParams();
  const clientIdParam = extractSingleParam(params.clientId);
  const projectIdParam = extractSingleParam(params.projectId);
  const clientId = clientIdParam || "";
  const projectId = projectIdParam ? parseInt(projectIdParam) : 0;

  const pageQuery = `page=${page}`;
  const limitQuery = `&limit=${limit}`;
  const paymentAgreementQuery =
    paymentAgreement !== undefined && paymentAgreement !== null
      ? `&payment_agrement=${paymentAgreement}`
      : "";
  const radicationTypeQuery =
    radicationType !== undefined && radicationType !== null
      ? `&radication_type=${radicationType}`
      : "";
  const linesQuery = lines && lines.length > 0 ? `&line=${lines.join(",")}` : "";
  const sublinesQuery = sublines && sublines.length > 0 ? `&subline=${sublines.join(",")}` : "";
  const zonesQuery = zones && zones.length > 0 ? `&zone=${zones.join(",")}` : "";
  const channelsQuery = channels && channels.length > 0 ? `&channel=${channels.join(",")}` : "";
  const searchQueryParam = searchQuery ? `&id=${searchQuery.toLowerCase().trim()}` : "";

  const pathKey = `/invoice/client/${clientId}/project/${projectId}?${pageQuery}${limitQuery}${paymentAgreementQuery}${radicationTypeQuery}${linesQuery}${zonesQuery}${channelsQuery}${searchQueryParam}${sublinesQuery}`;

  const { data, error, mutate } = useSWR<IInvoices>(pathKey, fetcher);

  return {
    data: data?.data,
    isLoading: !error && !data,
    error,
    mutate
  };
};
