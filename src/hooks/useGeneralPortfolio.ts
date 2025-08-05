import useSWR from "swr";

import { fetcher } from "@/utils/api/api";
import { useAppStore } from "@/lib/store/store";

import { IClientPortfolioFilters } from "@/components/atoms/Filters/FilterClientPortfolio/FilterClientPortfolio";

import { GenericResponse } from "@/types/global/IGlobal";
import { IDataSection } from "@/types/portfolios/IPortfolios";

export const useGeneralPortfolio = (filters?: IClientPortfolioFilters) => {
  const { ID } = useAppStore((state) => state.selectedProject);

  const queryParams = [
    filters?.zones.length && filters?.zones.length > 0 && `zones=${filters?.zones.join(",")}`,
    filters?.lines.length && filters?.lines.length > 0 && `lines=${filters?.lines.join(",")}`,
    filters?.sublines.length &&
      filters?.sublines.length > 0 &&
      `sublines=${filters?.sublines.join(",")}`,
    filters?.channels.length &&
      filters?.channels.length > 0 &&
      `channels=${filters?.channels.join(",")}`,
    filters?.radicado && `radicado=${filters?.radicado}`,
    filters?.novedad && `novedad=${filters?.novedad}`
  ]
    .filter(Boolean)
    .join("&");

  const pathKey = `/portfolio/project/all/${ID}/client?${queryParams}`;

  const { data, error, isLoading, mutate } = useSWR<GenericResponse<IDataSection>>(
    pathKey,
    fetcher
  );

  return {
    data: data?.data,
    loading: isLoading,
    error,
    mutate
  };
};
