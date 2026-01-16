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
