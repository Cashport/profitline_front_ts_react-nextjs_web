import type { IWalletMatrixFilters } from "@/types/portfolios/IWalletMatrix";

/**
 * Estado de un documento dentro de la cartera.
 *
 * Los cinco primeros son los del diseño original. Los cuatro siguientes se
 * agregaron al conectar el API: la cartera real trae saldos, glosas y
 * devoluciones, y `otros` recoge cualquier estado del catálogo que no tenga
 * un color propio. Sin ellos la barra apilada de una celda no sumaría el
 * total de esa celda, que es justo lo que no puede pasar en este reporte.
 */
export type EstadoKey =
  | "compensada"
  | "pagada"
  | "conciliado"
  | "novedad"
  | "sin_conciliar"
  | "saldo"
  | "glosado"
  | "devolucion"
  | "otros";

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
  /** Documentos que componen la celda. */
  n: number;
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
  /** Enlaza el grupo con IWalletClientRow.id: por aquí filtra el drilldown. */
  clienteId: string;
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

/** Lo que posee el modal de filtros; la vista lo mezcla con búsqueda y proyección. */
export type IWalletMatrixModalFilters = Required<
  Pick<
    IWalletMatrixFilters,
    | "status"
    | "noveltyType"
    | "coordinator"
    | "market"
    | "zones"
    | "lines"
    | "sublines"
    | "channels"
    | "holdings"
    | "clientGroup"
  >
>;

/** Selección activa de la matriz. `tramo: null` = todos los tramos del cliente. */
export interface IWalletDrilldown {
  clienteId: string;
  tramo: TramoIndex | null;
}

/* ---------- Detalle de un grupo (modal de gestión) ---------- */

/** Ejecutivo, coordinador o área a la que se le asigna algo. */
export interface IWalletPerson {
  id: string;
  nombre: string;
  iniciales: string;
}

export interface IWalletAttachment {
  nombre: string;
  peso: string;
  /** Enlace al archivo ya subido; los adjuntos sin enviar no lo tienen. */
  url?: string;
}

/** Una factura dentro de un grupo. `dias` > 0 significa vencida. */
export interface IWalletInvoice {
  id: string;
  doc: string;
  vence: Date;
  dias: number;
  tramo: TramoIndex;
  saldo: number;
}

export type WalletDocumentType = "FINANCIAL_RECORD" | "BALANCE";
export type WalletDocumentInactiveReason = "PAID" | "MANUALLY_REMOVED" | "CANCELLED" | "OTHER";

/**
 * Un documento (factura o saldo) asociado a una novedad, tal como lo manda
 * /invoice/incident-detail. `activa: false` = ya salió de cartera pero se
 * conserva en el histórico ("Ver cerradas").
 */
export interface IWalletDocument {
  id: string;
  /** Número del ERP o, si no hay, el id interno. */
  doc: string;
  tipo: WalletDocumentType;
  saldoInicial: number;
  saldo: number;
  activa: boolean;
  inactivaMotivo: WalletDocumentInactiveReason | null;
  inactivaEl: Date | null;
}

/** Una acción (ticket) de la novedad, tal como la manda /invoice/incident/:id/actions. */
export interface IWalletTicket {
  /** Código visible ("TK-3"): es lo que muestran tarjetas, bitácora y la bandeja. */
  id: string;
  /** Id numérico de la acción en el API; es el que pide el endpoint de resolver. */
  actionId: number;
  titulo: string;
  comentario?: string;
  /** Etiqueta de la categoría, ya resuelta contra el catálogo. */
  categoria?: string;
  responsable: IWalletPerson;
  /** Null cuando la acción se creó sin fecha límite. */
  deadline: Date | null;
  estado: "abierto" | "resuelto";
  resueltoEl?: Date;
  comentarioResolucion?: string;
  adjuntos?: IWalletAttachment[];
}

export type TimelineKind = "comentario" | "adjunto" | "evento" | "ticket" | "ticket_ok";

/** Entrada de la bitácora del grupo. `autor` null = el sistema. */
export interface IWalletTimelineEntry {
  id: string;
  fecha: Date;
  autor: IWalletPerson | null;
  tipo: TimelineKind;
  texto: string;
  ticketId?: string;
  adjuntos?: IWalletAttachment[];
}

/** Datos de la novedad cuando el grupo es de tipo "novedad". */
export interface IWalletNovedad {
  id: string;
  /** Id numérico del incidente en el API (para /invoice/incident-detail). */
  incidentId?: number;
  /** Nombre del tipo de novedad, ya resuelto contra el catálogo. */
  tipoNom: string;
  /** `id` y `color` vienen del catálogo de estados de novedad; el color, si viene, reemplaza al semáforo. */
  estado: { id?: number; nom: string; sev: Sev; color?: string };
  /** Null cuando la novedad viene del API: /portfolio/matrix/groups no manda fechas. */
  compromiso: Date | null;
  limite: Date | null;
  responsable: IWalletPerson | null;
  cerrada: boolean;
}

/** Todo lo que necesita el modal de gestión de un grupo. */
export interface IWalletGroupDetail {
  clave: string;
  tipo: EstadoKey;
  novedad?: IWalletNovedad;
  cliente: { nombre: string; nit: string };
  ejecutivo: IWalletPerson;
  monto: number;
  tramos: number[];
  /**
   * Tramo del drilldown desde el que se abrió. Cuando no es null, `monto`,
   * `tramos` y `totalFacturas` vienen acotados a él —el API recorta el grupo
   * al pedirle un `aging`— y las etiquetas tienen que decirlo.
   */
  tramo?: TramoIndex | null;
  /** Conteo real, del grupo. `facturas` es una muestra y puede venir topada. */
  totalFacturas: number;
  /**
   * Documentos de la novedad (/invoice/incident-detail → `documents`). Vacío
   * en grupos sin novedad: la pestaña "Facturas" queda deshabilitada.
   */
  documentos: IWalletDocument[];
  /**
   * `bitacora` y `tickets` ya no los lee el modal: el seguimiento sale del
   * incidente (/invoice/incident-detail) y las acciones de
   * /invoice/incident/:id/actions. Se conservan porque la bandeja de tickets,
   * aún simulada, los construye.
   */
  bitacora: IWalletTimelineEntry[];
  tickets: IWalletTicket[];
  diasSinGestion: number | null;
}
