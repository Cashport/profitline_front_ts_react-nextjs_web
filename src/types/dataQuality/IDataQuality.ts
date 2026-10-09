import { GenericResponse } from "@/types/global/IGlobal";

export interface GenericResponseWithFilters<T = any, F = any> extends GenericResponse<T> {
  filters: F;
}

export interface IDataEmail {
  id: number;
  project_id: number;
  client_id: number | null;
  client_name: string | null;
  sender: string;
  subject: string | null;
  destination_folder: string | null;
  outlook_folder_id: string | null;
  outlook_subfolder: string | null;
}

export interface IDataClient {
  id: string;
  client_name: string;
  id_client: number;
}

export interface ICountryClientsFilters {
  status: string[];
  periodicity: string[];
  archive_types: IDataType[];
  intake_types: {
    id: number;
    description: string;
  }[];
}

export interface ICountryAlertsByCategory {
  automation: number;
  missing: number;
  processing: number;
  quality: number;
  catalog: number;
}

export interface ICountryAutomationFailure {
  name: string;
  reason: string;
}

export interface ICountryPendingClient {
  client: string;
  process_type: string;
  count: number;
}

export interface ICountry {
  id_country: number;
  country_name: string;
  country_iso: string;
  total_clients: number;
  monthly_ingestion_percentage: number;
  active_alerts: number;
  last_update_date: string;
  alerts_by_category: ICountryAlertsByCategory;
  automation_failures: ICountryAutomationFailure[];
  pending_clients: ICountryPendingClient[];
  total_files_expected: number;
  status: string;
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
  alerts: number;
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

// Espejo de VariableHistoryEntryDTO (cashport-backend), una fila de auditoría de
// data.client_data_variable_history. GET /data/client-archive-monthly/:id/variable-history.
export interface IVariableHistoryEntry {
  id: number;
  id_client_data: number;
  id_data_archives: number;
  variable_key: string;
  change_type: "CREATED" | "UPDATED" | "DELETED";
  old_value: string | null;
  new_value: string | null;
  changed_by_user_id: number | null;
  changed_by_email: string | null;
  created_at: string;
}

export interface IClientDetailArchiveClient {
  id: number;
  id_client_data_archives: any | null;
  id_type_archive: number;
  tipo_archivo: string;
  date_archive: string | null;
  description: string;
  id_status: number;
  last_novelty: string | null;
  status_description: string;
  status_color: string;
  status_bg_color: string;
  date_upload: string | null;
  user_upload: string | null;
  uploader_user: string | null;
  size: number;
  procesed_url: string | null;
  evidence_url: string | null;
  acciones: string[];
  created_at: string;
  updated_at: string | null;
  data_type: IDataType;
}

export interface IClientDetailArchivesByType {
  id_type_archive: number;
  tipo_archivo: string;
  data_type?: IDataType; // optional: absent in groups with no archives
  total_archives: number;
  pending_archives: number;
  archives: IClientDetailArchiveClient[];
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
  status: string;
  client_id: number;
  client_name: string;
  product_type_id: number;
  product_type_code: string;
  product_type_name: string;
  type_vol_id: number;
  type_vol_code: string;
  type_vol_name: string;
  material_id: number | null;
  material_code: string | null;
  material_name: string | null;
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

export interface IAlertCategoryItem {
  client: string;
  message: string;
  error_type: string;
}

export interface IAlertFilterCategory {
  key: string;
  name: string;
  count: number;
  error_types: string[];
  items: IAlertCategoryItem[];
  remaining: number;
}

export interface IGetFiltersAlerts {
  countries: IAlertFilterCountry[];
  clients: IAlertFilterClient[];
  alertStatus: IAlertFilterStatus[];
  types: string[];
  categories: IAlertFilterCategory[];
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
  historical_avg_units?: number;
  reported_units?: number;
  variation_percent?: number;
}

export interface IGetAlerts {
  data: IAlert[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface IMaterialPackMaterial {
  materialPackId: number;
  productType: string;
  productTypeName: string;
  typeVol: string;
  typeVolName: string;
  idCatalogMaterial: number;
  materialCode: string;
  materialName: string;
  factor: number;
}

export interface IMaterialPack {
  idCatalogMaterialAux: number;
  idClient: number;
  idProject: number;
  idCountry: number;
  clientName: string;
  customerProductCod: string;
  customerProductDescription: string;
  materials: IMaterialPackMaterial[];
}

export interface IPackMaterialRequest {
  product_type: number;
  type_vol: number;
  id_catalog_material: number;
  factor: number;
}

export interface IUploadMassiveOrHistoricalRequest {
  id_client: number;
  id_country: number;
  id_type_archive: number;
  data_type: string;
}

export interface IPacksUploadResult {
  total: number;
  success: number;
  errors: number;
  created: number;
  updated: number;
  error_log: { url: string; filename: string } | null;
}

export interface IPOS {
  id: number;
  id_country: number;
  country: string;
  department_id: number;
  department: string;
  city_id: number | null;
  sold_to: number;
  ship_to: string;
  customer_name: string;
  pos_id: string;
  pos_name: string;
  pos_tax_code: string;
  channel_id: number;
  channel: string;
  sub_channel_id: number;
  sub_channel: string;
  pos_chain_name: string;
  pos_format_store: string;
  pos_active: boolean;
  pos_internal_zone: string;
  pos_external_zone: string;
  pos_neighborhood: string;
  pos_address: string;
  pos_geolongitud: number | null;
  pos_geolatitud: number | null;
  pos_supervisor: string;
  pos_internal_sales_representative: string;
  pos_external_sales_representative: string;
  pos_cod_sfe: string;
}

export type IPOSPayload = Pick<IPOS, "sold_to" | "id_country" | "pos_id" | "pos_name"> &
  Partial<Omit<IPOS, "sold_to" | "id_country" | "pos_id" | "pos_name">>;

export interface IGetCatalogMaterialEquivalence {
  id: number;
  catalog_material_id: number;
  internal_sku: string;
  internal_name: string;
  conversion_factor: number;
  valid_from: string;
  valid_to: string | null;
  is_active: number;
}

export interface IPostCatalogMaterialEquivalence {
  material_code: number;
  conversion_factor: number;
  valid_from: string;
  valid_to: string | null;
  is_active: number;
}

// Dashboard

// Dashboard - Data Exploration
export interface IDataExplorationTotals {
  units_haleon: number;
  vol_reported: number;
  value: number;
  total_registros: number;
  novedades: number;
}

export interface IDataExplorationRow {
  id_client: number;
  client_name: string;
  data_type: string;
  date: string;
  region: string;
  country: string;
  ship_to_id: string;
  sold_to_id: string;
  units_haleon: number;
  vol_reported: number;
  value: number;
  total_registros: number;
  novedades: number;
}

export interface IDataExplorationDate {
  date: string;
  rows: IDataExplorationRow[];
  totals: IDataExplorationTotals;
  novedades_percent?: number;
  status?: string;
}

export interface ILastMonthDataExploration {
  novedades: number;
  novedades_percent: number;
  units_haleon: number;
  vol_reported: number;
}

export interface IDataExplorationClient {
  id_client: number;
  client_name: string;
  country_client_id: number;
  dates: IDataExplorationDate[];
  totals: IDataExplorationTotals;
  last_month: ILastMonthDataExploration | null;
  periodicity: string | null;
}

export interface IGetDataExploration {
  clients: IDataExplorationClient[];
  id_country: number;
  month: string;
  totals: IDataExplorationTotals;
}

// Dashboard - Summary

export interface IDashboardSummaryAppliedFilters {
  id_country: number;
  month: string;
}

export interface IDashboardSummaryStatus {
  esperados: number;
  transformados: number;
  novedades: number;
  pendientes: number;
  estado: number;
}

export interface IDashboardSummaryKpiByRegion extends IDashboardSummaryStatus {
  key: string;
  label: string;
}

export interface IDashboardSummaryKpiByTypeArchive extends IDashboardSummaryStatus {
  key: number;
  label: string;
}

export interface IDashboardSummaryKpis {
  byRegion: IDashboardSummaryKpiByRegion[];
  byTypeArchive: IDashboardSummaryKpiByTypeArchive[];
}

export interface IDashboardSummaryAlertClient {
  id_client: number;
  client_name: string;
}

export interface IDashboardSummaryAlert {
  name: string;
  count: number;
  color: string;
  clients: IDashboardSummaryAlertClient[];
}

export interface IDashboardSummaryExploration {
  month: string;
  id_country: number;
  totals: IDataExplorationTotals;
  clients: IDataExplorationClient[];
}

export interface IDashboardSummaryClientStatusFile {
  id_client_data_archives: number;
  id_type_archive: number;
  type_archive: string;
  status: string;
  transformation: string;
  sent: string | null;
  observation: string | null;
  periodicity: string;
}

export interface IDashboardSummaryClientStatusClient extends IDashboardSummaryStatus {
  id_client: number;
  client_name: string;
  files_count: number;
  files: IDashboardSummaryClientStatusFile[];
}

export interface IDashboardSummaryClientStatus extends IDashboardSummaryStatus {
  region: string;
  id_country: number;
  country_name: string;
  clients_count: number;
  files_count: number;
  clients: IDashboardSummaryClientStatusClient[];
}

// periodicity

export interface IDashboardSummaryPeriodicity {
  periodicity: string;
  total_archivos: number;
  procesados: number;
  novedades: number;
  retrasados: number;
  pendientes: number;
}

export interface IDashboardSummary {
  filters: IDashboardSummaryAppliedFilters;
  globalStatus: IDashboardSummaryStatus;
  kpis: IDashboardSummaryKpis;
  alerts: IDashboardSummaryAlert[];
  clientStatus: IDashboardSummaryClientStatus[];
  periodicity: IDashboardSummaryPeriodicity[];
  exploration: IDashboardSummaryExploration[];
}

export interface IFileType {
  id: number;
  description: string;
}

export interface IAuxiliaryFile {
  id: number;
  file_type: string;
  file_type_color: string;
  description: string | null;
  file_url: string | null;
  file_size: number | null; // bytes
  created_at: string;
  uploaded_at: string | null;
}

export interface IRegion {
  id: number;
  abbreviation: string;
  region_code: string;
  country_count: number;
}

// Espejo de BotStatusDTO (cashport-backend, GET /data/bots/status, rama Develop/API-bots
// -- verificado leyendo src/model/data/data.dto.ts de ese repo). `estado` lista los 6
// valores reales que calcula el backend hoy, incluido "EN_REVISION" (regla de negocio ya
// implementada server-side: última ejecución exitosa con la inmediatamente anterior
// fallida). PENDIENTE y SIN_EJECUCIONES son estados reales propios, NO sinónimos de
// EN_REVISION.
export interface IBotStatusItem {
  schedule_id: number;
  id_client_data: number;
  cliente: string;
  bot: string;
  pais: string | null;
  tipo_archivo: string | null;
  periodicidad: string[];
  cron_expression: string;
  horario_descripcion: string | null;
  proxima_ejecucion: string | null;
  ultima_ejecucion: string | null;
  estado: "SIN_EJECUCIONES" | "PENDIENTE" | "EN_EJECUCION" | "EXITOSO" | "FALLIDO" | "EN_REVISION";
  cantidad_ejecuciones: number;
  ejecuciones_hoy: number;
  fallas_hoy: number;
  error: string | null;
  error_legible: string | null;
  codigo_error: string | null;
  categoria_error: string | null;
  diagnostico: string | null;
  detalle_tecnico: string | null;
  paso_fallido: string | null;
  accion_requerida: string | null;
  // Siempre null hoy: data.scheduler_runs no tiene columna de evidencia/captura.
  evidencia_url: string | null;
}

// Espejo de BotRunNowResultDTO (cashport-backend), respuesta de
// POST /data/bots/run-now/:scheduleId.
export interface IBotRunNowResult {
  scheduleId: number;
  accepted: boolean;
  schedulerStatus: number;
  schedulerMessage: string;
}

// Espejo de BotHistoryEntryDTO (cashport-backend), una fila real de data.scheduler_runs.
// `estado` NO incluye "EN_REVISION": ese es un estado agregado de BotStatusDTO, no de
// una corrida individual.
export interface IBotHistoryEntry {
  id: number;
  schedule_id: number;
  fecha_inicio: string;
  fecha_fin: string | null;
  estado: "PENDIENTE" | "EN_EJECUCION" | "EXITOSO" | "FALLIDO";
  duracion_segundos: number | null;
  error: string | null;
  error_legible: string | null;
  codigo_error: string | null;
  categoria_error: string | null;
  diagnostico: string | null;
  detalle_tecnico: string | null;
  paso_fallido: string | null;
  accion_requerida: string | null;
  evidencia_url: string | null;
}

// Espejo de BotHistoryListResponseDTO, respuesta de GET /data/bots/:scheduleId/history.
export interface IBotHistoryList {
  data: IBotHistoryEntry[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}
