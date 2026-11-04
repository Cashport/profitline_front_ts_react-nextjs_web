import { getTranslator } from "@/i18n/translator";
import {
  EstadoKey,
  IWalletMatrixModalFilters,
  MatrixColumn,
  Sev,
  SortState,
  WalletDocumentType
} from "./types";

/** Rótulos traducidos de un tramo o de la columna "Vencido"; se leen al usarse. */
const tramo = <I extends number, Id extends string>(
  i: I,
  id: Id,
  key: "current" | "d1_30" | "d31_60" | "d61_90" | "d91_120" | "over120"
) => ({
  i,
  id,
  get label(): string {
    return getTranslator("wallet")(`buckets.${key}.label`);
  },
  get short(): string {
    return getTranslator("wallet")(`buckets.${key}.short`);
  }
});

export const TRAMOS = [
  tramo(0, "corriente", "current"),
  tramo(1, "t1", "d1_30"),
  tramo(2, "t2", "d31_60"),
  tramo(3, "t3", "d61_90"),
  tramo(4, "t4", "d91_120"),
  tramo(5, "t5", "over120")
] as const;

/** Columna "Vencido" de la matriz: no es un tramo, junta del 1–30 al +120. */
export const VENCIDO = {
  id: "vencido",
  get label(): string {
    return getTranslator("wallet")("buckets.pastDue.label");
  },
  get short(): string {
    return getTranslator("wallet")("buckets.pastDue.short");
  }
} as const;

/** Rótulos de una columna elegible de la matriz, sea tramo o vencido. */
export const columnMeta = (col: MatrixColumn) => (col === "vencido" ? VENCIDO : TRAMOS[col]);

/** Orden en el que se pintan los segmentos de las barras y la leyenda. */
export const ORDEN_EST: EstadoKey[] = [
  "compensada",
  "pagada",
  "conciliado",
  "abono",
  "novedad",
  "sin_conciliar",
  "nota_debito",
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

/** Nombre, chip y descripción corta salen del catálogo `wallet.estados` al leerse. */
const estado = (key: EstadoKey, bg: string, chip: Sev): EstadoMeta => ({
  bg,
  chip,
  get nom(): string {
    return getTranslator("wallet")(`estados.${key}.name`);
  },
  get chipTxt(): string {
    return getTranslator("wallet")(`estados.${key}.chip`);
  },
  get corta(): string {
    return getTranslator("wallet")(`estados.${key}.short`);
  }
});

export const EST_META: Record<EstadoKey, EstadoMeta> = {
  compensada: estado("compensada", "bg-wallet-comp", "ok"),
  pagada: estado("pagada", "bg-wallet-pag", "ok"),
  conciliado: estado("conciliado", "bg-wallet-conc", "idle"),
  abono: estado("abono", "bg-wallet-conc", "idle"),
  novedad: estado("novedad", "bg-wallet-nov", "warn"),
  sin_conciliar: estado("sin_conciliar", "bg-wallet-risk", "crit"),
  saldo: estado("saldo", "bg-wallet-saldo", "idle"),
  saldo_factura: estado("saldo_factura", "bg-wallet-saldo-fact", "idle"),
  glosado: estado("glosado", "bg-wallet-glosa", "warn"),
  devolucion: estado("devolucion", "bg-wallet-devol", "warn"),
  /* Documento de cartera propio del proyecto 166 (Gilead): suma como una
     factura sin conciliar, pero se distingue con nombre propio. */
  nota_debito: estado("nota_debito", "bg-wallet-risk", "crit"),
  otros: estado("otros", "bg-wallet-otros", "idle")
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

/** Etiqueta de cada tipo de documento de una novedad (se traduce al leerse). */
export const DOCUMENT_TYPE_LABEL: Record<WalletDocumentType, string> = {
  get FINANCIAL_RECORD() {
    return getTranslator("wallet")("documentType.FINANCIAL_RECORD");
  },
  get BALANCE() {
    return getTranslator("wallet")("documentType.BALANCE");
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
