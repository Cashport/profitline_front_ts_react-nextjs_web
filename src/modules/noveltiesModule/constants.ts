import type { Sev } from "@/modules/walletModule/types";
import type { IIncidentListKpis, IncidentCard } from "@/types/novelties/INovelties";
import type { NoveltyTipoKey } from "./types";

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

interface CardMeta {
  id: IncidentCard;
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

/** Qué campos del endpoint de KPIs alimentan cada tarjeta. */
export const KPI_FIELDS: Record<
  IncidentCard,
  { count: keyof IIncidentListKpis; amount: keyof IIncidentListKpis }
> = {
  abiertas: { count: "open_count", amount: "open_amount" },
  vencidas: { count: "overdue_ticket_count", amount: "overdue_ticket_amount" },
  frias: { count: "no_management_7d_count", amount: "no_management_7d_amount" },
  limite: { count: "past_limit_date_count", amount: "past_limit_date_amount" },
  sinresp: { count: "unassigned_count", amount: "unassigned_amount" }
};
