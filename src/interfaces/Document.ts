export interface IDocument {
  id: number;
  url: string;
  name: string;
}

export interface IDocumentApprover {
  documentTypeSubjectApproverId: number;
  documentTypeSubjectId: number;
  statusName: string;
  statusColor: string;
  statusId: string;
  userId: number;
  agentId: number;
  isIa: number; // Convertir 0/1 a boolean
  createdAt: string;
  approverName: string;
}

export interface IDocumentResponse {
  id: number;
  documentTypeName: string;
  documentTypeDescription: string;
  createdBy: string;
  expiryDate: string;
  createdAt: string;
  approvers: IDocumentApprover[];
  statusName: string;
  statusColor: string;
  statusId: string;
  templateUrl: string;
  documents: IDocument[];
}
