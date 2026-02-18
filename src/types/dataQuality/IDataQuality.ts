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
  color: string;
  abreviation: string;
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
  periodicity: string | null;
  status: string;
}

// Client List Response
export interface IClientDataList {
  data: IClientData[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
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
  stakeholder: string;
}

// Update Client Response (same as Create)
export type IUpdateClientResponse = ICreateClientResponse;

// Delete Client Response
export interface IDeleteClientResponse {
  deleted: boolean;
}

export interface IDataType {
  id: number;
  color: string;
  abreviation: string;
  description: string;
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
  variables: Record<string, string>;
  intake_type: {
    id: number;
    description: string;
  } | null;
  data_type: IDataType;
}

export interface IClientDetailArchiveClient {
  id: number;
  id_client_data_archives: any | null;
  id_type_archive: number;
  tipo_archivo: string;
  date_archive: string | null;
  description: string;
  id_status: number;
  status_description: string;
  date_upload: string | null;
  user_upload: string | null;
  size: number;
  procesed_url: string | null;
  acciones: string[];
  created_at: string;
  updated_at: string | null;
  data_type: IDataType;
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
  file?: File | null;
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
  product_type_id: number;
  product_type_code: string;
  product_type_name: string;
  type_vol_id: number;
  type_vol_code: string;
  type_vol_name: string;
  material_id: number;
  material_code: string;
  material_name: string;
  factor: number;
}

export interface ICatalogMaterial {
  id: number;
  material_code: string;
  material_name: string;
}

export interface ICatalogSelectOption {
  id: number;
  code: string;
  name: string;
}

export interface ICreateCatalogRequest {
  id_client: number;
  id_country: number;
  customer_product_cod: string;
  customer_product_description: string;
  product_type: number;
  type_vol: number;
  material_code: number;
  factor: number;
}

export interface IAlertFilterCountry {
  id: number;
  country_name: string;
  address_format: string;
}

export interface IAlertFilterClient {
  client_id: number;
  client_name: string;
  id_country: number;
  country_name: string;
}

export interface IAlertFilterStatus {
  id: number;
  description: string;
  budget_color: string;
}

export interface IGetFiltersAlerts {
  countries: IAlertFilterCountry[];
  clients: IAlertFilterClient[];
  alertStatus: IAlertFilterStatus[];
}

export interface IAlert {
  id: number;
  id_client: number;
  client_name: string;
  id_country: number;
  country_name: string;
  error_message: string;
  error_type: string;
  error_level: string;
  created_at: string;
  id_alert_status: number;
  status_description: string;
  status_color: string;
  id_archives_client_data: number;
  file_name: string | null;
}

export interface IGetAlerts {
  data: IAlert[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}
