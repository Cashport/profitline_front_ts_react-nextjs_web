import useSWR from "swr";

import { fetcher } from "@/utils/api/api";
import { useAppStore } from "@/lib/store/store";
import { GenericResponse, GenericResponsePage } from "@/types/global/IGlobal";
import { IProductPack, IProductPackDetail } from "@/types/productPack/IProductPack";

interface IUseProductPacksParams {
  page: number;
  search?: string;
  status?: 0 | 1;
}

export const useProductPacks = ({ page, search, status }: IUseProductPacksParams) => {
  const { ID } = useAppStore((state) => state.selectedProject);

  const params = new URLSearchParams({ page: String(page) });
  if (search?.trim()) params.set("searchQuery", search.trim());
  if (status !== undefined) params.set("is_available", String(status));

  const { data, error, isLoading, mutate } = useSWR<GenericResponsePage<IProductPack[]>>(
    ID ? [`/product-pack?${params.toString()}`, ID] : null,
    ([url]: [string]) => fetcher(url),
    { keepPreviousData: true }
  );

  return {
    data: data?.data ?? [],
    pagination: data?.pagination ?? { actualPage: 1, rowsperpage: 10, totalPages: 0, totalRows: 0 },
    isLoading,
    error,
    mutate
  };
};

export const useProductPackDetail = (id: number | null) => {
  const { ID } = useAppStore((state) => state.selectedProject);

  const { data, error, isLoading } = useSWR<GenericResponse<IProductPackDetail>>(
    ID && id ? [`/product-pack/${id}`, ID] : null,
    ([url]: [string]) => fetcher(url),
    { revalidateOnFocus: false }
  );

  return { data: data?.data, isLoading, error };
};
