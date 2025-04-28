import { IBillingPeriodForm } from "../billingPeriod/IBillingPeriod";

export interface IClientFullResponse {
  status: number;
  message: string;
  data: IClient;
}

export interface IClientLocation {
  id: number;
  address: string;
  city: string;
  complement: string;
  project_id: number;
  location_id: number;
}

export interface IClientLocationResponse {
  data: IClientLocation[];
  error: boolean;
  message: string;
}

interface IDocument {
  URL: string;
}

export interface IClient {
  billing_period: string;
  billing_period_config: IBillingPeriodForm | null;
  business_name: string;
  client_name: string;
  cliet_type: string;
  client_type_id: number;
  condition_payment: number;
  condition_payment_id: number;
  documents: IDocument[] | null;
  document_type: string;
  email: string;
  holding_id: number | null;
  holding_name: string | null;
  is_deleted: number;
  locations: IClientLocation[] | null[];
  nit: number;
  phone: string;
  project_id: number;
  radication_type: number;
  radication_type_name: string;
  risk: string;
  risk_id: number;
  status: string;
  uuid: string;
}

export interface Pagination {
  page: number;
  total: number;
}

export interface IClients {
  status: number;
  message: string;
  data: IClient[];
  pagination: Pagination;
}

export interface ICreateClient {
  [key: string]: any;
  nit: string;
  project_id: number;
  client_name: string;
  business_name: string;
  phone: number | string;
  condition_payment: number;
  email: string;
  radication_type: number;
  document_type: number;
  locations: string;
  documents: File[];
  client_type_id: number;
  holding_id?: number;
  day_flag?: boolean;
  day?: number;
  order?: string;
  day_of_week?: string;
}

export interface IUpdateClient {
  [key: string]: any;
  business_name?: string;
  condition_payment?: number;
  document_type?: number;
  email?: string;
  holding_id?: number;
  locations: string;
  day_flag?: boolean;
  day?: number;
  order?: string;
  day_of_week?: string;
  phone?: string;
  radication_type: number;
}

export type ClientFormType = {
  infoClient: {
    address: string;
    document_type: ISelectType;
    nit: string;
    client_name: string;
    business_name: string;
    client_type: ISelectType;
    holding_id: ISelectType;
    phone: string;
    email: string;
    locations: any[];
    city: ISelectType;
    risk: string;
    radication_type: ISelectType;
    condition_payment: ISelectType;
    billing_period: string;
  };
};

export interface ISelectType {
  value: number;
  label: string;
}
