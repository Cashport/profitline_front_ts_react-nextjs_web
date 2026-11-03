import dayjs from "dayjs";

import { getTranslator } from "@/i18n/translator";
import type { IBlockingAlertRow } from "@/types/blockingAlerts/IBlockingAlerts";

/** "Bloqueado hace 3 días", "Se bloquea mañana", "Al día · saldo a favor". */
export const statusLabel = (row: IBlockingAlertRow): string => {
  const t = getTranslator("blockingAlerts");
  if (row.status === "blocked") return t("statusLabel.blockedFor", { days: row.blocked_days ?? 0 });
  if (row.status === "warning") {
    if (row.days_to_block === 0) return t("statusLabel.blocksToday");
    if (row.days_to_block === 1) return t("statusLabel.blocksTomorrow");
    return t("statusLabel.blocksIn", { days: row.days_to_block ?? 0 });
  }
  return row.past_due < 0 ? t("statusLabel.okCredit") : t("statusLabel.ok");
};

const STATUS_RANK = { blocked: 0, warning: 1, ok: 2 };

/** Bloqueados primero, luego los más cercanos al bloqueo y, a igual estado, el mayor vencido. */
export const byUrgency = (a: IBlockingAlertRow, b: IBlockingAlertRow) =>
  STATUS_RANK[a.status] - STATUS_RANK[b.status] ||
  (a.status === "warning" ? (a.days_to_block ?? 0) - (b.days_to_block ?? 0) : 0) ||
  b.past_due - a.past_due;

/** "24/09/2026 · 08:00" */
export const fmtCutoff = (iso: string) => dayjs(iso).format("DD/MM/YYYY · HH:mm");

/** "18 sep" o, con año, "18 sep 2026" (meses en el idioma activo). */
export const fmtDay = (iso: string, withYear = false) =>
  dayjs(iso)
    .format(withYear ? "D MMM YYYY" : "D MMM")
    .replace(".", "");

/** Link de pago de ejemplo hasta que exista el servicio. */
export const paymentLinkOf = (row: IBlockingAlertRow) =>
  `pagos.cashport.co/${row.client_id}${row.ship_to_code ? `-${row.ship_to_code}` : ""}`;
