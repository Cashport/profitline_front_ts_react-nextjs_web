/** Tipo de informe del proyecto (GET /reports/types): catálogo que se amplía desde "Crear tipo". */
export interface IReportType {
  id: number;
  name: string;
}

/** Fila del listado de informes publicados (GET /reports). */
export interface IReport {
  /** UUID. */
  id: string;
  name: string;
  report_type_id: number;
  report_type_name: string;
  /** Fecha de publicación: la pone MySQL (ISO UTC). */
  created_at: string;
}

/** Detalle de un informe (GET /reports/:id): el HTML llega del backend y se pinta tal cual. */
export interface IReportDetail extends IReport {
  html: string;
}

/** Campos del multipart de POST /reports. */
export interface IPublishReportPayload {
  name: string;
  report_type_id: number;
  /** Archivo .html del informe. */
  file: File;
}

/**
 * Query de GET /reports: tipos en OR y rango de publicación. El backend la
 * aplica con días de Colombia.
 */
export interface IReportsFilters {
  report_type_ids: number[];
  /** yyyy-MM-dd, inclusivo. */
  from: string | null;
  /** yyyy-MM-dd, inclusivo. */
  to: string | null;
}
