import useSWR from "swr";
import { fetcher } from "@/utils/api/api";
import { IDocumentApiResponse } from "@/interfaces/Document";

export const useDocument = (subjectId?: string, documentId?: number) => {
  const path = subjectId && documentId ? `/subject/${subjectId}/documents/${documentId}` : null;
  const { data, error, isLoading, mutate } = useSWR<IDocumentApiResponse>(path, fetcher);

  return {
    document: data?.data,
    isLoading,
    error,
    mutate
  };
};
