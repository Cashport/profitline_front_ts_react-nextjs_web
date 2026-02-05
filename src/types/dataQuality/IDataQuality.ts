export interface ICountry {
  id_country: number;
  country_name: string;
  country_iso: string;
  total_clients: number;
  monthly_ingestion_percentage: number;
  active_alerts: number;
  last_update_date: string;
}

export interface ISummaryCountries {
  countries: ICountry[];
  total_countries: number;
  current_page: number;
  per_page: number;
  total_pages: number;
}

// Periodicity structures
export interface IPeriodicityRepeat {
  day: number[];
  interval: string;
  frequency: string;
}

export interface IPeriodicity {
  repeat: IPeriodicityRepeat;
  end_date?: string;
  start_date?: string;
}

// Client Data Archive
export interface IClientDataArchive {
  id: number;
  description: string;
  periodicity: IPeriodicity;
}

// Client (from list endpoint)
export interface IClientData {
  id: number;
  id_client: string;
  id_project: number;
  client_name: string;
  id_country: number;
  stakeholder: number | null;
  created_at: string;
  created_by: number | null;
  updated_at: string | null;
  updated_by: number | null;
  deleted_at: string | null;
  deleted_by: number | null;
  is_deleted: number;
  client_data_archives: IClientDataArchive[];
  country_name: string;
}

// Client List Response
export interface IClientDataList {
  data: IClientData[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// Archive Rule (for create/update)
export interface IArchiveRule {
  id_type_archive: number;
  periodicity_json: IPeriodicity;
}

export interface IArchiveRuleResponse {
  id: number;
  id_type_archive: number;
  periodicity: string;
  periodicity_json: IPeriodicity;
}

// Create Client Request
export interface ICreateClientRequest {
  client_name: string;
  id_country: number;
  id_project: number;
  stakeholder: string;
}

// Create Client Response
export interface ICreateClientResponse {
  client_data: {
    id: number;
    id_client: string;
    id_project: number;
    client_name: string;
    id_country: number;
    stakeholder: number;
  };
  archive_rules: IArchiveRuleResponse[];
}

// Update Client Request
export interface IUpdateClientRequest {
  client_name: string;
  id_country: number;
  archive_rules: IArchiveRule[];
}

// Update Client Response (same as Create)
export type IUpdateClientResponse = ICreateClientResponse;

// Delete Client Response
export interface IDeleteClientResponse {
  deleted: boolean;
}

export interface IClientDetailDataArchive {
  id: number;
  id_type_archive: number;
  tipo_archivo: string;
  periodicity: string;
  periodicity_json: IPeriodicity;
  strategy: string;
  input_file_skip_rows: number;
  url: string;
  created_at: string;
  updated_at: string;
}

export interface IClientDetailArchiveClient {
  id: number;
  id_client_data_archives: any | null;
  id_type_archive: number;
  tipo_archivo: string;
  description: string;
  id_status: number;
  status_description: string;
  date_upload: string | null;
  user_upload: string | null;
  size: number;
  intake_type_id: number | null;
  acciones: string[];
  created_at: string;
  updated_at: string | null;
}

// Client Detail
export interface IClientDetail {
  id: number | null;
  id_client: string | null;
  client_name: string | null;
  id_country: number | null;
  country_name: string | null;
  stakeholder: number | null;
  periodicidad: string[] | null;
  tipos_archivo_esperados: string[] | null;
  fuente_ingesta: string[] | null;
  detalle_fuente: string | null;
  client_data_archives: IClientDetailDataArchive[];
  archives_client_data: IClientDetailArchiveClient[];
  estados_archivo: string[] | null;
  created_at: string | null;
  updated_at: string | null;
  last_activity: string | null;
}

// Catalog interfaces for parameter data
export interface ICatalogItem {
  id: number;
  description: string;
}

export interface IStakeholder {
  id: number;
  name: string;
  email: string;
}

export interface IParameterCatalogs {
  countries: ICatalogItem[];
  archive_types: ICatalogItem[];
  archive_status: ICatalogItem[];
  stakeholders: IStakeholder[];
}

export interface IParameterClientData {
  id: number;
  id_client: string;
  client_name: string;
  id_country: number;
  country_name: string;
  stakeholder: number | null;
}

// Main parameter data interface
export interface IParameterData {
  client_data: IParameterClientData;
  intake_types: {
    id: number;
    description: string;
  }[];
  archive_rules: IArchiveRuleResponse[];
  variables: IParameterVariable[];
  catalogs: IParameterCatalogs;
}

export interface IParameterVariable {
  id: number;
  variable_key: string;
  variable_value: string;
}

// Intake interfaces
export interface IPeriodicityJSON {
  repeat: {
    day?: number[] | string[];
    interval: string;
    frequency: string;
  };
  end_date: string;
  start_date: string;
}

export interface ICreateIntakeRequest {
  file: File;
  id_client_data: number;
  id_type_archive: number;
  id_status: number;
  intake_type_id: number;
  periodicity_json: IPeriodicityJSON;
  variables: Array<{ variable_key: string; variable_value: string }>;
}

export interface IGetCatalogs {
  id: number;
  customer_product_cod: string;
  customer_product_description: string;
  product_type: string;
  type_vol: string;
  material_code: string;
  material_name: string;
  factor: number;
}
