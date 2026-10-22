/** Filtros confirmados del listado: tipos (OR entre ellos) y rango de publicación. */
export interface IReportsFilters {
  typeIds: number[];
  /** YYYY-MM-DD, inclusivo. */
  from: string | null;
  /** YYYY-MM-DD, inclusivo. */
  to: string | null;
}

/** Posición del informe abierto dentro del listado filtrado y ordenado. */
export interface IReportPosition {
  index: number;
  total: number;
}
