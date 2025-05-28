import config from "@/config";
import { API } from "@/utils/api/api";
import { IDocument } from "@/interfaces/Document";

export const uploadDocument = async (
  subjectId: string,
  documentTypeSubjectId: number,
  file: File
): Promise<IDocument> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await API.post(
    `/subject/${subjectId}/documents/${documentTypeSubjectId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );
  return response.data;
};

export const deleteDocument = async (
  subjectId: string,
  documentTypeSubjectId: number,
  documentId: number
): Promise<void> => {
  await API.delete(
    `/subject/${subjectId}/documentTypeSubjectId/${documentTypeSubjectId}/document/${documentId}`
  );
};
export const createDocumentComment = async (comment: string, documentSubjectId: number) => {
  const body = {
    comment
  };
  try {
    const response = await API.post(
      `${config.API_HOST}/subject/create-comment/${documentSubjectId}`,
      body
    );
    return response;
  } catch (error) {
    console.error("Error creating document comment:", error);
    throw error;
  }
};
