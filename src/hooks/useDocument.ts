import useSWR from "swr";
import { fetcher } from "@/utils/api/api";
import { IDocumentResponse } from "@/interfaces/Document";
import { GenericResponse } from "@/types/global/IGlobal";

export const useDocument = (subjectId?: string, documentId?: number) => {
  const path = subjectId && documentId ? `/subject/${subjectId}/documents/${documentId}` : null;
  const { data, error, isLoading, mutate } = useSWR<GenericResponse<IDocumentResponse>>(
    path,
    fetcher
  );

  return {
    document: data?.data,
    isLoading,
    error,
    mutate
  };
};
