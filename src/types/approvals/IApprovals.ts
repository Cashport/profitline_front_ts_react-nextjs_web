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
