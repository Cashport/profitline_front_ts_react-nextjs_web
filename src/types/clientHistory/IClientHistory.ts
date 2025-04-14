export interface IHistoryRow {
  id: number;
  event: string;
  description: string;
  project_id: number;
  id_client: string;
  userId: number;
  created_at: string;
  is_deleted: number;
  url: string;
  id_mongo_log: string;
  user_name: string;
}

export interface IHistoryCommunicationDetail {
  _id: string;
  client_id: string;
  project_id: number;
  comunication_id: number;
  email_send: string[];
  email_copy: string[];
  subject: string;
  body: string;
  send_date_time: string; // ISO 8601 date-time format
  status: string;
  retry_count: number;
  __v: number;
}
