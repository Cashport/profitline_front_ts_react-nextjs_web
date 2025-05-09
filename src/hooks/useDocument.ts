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

export interface IDocumentEvent {
  agentId: number | null;
  color: string;
  comment: string;
  createdAt: string;
  documentTypeSubjectId: number;
  id: number;
  name: string;
  photo: string;
  projectId: number;
  statusId: string;
  userId: number;
  username: string;
  is_ia: boolean;
  is_approved: boolean;
}

export const useDrawerDocumentEvents = (subjectId: string, documentSubjectId: number) => {
  const path = `/subject/${subjectId}/documents-tracking/${documentSubjectId}`;
  const { data, error, isLoading, mutate } = useSWR<GenericResponse<IDocumentEvent[]>>(
    subjectId && documentSubjectId ? path : null,
    fetcher
  );

  return {
    events: data?.data,
    isLoading,
    error,
    mutate
  };
};
