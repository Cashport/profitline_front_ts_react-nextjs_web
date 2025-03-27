export interface IDocument {
  id: number;
  url: string;
  name: string;
}

export interface IDocumentResponse {
  id: number;
  documentTypeName: string;
  documentTypeDescription: string;
  createdBy: string;
  expiryDate: string;
  createdAt: string;
  approvers: string[];
  statusName: string;
  statusColor: string;
  statusId: string;
  templateUrl: string;
  documents: IDocument[];
}

export interface IDocumentApiResponse {
  status: number;
  message: string;
  data: IDocumentResponse;
}
