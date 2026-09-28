import {
  EstadoKey,
  IWalletMatrixModalFilters,
  MatrixColumn,
  Sev,
  SortState,
  WalletDocumentType
} from "./types";

export const TRAMOS = [
  { i: 0, id: "corriente", label: "Corriente", short: "Corriente" },
  { i: 1, id: "t1", label: "1 – 30 días", short: "1–30" },
  { i: 2, id: "t2", label: "31 – 60 días", short: "31–60" },
  { i: 3, id: "t3", label: "61 – 90 días", short: "61–90" },
  { i: 4, id: "t4", label: "91 – 120 días", short: "91–120" },
  { i: 5, id: "t5", label: "Más de 120 días", short: "+120" }
] as const;

/** Columna "Vencido" de la matriz: no es un tramo, junta del 1–30 al +120. */
export const VENCIDO = { id: "vencido", label: "Vencido", short: "Vencido" } as const;

/** Rótulos de una columna elegible de la matriz, sea tramo o vencido. */
export const columnMeta = (col: MatrixColumn) => (col === "vencido" ? VENCIDO : TRAMOS[col]);

/** Orden en el que se pintan los segmentos de las barras y la leyenda. */
export const ORDEN_EST: EstadoKey[] = [
  "compensada",
  "pagada",
  "conciliado",
  "novedad",
  "sin_conciliar",
  "saldo",
  "saldo_factura",
  "glosado",
  "devolucion",
  "otros"
];

export interface EstadoMeta {
  nom: string;
  /** Clase Tailwind de fondo, ligada a los tokens .wallet-scope. */
  bg: string;
  chip: Sev;
  chipTxt: string;
  corta: string;
}

export const EST_META: Record<EstadoKey, EstadoMeta> = {
  compensada: {
    nom: "Compensada",
    bg: "bg-wallet-comp",
    chip: "ok",
    chipTxt: "Por depurar",
    corta: "Cruce aplicado, sale al depurar"
  },
  pagada: {
    nom: "Pagada sin depurar",
    bg: "bg-wallet-pag",
    chip: "ok",
    chipTxt: "Pagada",
    corta: "Pagada, pendiente de depurar en SAP"
  },
  conciliado: {
    nom: "Conciliado",
    bg: "bg-wallet-conc",
    chip: "idle",
    chipTxt: "Esperando pago",
    corta: "Esperando pago del cliente"
  },
  novedad: {
    nom: "Con novedad",
    bg: "bg-wallet-nov",
    chip: "warn",
    chipTxt: "En gestión",
    corta: "Novedad abierta en gestión"
  },
  sin_conciliar: {
    nom: "Sin conciliar",
    bg: "bg-wallet-risk",
    chip: "crit",
    chipTxt: "Sin gestión",
    corta: "Sin acuerdo ni novedad"
  },
  saldo: {
    nom: "Saldo",
    bg: "bg-wallet-saldo",
    chip: "idle",
    chipTxt: "Saldo",
    corta: "Saldo a favor pendiente de cruce"
  },
  saldo_factura: {
    nom: "Saldo de factura",
    bg: "bg-wallet-saldo-fact",
    chip: "idle",
    chipTxt: "Saldo de factura",
    corta: "Saldo pendiente de la factura"
  },
  glosado: {
    nom: "Glosado",
    bg: "bg-wallet-glosa",
    chip: "warn",
    chipTxt: "Glosado",
    corta: "Factura glosada por el cliente"
  },
  devolucion: {
    nom: "Devolución",
    bg: "bg-wallet-devol",
    chip: "warn",
    chipTxt: "Devolución",
    corta: "Documento de devolución"
  },
  otros: {
    nom: "Otros",
    bg: "bg-wallet-otros",
    chip: "idle",
    chipTxt: "Otros",
    corta: "Otros estados del catálogo"
  }
};

/**
 * Fondos de respaldo para los estados que el API mande y el front aún no
 * conozca. Van como clases completas para que Tailwind las genere; cada estado
 * nuevo toma una según su statusKey (ver utils/estados).
 */
export const FALLBACK_BG = [
  "bg-wallet-nuevo-1",
  "bg-wallet-nuevo-2",
  "bg-wallet-nuevo-3",
  "bg-wallet-nuevo-4"
];

/** Etiqueta de cada tipo de documento de una novedad. */
export const DOCUMENT_TYPE_LABEL: Record<WalletDocumentType, string> = {
  FINANCIAL_RECORD: "Factura",
  BALANCE: "Saldo"
};

/** Fondo de cada tramo, para la barra de reparto. */
export const TRAMO_BG = [
  "bg-wallet-t0",
  "bg-wallet-t1",
  "bg-wallet-t2",
  "bg-wallet-t3",
  "bg-wallet-t4",
  "bg-wallet-t5"
];

/** Texto que se muestra mientras aún no llegó el corte real del snapshot. */
export const FECHA_CORTE_PLACEHOLDER = "Cargando corte…";

/**
 * Corte fijo de los datos simulados. La cartera ya lo toma del snapshot del
 * API; esto lo siguen usando Torre de control y Novedades, que aún son
 * mocks, y va emparejado con HOY en utils/format.
 */
export const FECHA_CORTE = "Corte 31/08/2026 · 06:40";

/** Días de mora representativos de cada tramo, para derivar vencimientos. */
export const TRAMO_DIAS = [-10, 15, 45, 75, 105, 150];

/** Categorías de ticket. En producción vienen de un endpoint de configuración. */
export const CATEGORIAS = [
  { value: "llamada", label: "Llamada al cliente" },
  { value: "correo", label: "Correo o seguimiento escrito" },
  { value: "visita", label: "Visita o reunión" },
  { value: "radicacion", label: "Radicación o reradicación" },
  { value: "backoffice", label: "Solicitud a Back Office" },
  { value: "aprobacion", label: "Aprobación comercial o RGM" },
  { value: "nc", label: "Nota crédito" },
  { value: "conciliacion", label: "Conciliación de saldos" },
  { value: "aplicacion", label: "Aplicación o cruce en SAP" },
  { value: "acuerdo", label: "Acuerdo de pago" },
  { value: "escalamiento", label: "Escalamiento interno" },
  { value: "soporte", label: "Documentación y soportes" },
  { value: "logistica", label: "Reclamación a logística" }
];

export const EMPTY_MATRIX_MODAL_FILTERS: IWalletMatrixModalFilters = {
  estados: [],
  noveltyType: [],
  coordinator: [],
  market: [],
  kam: [],
  kam_lider: [],
  executive: []
};

/** Orden inicial de la matriz; `col` es el `sort_by` del API. */
export const MATRIX_DEFAULT_SORT: SortState = { col: "total", dir: "desc" };
