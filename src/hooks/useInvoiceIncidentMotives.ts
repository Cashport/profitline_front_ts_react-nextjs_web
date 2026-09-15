import useSWR from "swr";
import { fetcher } from "@/utils/api/api";
import type { GenericResponse } from "@/types/global/IGlobal";
import type { IIncidentMotive } from "@/types/novelties/INovelties";

export const useInvoiceIncidentMotives = () => {
  const { data, error, isLoading } = useSWR<GenericResponse<IIncidentMotive[]>>(
    "/invoice/incident/motives",
    fetcher,
    { revalidateOnFocus: false }
  );
  return {
    data: data?.data,
    isLoading,
    isError: !!error
  };
};
