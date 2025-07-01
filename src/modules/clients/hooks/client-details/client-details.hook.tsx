import { useParams } from "next/navigation";
import useSWR from "swr";

import { GenericResponse } from "@/types/global/IGlobal";
import { fetcher } from "@/utils/api/api";
import { extractSingleParam } from "@/utils/utils";

import { IDataSection } from "@/types/portfolios/IPortfolios";
import { IClientPortfolioFilters } from "@/components/atoms/Filters/FilterClientPortfolio/FilterClientPortfolio";

export const useClientDetails = (filters: IClientPortfolioFilters) => {
  const params = useParams();
  const clientIdParam = extractSingleParam(params.clientId);
  const projectIdParam = extractSingleParam(params.projectId);
  const clientId = clientIdParam;
  const projectId = projectIdParam ? parseInt(projectIdParam) : undefined;

  const queryParams = [
    filters.zones.length > 0 && `zones=${filters.zones.join(",")}`,
    filters.lines.length > 0 && `lines=${filters.lines.join(",")}`,
    filters.sublines.length > 0 && `sublines=${filters.sublines.join(",")}`,
    filters.channels.length > 0 && `channels=${filters.channels.join(",")}`,
    filters.radicado && `radicado=${filters.radicado}`,
    filters.novedad && `novedad=${filters.novedad}`
  ]
    .filter(Boolean)
    .join("&");

  const pathKey = `/portfolio/project/${projectId}/client/${clientId}?${queryParams}`;

  const {
    data: portfolioData,
    error,
    isLoading,
    mutate
  } = useSWR<GenericResponse<IDataSection>>(pathKey, fetcher);

  const errorMessage = error instanceof Error ? error.message : null;

  return { data: portfolioData?.data, error: errorMessage, mutate };
};
