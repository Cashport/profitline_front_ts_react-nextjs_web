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
  id_client: string;
  id_project: number;
  client_name: string;
  id_country: number;
  stakeholder: number;
  archive_rules: IArchiveRule[];
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

// Client Detail File
export interface IClientDetailFile {
  id: number;
  nombre_archivo: string;
  tipo_archivo: string;
  fecha_hora: string;
  tamano: number;
  estado: string;
  acciones: string[];
  periodicidad: string;
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
  archivos: IClientDetailFile[] | null;
  estados_archivo: string[] | null;
  created_at: string | null;
  updated_at: string | null;
  last_activity: string | null;
}
