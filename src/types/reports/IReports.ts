/** Tipo de informe: catálogo que se amplía desde "Crear tipo". */
export interface IReportType {
  id: number;
  name: string;
}

/** Fila del listado de informes publicados. */
export interface IReport {
  id: number;
  name: string;
  report_type_id: number;
  report_type_name: string;
  /** Fecha de publicación (ISO). */
  published_at: string;
}

/** Detalle de un informe: el HTML llega del backend y se pinta tal cual. */
export interface IReportDetail extends IReport {
  html: string;
}

export interface IPublishReportPayload {
  report_type_id: number;
  name: string;
  /** Archivo .html del informe. */
  file: File;
}
