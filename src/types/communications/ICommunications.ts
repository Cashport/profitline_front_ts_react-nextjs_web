import dayjs from "dayjs";

interface TriggerSettingsForm {
  days?: string[];
  actions?: ISelectStringType[];
  subActions?: ISelectStringType[];
  event_type?: ISelectStringType;
  noticeDaysEvent?: string;
}

interface TriggerForm {
  type: 1 | 2 | 3 | number;
  settings: TriggerSettingsForm;
}

interface ITemplateForm {
  via: ISelectStringType;
  send_to: ISelectStringType[];
  copy_to: ISelectStringType[] | undefined;
  tags?: ISelectStringType[];
  message: string;
  subject: string;
  files: ISelectStringType[] | null;
}

export interface ICommunicationForm {
  attachment_ids: number[];
  name: string;
  description: string;
  trigger: TriggerForm;
  template: ITemplateForm;
}

export interface ISelectStringType {
  value: string;
  label: string;
}

export interface IPeriodicityModalForm {
  init_date: undefined | dayjs.Dayjs;
  frequency_number: number | undefined;
  frequency: ISelectStringType;
  days: ISelectStringType[];
  end_date: undefined | dayjs.Dayjs;
}

export interface ICreateCommunication {
  project_id: number;
  name: string;
  description: string;
  attachment_ids: number[];
  subject: string;
  message: string;
  via: "email" | string;
  user_roles: number[];
  contact_roles: number[];
  client_group_ids: number[];
  comunication_type: 1 | 2 | 3 | number; // Enforce valid communication types //1 frecuency, 2 event, 3 action
  other_mails?: string[];

  // Frequency-specific properties (optional)
  json_frecuency?: {
    start_date: string;
    repeat: {
      interval: number;
      frequency: "mensual" | "semanal" | string;
      day: string[] | number[];
    };
    end_date: string;
  };

  // Action-specific properties (optional)
  action_type_ids?: number[];
  sub_action_type_ids?: number[];

  // Event-specific properties (optional, can be added if needed)
  id_event_type?: number;
  delay_event?: number;
}

interface ISelect {
  id: number;
  name: string;
}

interface Frequency {
  repeat: Repeat;
  endDate: string;
  startDate: string;
}

interface Repeat {
  day: string;
  interval: number;
  frequency: "Semanal" | "Mensual";
}
export interface ICommunication {
  id: number;
  idProject: number;
  name: string;
  description: string;
  userRoles: ISelect[];
  contactRoles: ISelect[];
  actionTypeIds: number[];
  subActionTypeIds: number[];
  clientGroupId: ISelect[];
  idCommunicationType: ISelect;
  comunicacionState: number;
  via: string;
  subject: string;
  message: string;
  JSON_frecuency: Frequency;
}

export interface Iattachments {
  id: number;
  name: string;
}

export interface ICommunicationDetail {
  attachment_ids: any;
  id: number;
  id_project: number;
  name: string;
  description: string;
  user_roles: ISelect[];
  contact_roles: ISelect[];
  action_type_ids: ISelect[];
  sub_action_type_ids: ISelect[];
  client_group_id: ISelect[];
  id_comunication_type: ISelect;
  comunicacion_state: number; // 1 or 0
  via: string;
  subject: string;
  message: string;
  JSON_frecuency: {
    repeat: {
      day: string;
      interval: number;
      frequency: string; // e.g., "Semanal" or "Mensual"
    };
    end_date: string; // e.g., "2024-11-23" (ISO 8601 date format)
    start_date: string; // e.g., "2024-11-08" (ISO 8601 date format)
  };
  attachments_ids: Iattachments[];
}

export interface ISingleCommunication {
  id: number;
  via: string;
  reason: string;
  frequency: string;
  clients: number;
  projectId: number;
  rules: {
    channel: number[];
    line: number[];
    subline: number[];
    zone: number[];
    groups_id: number[];
  };
  created_at: string;
  updated_at: string;
  IS_DELETED: number;
  COMUNICATION_NAME: string;
  ID: number; // redundant with id?
  TITLE: string;
  BODY: string;
  TEMPLATE_TYPE: string;
  TEMPLATE_SUBJECT: string;
  FILES: string | null;
  CREATED_AT: string;
  UPDATED_AT: string;
  action_type: null | object;
  tags: string[];
  project_id: null | number;
  type: string;
  template_id: number;
  period: null | object;
  date_init_frequency: string;
  date_end_frequency: string;
  frequency_days: string[];
  event_days_before: null | number;
  last_send: null | string;
  event_invoice_id: null | number;
  invoice_event_type_id: null | number;
  repeats: number | undefined;
  copy_to: string[] | null;
  send_to: string[];
  EVENT_TYPE: string;
}

export interface ITemplateCommunication {
  id: number;
  id_project: number;
  name: string;
  description: string;
  client_group_id: number[];
  comunicacion_state: string | null;
  id_comunicacion_type: number;
  JSON_frecuency: string | null;
  id_event_type: number | null;
  delay_event: number | null;
  via: string;
  subject: string;
  message: string;
  comunicacion_state_id: number;
  user_roles: string; // JSON string representation of roles (might be better as an array if properly parsed)
  contact_roles: number[];
  action_type_ids: number[];
  sub_action_type_ids: number[];
  document_comunication_id: number | null;
  id_mongo_log: string | null;
  other_mails: string | null;
  files: string[]; // Array of file URLs
  recipients: string[]; // Array of recipient emails
}

export interface IMassiveCommunicationTemplate {
  id: number;
  id_project: number;
  name: string;
  description: string;
  subject: string;
  message: string;
  via: string;
  attachments: Array<string | { id: number; name: string }>;
  action_type_ids: number[];
  sub_action_type_ids: number[];
  id_comunicacion_type: number;
}

export interface ICreateCommunicationTemplate {
  project_id: number;
  name: string;
  description: string;
  subject: string;
  message: string;
  via: string;
  contact_roles: number[];
  other_mails: string[];
  comunication_type: number;
  action_type_ids: number[];
}

export interface IValidatedClients {
  clientId: string;
  identifier: string;
  clientName: null;
  status: "NOT_FOUND" | "FOUND";
}

export interface IGetValidatedClientsResponse {
  clientId: string;
  clientName: string;
  isValid?: boolean;
}
