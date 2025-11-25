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
  id: number;
  id_project: number;
  id_client: string;
  description: string;
  related_user_id: number;
  amount: number;
  status: ITaskStatus;
  client_name: string;
  user_name: string;
  total_portfolio: number;
  incident_id: number;
  task_type: string;
}
