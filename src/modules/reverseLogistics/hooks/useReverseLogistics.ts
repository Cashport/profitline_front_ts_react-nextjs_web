import useSWR from "swr";
import { GenericResponse } from "@/types/global/IGlobal";
import { IReturn } from "@/types/reverseLogistics/IReverseLogistics";
import { getReturns } from "@/services/reverseLogistics/reverseLogistics";

// SWR hook for the devoluciones list. Currently mock-backed via `getReturns`.
// When wiring the real endpoint, add the projectId to the key (e.g. from
// `useAppStore((s) => s.selectedProject)`) and pass `null` until it exists.
export const useReverseLogistics = () => {
  const { data, error, isLoading, mutate } = useSWR<GenericResponse<IReturn[]>>(
    "reverse-logistics/returns",
    () => getReturns(),
    { revalidateOnFocus: false }
  );

  return {
    returns: data?.data ?? [],
    isLoading,
    error,
    mutate
  };
};
