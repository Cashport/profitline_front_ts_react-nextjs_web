import { Pagination } from "../global/IGlobal";

export interface IClientsGroupsFull {
  status: number;
  message: string;
  data: IClientsGroup[];
  pagination: Pagination;
}

export interface IClient {
  id: string;
  client_name: string;
  holding_name: string;
  bussiness_name: string;
  client_type_name: string;
  shipto_count: number;
  total_portfolio: number;
  groups_count: number;
  status_name: string;
}

export interface IClientsGroup {
  id: number;
  group_name: string;
  clients_count: number;
  clients: IClient[];
  active: number;
  project_id: number;
  is_deleted: number;
  shipto_count: number;
  subscribers: number;
}

export interface IGroupsByUser {
  status: number;
  message: string;
  data: IGroupByUser[];
}

export interface IGroupByUser {
  id: number;
  user_id: number;
  group_id: number;
  group_name: string;
  project_id: number;
}
export interface ISingleClientGroupResponse {
  status: number;
  message: string;
  data: IClientsGroup;
}

