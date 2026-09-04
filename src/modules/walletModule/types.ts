/** Estado de una factura dentro de la cartera. */
export type EstadoKey = "compensada" | "pagada" | "conciliado" | "novedad" | "sin_conciliar";

/** Severidad visual compartida por chips y estados de novedad. */
export type Sev = "ok" | "warn" | "crit" | "idle";

/** Índice de tramo de vencimiento: 0 = corriente … 5 = +120 días. */
export type TramoIndex = 0 | 1 | 2 | 3 | 4 | 5;

/** Montos por estado + totales de un conjunto de facturas. */
export interface WalletSegments extends Record<EstadoKey, number> {
  total: number;
  vencido: number;
  n: number;
}

/** Una celda de la matriz: el cruce cliente × tramo. */
export interface IWalletMatrixCell extends Record<EstadoKey, number> {
  total: number;
}

/** Fila de la "Matriz de control". */
export interface IWalletClientRow {
  id: string;
  nombre: string;
  nit: string;
  ejecutivo: string;
  /** Seis celdas, una por tramo, en el orden de TRAMOS. */
  tramos: IWalletMatrixCell[];
}

/** Fila de "Grupos de facturas". */
export interface IWalletGroupRow {
  clave: string;
  tipo: EstadoKey;
  /** Sólo para grupos de tipo "novedad". */
  novedadId?: string;
  /** Subtítulo: tipo de novedad, o la descripción corta del estado. */
  detalle: string;
  cliente: string;
  facturas: number;
  monto: number;
  /** Reparto del monto entre los seis tramos. */
  tramos: number[];
  responsable: string | null;
  /** Días sin gestión; null = nunca se ha gestionado. */
  diasSinGestion: number | null;
  compromiso: string | null;
  limite: string | null;
  estado: { nom: string; sev: Sev };
}

/** Totales de las tarjetas superiores. */
export interface IWalletSummary {
  segments: WalletSegments;
  clientes: number;
}

export interface SortState {
  col: string;
  dir: "asc" | "desc";
}
