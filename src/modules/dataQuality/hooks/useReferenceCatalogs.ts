import useSWR from "swr";
import { fetcher } from "@/utils/api/api";
import { GenericResponse } from "@/types/global/IGlobal";
import {
  IReferenceClient,
  IReferenceCountry,
  IReferenceRegion
} from "@/services/dataQuality/references";

const SWR_OPTIONS = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  dedupingInterval: 300000
} as const;

/**
 * Catalogos de solo lectura para resolver nombres y poblar selectores:
 *   - countries: `/location/countries` (profit_2.country.ID -> country_name)
 *   - regions:   `/data/regions` (data.region.id -> abbreviation)
 *   - clients:   `/data/clients` (data.client_data.id -> client_name)
 */
export const useReferenceCatalogs = () => {
  const countries = useSWR<GenericResponse<IReferenceCountry[]>>(
    "/location/countries",
    fetcher,
    SWR_OPTIONS
  );
  const regions = useSWR<GenericResponse<IReferenceRegion[]>>("/data/regions", fetcher, SWR_OPTIONS);
  const clients = useSWR<GenericResponse<IReferenceClient[]>>("/data/clients", fetcher, SWR_OPTIONS);

  return {
    countries: countries.data?.data ?? [],
    regions: regions.data?.data ?? [],
    clients: clients.data?.data ?? [],
    isLoading: countries.isLoading || regions.isLoading || clients.isLoading
  };
};
