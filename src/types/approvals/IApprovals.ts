import { ApprovalStepStatus, ApprovalType } from "@/constants/approvalTypes";

export interface IApprovalItem {
  id: number;
  projectIncrement: number;
  typeActionCode: ApprovalType;
  typeActionId: number;
  referenceId: string;
  approvalName: string;
  approvalLink: string;
  observation: string;
  status: IApprovalStepStatus;
  clientName: string;
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
  approverName: string;
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

interface IRequester {
  id: number;
  userName: string;
}

export interface IApprovalDetail {
  id: number;
  projectIncrement: number;
  typeActionCode: ApprovalType;
  referenceId: string;
  approvalName: string;
  approvalLink: string;
  observation: string;
  description: string;
  status: ApprovalStepStatus;
  requester: IRequester;
  createdAt: string;
  updatedAt: string;
  steps: IApprovalStep[];
  attachments: IApprovalAttachment[];
  history: IApprovalHistoryItem[];
}

export interface IApprovalStatusItem {
  id: number;
  code: string;
  name: string;
  color: string;
  backgroundColor: string;
  isFinal: boolean;
}

export interface IGetApprovalStatus {
  total: number;
  items: IApprovalStatusItem[];
}

export interface IGetApprovalTypeActions {
  id: number;
  code: string;
  name: string;
  description: string;
  hasTemplate: boolean;
}

export type ApprovalDecision = "APPROVE" | "REJECT";

export interface IResolveApprovalRequest {
  decision: ApprovalDecision;
  comment?: string;
}

export interface ICreateApprovalRequest {
  typeActionCode: string;
  approvalName: string;
  approvalLink: string;
  referenceId: string;
}
