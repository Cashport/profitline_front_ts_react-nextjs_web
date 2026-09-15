import type { KpiCardItem } from "@/components/ui/kpi-cards/kpi-cards";
import { HOY, diasEntre, fmtM } from "@/modules/walletModule/utils/format";
import type { Sev } from "@/modules/walletModule/types";
import type { IIncidentListItem, IIncidentListKpis } from "@/types/novelties/INovelties";
import { KPI_CARDS, KPI_FIELDS } from "../constants";

export const noveltyCode = (n: IIncidentListItem): string => `NOV-${n.incident_id}`;

/** Semáforo del compromiso, con el mismo texto que muestra la cabecera del modal. */
export function slaDe(n: IIncidentListItem): { sev: Sev; txt: string; d: number } {
  if (!n.is_open) return { sev: "ok", txt: "Cerrada", d: 0 };
  if (!n.next_ticket_date) return { sev: "idle", txt: "—", d: 0 };

  const d = diasEntre(HOY, new Date(n.next_ticket_date));
  if (d < 0) return { sev: "crit", txt: `Vencida ${Math.abs(d)}d`, d };
  if (d === 0) return { sev: "crit", txt: "Vence hoy", d };
  return { sev: d <= 2 ? "warn" : "ok", txt: `En ${d}d`, d };
}

/** Días sin gestión: verde ≤3, ámbar ≤7, rojo por encima. */
export const sevGestion = (d: number): Sev => (d <= 3 ? "ok" : d <= 7 ? "warn" : "crit");

/** Fecha límite: rojo si ya pasó, ámbar en los 5 días previos. Escala propia. */
export const sevLimite = (fecha: Date): Sev => {
  const d = diasEntre(HOY, fecha);
  return d < 0 ? "crit" : d <= 5 ? "warn" : "ok";
};

/** null = nunca se ha registrado nada. */
export const diasSinGestion = (n: IIncidentListItem): number | null =>
  n.last_management_at ? diasEntre(new Date(n.last_management_at), HOY) : null;

/** Las tarjetas con las cifras del API; en cero mientras no llegan. */
export const toKpiCards = (kpis: IIncidentListKpis | undefined): KpiCardItem[] =>
  KPI_CARDS.map((c) => {
    const f = KPI_FIELDS[c.id];
    return {
      ...c,
      valor: fmtM(kpis?.[f.amount] ?? 0),
      conteo: kpis?.[f.count] ?? 0
    };
  });
