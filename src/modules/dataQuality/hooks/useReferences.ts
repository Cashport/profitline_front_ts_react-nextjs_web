import useSWR from "swr";
import { fetcher } from "@/utils/api/api";
import { GenericResponse } from "@/types/global/IGlobal";
import {
  IReferenceContextResult,
  IReferenceFile,
  IReferenceFilesFilters,
  IReferenceType
} from "@/types/dataQuality/IDataQuality";
import {
  ReferenceContextQuery,
  buildReferenceContextQuery,
  buildReferenceFilesQuery
} from "../references/references.utils";

const SWR_OPTIONS = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  dedupingInterval: 60000
} as const;

export const useReferenceTypes = () => {
  const { data, error } = useSWR<GenericResponse<IReferenceType[]>>(
    "/data/reference-types",
    fetcher,
    SWR_OPTIONS
  );

  return {
    referenceTypes: data?.data,
    isLoading: !error && !data,
    error
  };
};

export const useReferenceFiles = (filters: IReferenceFilesFilters, enabled = true) => {
  const key = enabled ? buildReferenceFilesQuery(filters) : null;
  const { data, error, isValidating, mutate } = useSWR<GenericResponse<IReferenceFile[]>>(key, fetcher, {
    ...SWR_OPTIONS,
    dedupingInterval: 30000,
    keepPreviousData: true
  });

  return {
    referenceFiles: data?.data,
    isLoading: enabled && !error && !data,
    isValidating,
    error,
    mutate
  };
};

/**
 * Contexto (propias + heredadas) de un ambito seleccionado.
 * `params = null` desactiva la peticion.
 */
export const useReferenceContext = (params: ReferenceContextQuery | null) => {
  const key = params ? buildReferenceContextQuery(params) : null;
  const { data, error, isValidating, mutate } = useSWR<GenericResponse<IReferenceContextResult>>(
    key,
    fetcher,
    {
      ...SWR_OPTIONS,
      dedupingInterval: 30000
    }
  );

  return {
    referenceContext: data?.data,
    isLoading: !!key && !error && !data,
    isValidating,
    error,
    mutate
  };
};

export const useReferenceFileDetail = (id: number | null) => {
  const { data, error, mutate } = useSWR<GenericResponse<IReferenceFile>>(
    id != null ? `/data/reference-files/${id}` : null,
    fetcher,
    SWR_OPTIONS
  );

  return {
    reference: data?.data,
    isLoading: id != null && !error && !data,
    error,
    mutate
  };
};
