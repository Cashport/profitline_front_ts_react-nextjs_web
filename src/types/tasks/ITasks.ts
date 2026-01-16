export interface ITaskStatus {
  id: string;
  name: string;
  color: string;
  backgroundColor: string;
}

export interface ITaskTypes {
  ID: number;
  NAME: string;
}

export interface ITask {
  id: number | null;
  id_project: number;
  id_client: string | null;
  description: string;
  related_user_id: number | null;
  amount: number;
  created_at: string;
  is_ai: boolean;
  status: ITaskStatus;
  task_type: string;
  taskTypeId: number;
  client_name: string | null;
  client_uuid: string | null;
  user_name: string | null;
  incident_id: number | null;
  total_portfolio: number;
  order_amount: number;
}

export interface ITaskTabState {
  id: string;
  status_name: string;
  count: number;
}

export interface ITaskByStatus {
  tasks: ITask[];
  total: number;
  count: number;
  page: number;
  status: string;
  limit: number;
}

export interface ITaskClient {
  id: string;
  name: string;
  uuid: string;
}

export interface IEmailAttachment {
  id: number;
  email_id: number;
  file_name: string;
  inline: number;
  content_type: string;
  size: number;
  s3_key: string;
  s3_url: string;
  created_at: string;
}

export interface IEmailDetails {
  details: {
    id: number;
    email_account_id: number;
    message_id: string;
    subject: string;
    from_address: string;
    to_address: string;
    received_date: string;
    has_attachments: number;
    details: string;
    created_at: string;
  };
  attachments: IEmailAttachment[];
}

export interface ITaskDetail {
  id: number;
  description: string;
  status: ITaskStatus;
  task_type: string;
  client: ITaskClient;
  assigned_user: string;
  amount: number;
  id_email_api_emails: number | null;
  created_at: string;
  updated_at: string;
  source_metadata: unknown | null;
  actions_log: unknown[];
  days_in_status: number;
  is_overdue: boolean;
  emailDetails?: IEmailDetails;
}
