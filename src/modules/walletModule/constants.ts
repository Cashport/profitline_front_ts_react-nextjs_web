import { EstadoKey, IWalletMatrixModalFilters, Sev, SortState } from "./types";

export const TRAMOS = [
  { i: 0, id: "corriente", label: "Corriente", short: "Corriente" },
  { i: 1, id: "t1", label: "1 – 30 días", short: "1–30" },
  { i: 2, id: "t2", label: "31 – 60 días", short: "31–60" },
  { i: 3, id: "t3", label: "61 – 90 días", short: "61–90" },
  { i: 4, id: "t4", label: "91 – 120 días", short: "91–120" },
  { i: 5, id: "t5", label: "Más de 120 días", short: "+120" }
] as const;

/** Orden en el que se pintan los segmentos de las barras y la leyenda. */
export const ORDEN_EST: EstadoKey[] = [
  "compensada",
  "pagada",
  "conciliado",
  "novedad",
  "sin_conciliar",
  "saldo",
  "glosado",
  "devolucion",
  "otros"
];

interface EstadoMeta {
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
  status: [],
  noveltyType: [],
  coordinator: null,
  market: null,
  zones: [],
  lines: [],
  sublines: [],
  channels: [],
  holdings: [],
  clientGroup: []
};

/** Orden inicial de la matriz; `col` es el `sort_by` del API. */
export const MATRIX_DEFAULT_SORT: SortState = { col: "total", dir: "desc" };

/**
 * statusKey de factura que acepta el filtro `status` de la matriz. No hay
 * endpoint de catálogo: son las claves que el API manda en cada celda.
 */
export const MATRIX_STATUS_OPTIONS: { id: string; name: string }[] = [
  { id: "CONCILIADO", name: "Conciliado" },
  { id: "CON_NOVEDAD", name: "Con novedad" },
  { id: "SIN_CONCILIAR", name: "Sin conciliar" },
  { id: "SALDO", name: "Saldo" },
  { id: "SALDO_FACTURA", name: "Saldo de factura" },
  { id: "GLOSADO", name: "Glosado" },
  { id: "DEVOLUCION", name: "Devolución" },
  { id: "VENCIDA", name: "Vencida" },
  { id: "CORRIENTE", name: "Corriente" },
  { id: "PAGADA", name: "Pagada" }
];
