import useSWR from "swr";

import instance from "@/utils/api/api";
import type { GenericResponse } from "@/types/global/IGlobal";
import type { IGetPreviewClients } from "@/types/communications/ICommunications";

interface Props {
  communicationId: string;
  page?: number;
  limit?: number;
  search?: string;
}

const fetcher40s = (url: string) =>
  instance
    .get(url, { timeout: 40000 })
    .then((res) => {
      if (!res.data) throw Error(res.data.message);
      return res.data;
    })
    .catch((error) => {
      if (error.code === "ECONNABORTED") {
        throw new Error("La solicitud ha sido cancelada debido a un timeout");
      }
      if (error.response?.data) throw new Error(error.response.data.message);
      if (error?.message) throw new Error(error.message);
      throw new Error("error");
    });

export const useClientCommunication = ({ communicationId, page, limit, search }: Props) => {
  const isEmail = /^\d+$/.test(communicationId);

  const params = new URLSearchParams();
  if (page) params.append("page", String(page));
  if (limit) params.append("limit", String(limit));
  if (search && search.trim()) params.append("search", search.trim());

  const basePath = isEmail
    ? `/comunication/circularizations/${communicationId}/clients`
    : `/cashport-whatsapp/send-template-bulk/preview`;

  const query = params.toString();
  const pathKey = `${basePath}${query ? `?${query}` : ""}`;
  const { data, error, isLoading, mutate } = useSWR<GenericResponse<IGetPreviewClients>>(
    pathKey,
    fetcher40s
  );

  return {
    data: data?.data,
    loading: isLoading,
    error,
    mutate
  };
};
