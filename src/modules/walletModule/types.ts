import type { IWalletMatrixFilters } from "@/types/portfolios/IWalletMatrix";

/**
 * Estado de un documento dentro de la cartera, de los que tienen color propio.
 *
 * Los cinco primeros son los del diseño original. Los siguientes se agregaron
 * al conectar el API: la cartera real trae saldos, saldos de factura, glosas y
 * devoluciones. `otros` sigue definido, pero un estado del catálogo sin color
 * propio ya no cae ahí: se pinta aparte, como EstadoNuevo.
 */
export type EstadoKey =
  | "compensada"
  | "pagada"
  | "conciliado"
  | "abono"
  | "novedad"
  | "sin_conciliar"
  | "saldo"
  | "saldo_factura"
  | "glosado"
  | "devolucion"
  | "otros";

/**
 * Estado que el API mandó y el front aún no conoce: su statusKey con prefijo,
 * para que no choque con los conocidos. Se pinta con un color de respaldo y su
 * nombre sale del statusKey (ver utils/estados).
 */
export type EstadoNuevo = `nuevo:${string}`;

/** Cualquier estado que se puede pintar o elegir: uno conocido o uno nuevo. */
export type EstadoId = EstadoKey | EstadoNuevo;

/**
 * Montos por estado. Los conocidos están siempre, en cero si no hay; los
 * nuevos, sólo si llegaron. Sin ellos la barra apilada de una celda no sumaría
 * el total de esa celda, que es justo lo que no puede pasar en este reporte.
 */
export type MontosPorEstado = Record<EstadoKey, number> & {
  [e: EstadoNuevo]: number | undefined;
};

/** Severidad visual compartida por chips y estados de novedad. */
export type Sev = "ok" | "warn" | "crit" | "idle";

/** Índice de tramo de vencimiento: 0 = corriente … 5 = +120 días. */
export type TramoIndex = 0 | 1 | 2 | 3 | 4 | 5;

/** Columna que se puede elegir en la matriz: un tramo o "vencido" (1–30 a +120 juntos). */
export type MatrixColumn = TramoIndex | "vencido";

/** Montos por estado + totales de un conjunto de facturas. */
export interface WalletSegments extends MontosPorEstado {
  total: number;
  vencido: number;
  n: number;
}

/** Una celda de la matriz: el cruce cliente × tramo. */
export interface IWalletMatrixCell extends MontosPorEstado {
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
  /** Celda "vencido" del API: todos los tramos menos corriente. */
  vencido: IWalletMatrixCell;
}

/** Fila de "Grupos de facturas". */
export interface IWalletGroupRow {
  clave: string;
  /** Enlaza el grupo con IWalletClientRow.id: por aquí filtra el drilldown. */
  clienteId: string;
  tipo: EstadoId;
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

/** Totales del portafolio, las tarjetas ya leen el `summary` del API. */
export interface IWalletSummary {
  segments: WalletSegments;
  clientes: number;
}

export interface SortState {
  col: string;
  dir: "asc" | "desc";
}

/**
 * Lo que posee el modal de filtros; la vista lo mezcla con búsqueda y proyección.
 *
 * `estados` lo comparten el modal y los chips de la matriz. Son estados de la
 * pantalla y no statusKey: los de "Otros" salen del catálogo, así que la vista
 * los traduce a los `statuses` del API al armar la consulta.
 */
export type IWalletMatrixModalFilters = Required<
  Pick<
    IWalletMatrixFilters,
    "noveltyType" | "coordinator" | "market" | "kam" | "kam_lider" | "executive"
  >
> & { estados: EstadoId[] };

/** Selección activa de la matriz. `tramo: null` = todos los tramos del cliente. */
export interface IWalletDrilldown {
  clienteId: string;
  tramo: MatrixColumn | null;
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

export type WalletDocumentType = "FINANCIAL_RECORD" | "BALANCE";

/**
 * Un documento (factura o saldo) de un grupo, tal como lo manda
 * /portfolio/matrix/detail. Es cartera viva: la foto no trae documentos cerrados.
 */
export interface IWalletDocument {
  id: string;
  /** `document_id` crudo: es el que reciben los endpoints de novedades. */
  documentId: number;
  /** Número del ERP o, si no hay, el id interno. */
  doc: string;
  tipo: WalletDocumentType;
  fechaDoc: Date | null;
  /** statusLabel del API (Conciliado, Sin conciliar…), tal cual. */
  estado: string;
  saldoInicial: number;
  saldo: number;
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
  tipo: EstadoId;
  /**
   * statusKey crudo del API (CONCILIADO, SIN_CONCILIAR, SALDO_FACTURA…). `tipo`
   * lo agrupa y pierde el valor exacto, que es el que pide /portfolio/matrix/detail.
   */
  statusKey?: string;
  /**
   * Tipo de saldo del grupo (null = "Sin clasificar"). Solo en grupos de saldos;
   * acota /portfolio/matrix/detail a los saldos de ese tipo.
   */
  balanceTypeId?: number | null;
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
  tramo?: MatrixColumn | null;
  /** Conteo real del grupo. */
  totalFacturas: number;
  diasSinGestion: number | null;
}
