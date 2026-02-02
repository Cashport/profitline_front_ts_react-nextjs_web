import { IClientSegmentationDetail } from "@/types/clients/IClients";
import { GenericResponse } from "@/types/global/IGlobal";
import { fetcher } from "@/utils/api/api";
import useSWR from "swr";

const useClientSegmentationDetail = (clientUUID: string | null | undefined) => {
  const { data, isLoading, error, mutate } = useSWR<GenericResponse<IClientSegmentationDetail>>(
    clientUUID ? `/client/segmentation-detail?client_uuid=${clientUUID}` : null,
    fetcher
  );

  return { data: data?.data, isLoading, error, mutate };
};

export default useClientSegmentationDetail;
