import useSWR from "swr";

import {
  getProfitLoaderById,
  getProfitLoaders,
  getProfitLoaderTimeline
} from "@/services/marketAdmin/marketAdmin";

export const PROFIT_LOADERS_KEY = "/profit-loader/loaders";
export const getProfitLoaderTimelineKey = (loaderId: number) =>
  `/profit-loader/etl/${loaderId}/timeline`;

export const useProfitLoaders = () => {
  const { data, error, isLoading, mutate } = useSWR(PROFIT_LOADERS_KEY, getProfitLoaders, {
    keepPreviousData: true
  });

  return {
    loaders: data?.data ?? [],
    isLoading,
    error,
    mutate
  };
};

export const useProfitLoader = (id: number | null) => {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `${PROFIT_LOADERS_KEY}/${id}` : null,
    () => getProfitLoaderById(id as number),
    { keepPreviousData: true }
  );

  return {
    loader: data?.data ?? null,
    isLoading,
    error,
    mutate
  };
};

export const useProfitLoaderTimeline = (loaderId: number | null) => {
  const { data, error, isLoading, mutate } = useSWR(
    loaderId ? getProfitLoaderTimelineKey(loaderId) : null,
    () => getProfitLoaderTimeline(loaderId as number),
    { keepPreviousData: true }
  );

  return {
    timeline: data?.data ?? [],
    total: data?.total ?? 0,
    isLoading,
    error,
    mutate
  };
};
