import useSWR from "swr";
import { fetcher } from "@/utils/api/api";
import {
  IClientDataList,
  GenericResponseWithFilters,
  ICountryClientsFilters
} from "@/types/dataQuality/IDataQuality";

export interface IFilters {
  status?: string;
  periodicity?: string;
  id_type_archive?: number;
  id_intake_type?: number;
  search?: string;
}

export const useCountriesClients = (
  countryId: string,
  projectId: number,
  page: number = 1,
  limit: number = 10,
  filters: IFilters = {}
) => {
  const queryParams: string[] = [];

  if (filters.status) queryParams.push(`status=${filters.status}`);
  if (filters.periodicity) queryParams.push(`periodicity=${filters.periodicity}`);
  if (filters.id_type_archive) queryParams.push(`id_type_archive=${filters.id_type_archive}`);
  if (filters.id_intake_type) queryParams.push(`id_intake_type=${filters.id_intake_type}`);
  if (filters.search) queryParams.push(`search=${encodeURIComponent(filters.search)}`);

  const pathKey = `/data/sumary/${countryId}/${projectId}?limit=${limit}&page=${page}${queryParams.length ? `&${queryParams.join("&")}` : ""}`;

  const { data, error, isLoading, mutate } = useSWR<
    GenericResponseWithFilters<IClientDataList, ICountryClientsFilters>
  >(projectId ? pathKey : null, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000
  });

  return {
    data: data?.data,
    filters: data?.filters,
    isLoading,
    error,
    mutate
  };
};
