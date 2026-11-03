import { getTranslator } from "@/i18n/translator";
import type { Sev } from "@/modules/walletModule/types";
import type { IIncidentListKpis, IncidentCard } from "@/types/novelties/INovelties";
import type { INoveltiesFilters, NoveltyTipoKey } from "./types";

interface TipoMeta {
  id: NoveltyTipoKey;
  nom: string;
  /** Días de SLA del tipo, para el compromiso por defecto. */
  sla: number;
  /** Área que resuelve; null = queda con el ejecutivo. */
  area: string | null;
}

/** El nombre sale del catálogo `novelties.types` al leerse, en el idioma activo. */
const tipo = (id: NoveltyTipoKey, sla: number, area: string | null): TipoMeta => ({
  id,
  sla,
  area,
  get nom(): string {
    return getTranslator("novelties")(`types.${id}`);
  }
});

export const NOVELTY_TIPOS: TipoMeta[] = [
  tipo("nc_comercial", 5, "comercial"),
  tipo("nc_precio", 7, "rgm"),
  tipo("refact", 10, "backoffice"),
  tipo("rechazo", 3, "backoffice"),
  tipo("cruce", 2, "backoffice"),
  tipo("acuerdo", 1, null),
  tipo("pago_ni", 2, "backoffice"),
  tipo("faltante", 8, "logistica")
];

interface CardMeta {
  id: IncidentCard;
  label: string;
  /** Segunda línea del pie, tras el conteo. */
  pie: string;
  /** Punto de color; "Abiertas" no lleva. */
  sev?: Extract<Sev, "warn" | "crit">;
}

/** Rótulo y pie salen del catálogo `novelties.kpis` al leerse. */
const card = (id: IncidentCard, sev?: CardMeta["sev"]): CardMeta => ({
  id,
  sev,
  get label(): string {
    return getTranslator("novelties")(`kpis.${id}.label`);
  },
  get pie(): string {
    return getTranslator("novelties")(`kpis.${id}.foot`);
  }
});

export const KPI_CARDS: CardMeta[] = [
  card("abiertas"),
  card("vencidas", "crit"),
  card("frias", "warn"),
  card("limite", "crit"),
  card("sinresp", "crit")
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

export const EMPTY_NOVELTIES_FILTERS: INoveltiesFilters = {
  novelty_status_id: null,
  motive_id: null,
  coordinator: null,
  kam: null,
  market: null,
  executive_id: null,
  date_from: null,
  date_to: null
};

/** "Fusionada" nunca aparece como tarjeta, así que tampoco se ofrece como filtro. */
export const NOVELTY_STATUS_FUSIONADA_ID = 14;
