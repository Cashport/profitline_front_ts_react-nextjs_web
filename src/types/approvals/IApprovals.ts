export interface IApprovalItem {
  id: number;
  typeActionCode: string;
  typeActionId: number;
  referenceId: string;
  approvalName: string;
  approvalLink: string;
  observation: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  requesterUserId: number;
  createdAt: string;
  updatedAt: string;
}

export interface IApprovalsResponse {
  page: number;
  limit: number;
  total: number;
  items: IApprovalItem[];
}

export interface IApprovalStepStatus {
  code: string;
  name: string;
  color: string;
  backgroundColor: string;
}

export interface IApprovalStep {
  id: number;
  approverUserId: number;
  order: number;
  isSequential: boolean;
  approvedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  status: IApprovalStepStatus;
}

export interface IApprovalAttachment {
  id: number;
  fileName: string;
  fileUrl: string;
  fileType: string;
  createdAt: string;
}

export interface IApprovalHistoryItem {
  id: number;
  action: string;
  userId: number;
  notes: string;
  createdAt: string;
}

export interface IApprovalDetail {
  id: number;
  typeActionCode: string;
  referenceId: string;
  approvalName: string;
  approvalLink: string;
  observation: string;
  description: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  requesterUserId: number;
  createdAt: string;
  updatedAt: string;
  steps: IApprovalStep[];
  attachments: IApprovalAttachment[];
  history: IApprovalHistoryItem[];
}
