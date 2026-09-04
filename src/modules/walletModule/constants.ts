import { EstadoKey, Sev } from "./types";

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
  "sin_conciliar"
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

/** Fecha de corte de la carga. En producción viene del backend. */
export const FECHA_CORTE = "Corte 31/08/2026 · 06:40";

/** Filtros de la barra superior. Sin opciones todavía: la data llega con el API. */
export const WALLET_FILTERS = [
  { key: "coordinadores", label: "Todos los coordinadores" },
  { key: "ejecutivos", label: "Todos los ejecutivos" },
  { key: "kam", label: "Todos los KAM" },
  { key: "tiposNovedad", label: "Todos los tipos de novedad" },
  { key: "estados", label: "Todos los estados" }
];
