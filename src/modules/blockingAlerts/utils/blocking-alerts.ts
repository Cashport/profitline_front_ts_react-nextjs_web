import dayjs from "dayjs";
import "dayjs/locale/es";

import type { IBlockingAlertRow } from "@/types/blockingAlerts/IBlockingAlerts";

/** "1 día", "3 días". */
export const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** "Bloqueado hace 3 días", "Se bloquea mañana", "Al día · saldo a favor". */
export const statusLabel = (row: IBlockingAlertRow): string => {
  if (row.status === "blocked")
    return `Bloqueado hace ${plural(row.blocked_days ?? 0, "día", "días")}`;
  if (row.status === "warning") {
    if (row.days_to_block === 0) return "Se bloquea hoy";
    if (row.days_to_block === 1) return "Se bloquea mañana";
    return `Se bloquea en ${row.days_to_block} días`;
  }
  return row.past_due < 0 ? "Al día · saldo a favor" : "Al día";
};

const STATUS_RANK = { blocked: 0, warning: 1, ok: 2 };

/** Bloqueados primero, luego los más cercanos al bloqueo y, a igual estado, el mayor vencido. */
export const byUrgency = (a: IBlockingAlertRow, b: IBlockingAlertRow) =>
  STATUS_RANK[a.status] - STATUS_RANK[b.status] ||
  (a.status === "warning" ? (a.days_to_block ?? 0) - (b.days_to_block ?? 0) : 0) ||
  b.past_due - a.past_due;

/** "24/09/2026 · 08:00" */
export const fmtCutoff = (iso: string) => dayjs(iso).format("DD/MM/YYYY · HH:mm");

/** "18 sep" o, con año, "18 sep 2026". */
export const fmtDay = (iso: string, withYear = false) =>
  dayjs(iso)
    .locale("es")
    .format(withYear ? "D MMM YYYY" : "D MMM")
    .replace(".", "");

/** Link de pago de ejemplo hasta que exista el servicio. */
export const paymentLinkOf = (row: IBlockingAlertRow) =>
  `pagos.cashport.co/${row.client_id}${row.ship_to_code ? `-${row.ship_to_code}` : ""}`;
