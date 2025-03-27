export interface Document {
  id: number;
  name: string;
  templateUrl: string | null;
  documentType: string;
  description?: string;
  createdAt: string | null;
  expiryDate: string | null;
  statusName: string;
  statusColor: string;
  url: string | null;
  requirementId?: number;
  approvers?: string[];
  type?: "form" | "document";
  events?: any[];
  files?: any[];
  uploadedAt?: string;
}
export const OPTIONS_BASE_LOCATION = [
  { value: 0, label: "Centro A" },
  { value: 1, label: "Centro B" },
  { value: 2, label: "Centro C" },
  { value: 3, label: "Centro D" }
];

export const OPTIONS_TYPE_CLIENTS = [
  { value: 1, label: "Cliente industrial" },
  { value: 2, label: "Persona natural" },
  { value: 3, label: "Cliente internacional" },
  { value: 4, label: "Empresa" }
];
export interface IOption {
  label: string;
  value: number;
}
export enum UserType {
  ADMIN = "admin",
  CLIENT = "client",
  APPROVER = "approver"
}

export interface Props {
  userType: string;
  clientTypeId: number;
}

export interface FormField {
  documentTypeId: number;
  formFieldType: "TEXT" | "SC" | "MC" | "NUMBER";
  question: string;
  description: string;
  options?: {
    opions: Array<{ label: string; value: number }>;
  };
  isRequired: number;
  value?: string | number | IOption | IOption[] | null;
}

export interface ApiResponse {
  status: number;
  message: string;
  id: number;
  name: string;
  documentNumber: number;
  documentType: number;
  documents: Document[];
  forms: Document[];
  creationForms: Array<{
    id: number;
    name: string;
    templateUrl: string | null;
    documentType: string;
    validity: string | null;
    subjectTypeId: string | null;
    subjectSubtypeId: number | null;
    documentTypeId: number;
    isMandatory: number;
    isAvailable: number;
    url: string | null;
    statusName: string;
    statusColor: string;
    statusId: string;
    fields: Array<{
      documentTypeId: number;
      formFieldType: "TEXT" | "SC" | "MC" | "NUMBER";
      question: string;
      description: string;
      options?: {
        opions: Array<{
          label: string;
          value: number;
        }>;
      };
      isRequired: number;
      value: string | number | IOption;
    }>;
  }>;
}
