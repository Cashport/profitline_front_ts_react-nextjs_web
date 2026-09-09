import type { Sev } from "@/modules/walletModule/types";
import type { NoveltyCardId, NoveltyEstadoKey, NoveltyTipoKey } from "./types";

interface TipoMeta {
  id: NoveltyTipoKey;
  nom: string;
  /** Días de SLA del tipo, para el compromiso por defecto. */
  sla: number;
  /** Área que resuelve; null = queda con el ejecutivo. */
  area: string | null;
}

export const NOVELTY_TIPOS: TipoMeta[] = [
  { id: "nc_comercial", nom: "Nota crédito comercial", sla: 5, area: "comercial" },
  { id: "nc_precio", nom: "NC diferencia de precio", sla: 7, area: "rgm" },
  { id: "refact", nom: "Refacturación", sla: 10, area: "backoffice" },
  { id: "rechazo", nom: "Factura rechazada / sin radicar", sla: 3, area: "backoffice" },
  { id: "cruce", nom: "Cruce de saldos / legalización", sla: 2, area: "backoffice" },
  { id: "acuerdo", nom: "Acuerdo de pago", sla: 1, area: null },
  { id: "pago_ni", nom: "Pago no identificado", sla: 2, area: "backoffice" },
  { id: "faltante", nom: "Faltante / avería en entrega", sla: 8, area: "logistica" }
];

export const TIPO_BY_ID = Object.fromEntries(NOVELTY_TIPOS.map((t) => [t.id, t])) as Record<
  NoveltyTipoKey,
  TipoMeta
>;

interface EstadoMeta {
  id: NoveltyEstadoKey;
  nom: string;
  sev: Sev;
}

/** Orden del catálogo: es también el orden de las columnas del tablero. */
export const NOVELTY_ESTADOS: EstadoMeta[] = [
  { id: "sin_asignar", nom: "Sin asignar", sev: "crit" },
  { id: "en_gestion", nom: "En gestión", sev: "idle" },
  { id: "esperando_aprob", nom: "Esperando aprobación", sev: "warn" },
  { id: "aprobada", nom: "Aprobada", sev: "ok" },
  { id: "cerrada", nom: "Cerrada", sev: "ok" }
];

export const ESTADO_BY_ID = Object.fromEntries(
  NOVELTY_ESTADOS.map((e) => [e.id, e])
) as Record<NoveltyEstadoKey, EstadoMeta>;

interface CardMeta {
  id: NoveltyCardId;
  label: string;
  /** Segunda línea del pie, tras el conteo. */
  pie: string;
  /** Punto de color; "Abiertas" no lleva. */
  sev?: Extract<Sev, "warn" | "crit">;
}

export const KPI_CARDS: CardMeta[] = [
  { id: "abiertas", label: "Abiertas", pie: "saldo agrupado en gestión" },
  {
    id: "vencidas",
    label: "Con ticket vencido",
    pie: "la acción en curso ya se pasó de fecha",
    sev: "crit"
  },
  {
    id: "frias",
    label: "Sin gestión +7 días",
    pie: "nadie ha registrado nada hace más de una semana",
    sev: "warn"
  },
  { id: "limite", label: "Fuera de fecha límite", pie: "el caso debió estar cerrado", sev: "crit" },
  { id: "sinresp", label: "Sin responsable", pie: "no tienen dueño asignado", sev: "crit" }
];

/** Filtros de la barra superior. Sin opciones todavía: la data llega con el API. */
export const NOVELTY_FILTERS = [
  { key: "coordinadores", label: "Todos los coordinadores" },
  { key: "responsables", label: "Todos los responsables" },
  { key: "tipos", label: "Todos los tipos" }
];
