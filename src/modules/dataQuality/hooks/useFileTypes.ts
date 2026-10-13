import useSWR from "swr";

import { getFileTypes } from "@/services/dataQuality/dataQuality";

const FILE_TYPES_KEY = "dashboard-header-file-types";

export const useFileTypes = () => {
  const { data, error, isLoading } = useSWR(FILE_TYPES_KEY, getFileTypes, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000
  });

  return { data, error, isLoading };
};
