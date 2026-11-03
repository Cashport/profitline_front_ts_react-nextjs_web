import dayjs from "dayjs";
import "dayjs/locale/es";

import type { IBlockingAlertsDetail } from "@/types/blockingAlerts/IBlockingAlerts";

/** "1 día", "3 días". */
export const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** "24/09/2026 · 08:00" */
export const fmtCutoff = (iso: string) => dayjs(iso).format("DD/MM/YYYY · HH:mm");

/** "18 sep" o, con año, "18 sep 2026". */
export const fmtDay = (iso: string, withYear = false) =>
  dayjs(iso)
    .locale("es")
    .format(withYear ? "D MMM YYYY" : "D MMM")
    .replace(".", "");

/** Link de pago de ejemplo hasta que exista el servicio (subtarea 07). */
export const paymentLinkOf = (detail: IBlockingAlertsDetail) =>
  `pagos.cashport.co/${detail.client.clientId}${detail.pointOfSale?.code ? `-${detail.pointOfSale.code}` : ""}`;
