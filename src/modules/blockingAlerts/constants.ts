import { Check, Lock, TriangleAlert, type LucideIcon } from "lucide-react";

import type {
  BlockingAlertStatus,
  IBlockingAlertAging,
  IBlockingAlertsSummary
} from "@/types/blockingAlerts/IBlockingAlerts";

export const BLOCKING_ALERTS_PATH = "/blockingAlerts";

export const PAGE_SIZE = 30;

export const blockingRulesNote = ({ blockDays, warningDays }: IBlockingAlertsSummary["rules"]) =>
  `Bloqueo: facturas de +${blockDays} días o cupo superado · Alerta desde ${warningDays} días`;

/** Semáforo por estado (docs/DESIGN.md §1). Al día no se pinta: su texto va en gris. */
export const STATUS_META: Record<
  BlockingAlertStatus,
  { tab: string; color: string; tint: string; Icon: LucideIcon }
> = {
  blocked: {
    tab: "Bloqueados",
    color: "rgb(var(--cp-red))",
    tint: "rgb(var(--cp-red) / 0.12)",
    Icon: Lock
  },
  to_be_blocked: {
    tab: "Por bloquear",
    color: "rgb(var(--cp-orange))",
    tint: "rgb(var(--cp-orange) / 0.14)",
    Icon: TriangleAlert
  },
  up_to_date: {
    tab: "Al día",
    color: "rgb(var(--cp-lime-dark))",
    tint: "rgb(var(--cp-lime) / 0.22)",
    Icon: Check
  }
};

/** Tramos de la cartera, por el campo del API (escala de mora de docs/DESIGN.md §1). */
export const AGING_SEGMENTS: {
  key: keyof Pick<IBlockingAlertAging, "current" | "pastDue1To60" | "pastDueOver60">;
  label: string;
  color: string;
}[] = [
  { key: "current", label: "Al día", color: "rgb(var(--cp-lime))" },
  { key: "pastDue1To60", label: "Vencida 1–60 días", color: "rgb(var(--cp-orange))" },
  { key: "pastDueOver60", label: "Vencida +60 días", color: "rgb(var(--cp-red))" }
];

export type AlertsSort =
  | "urgency"
  | "past_due_desc"
  | "past_due_asc"
  | "oldest_overdue_days"
  | "name";

/** Opciones del menú Ordenar con el `sort_by` / `sort_dir` que entiende el API. */
export const SORT_OPTIONS: {
  key: AlertsSort;
  label: string;
  sortBy: "urgency" | "pastDue" | "oldestOverdueDays" | "name";
  sortDir?: "asc" | "desc";
}[] = [
  { key: "urgency", label: "Más urgente primero", sortBy: "urgency" },
  { key: "past_due_desc", label: "Mayor pago vencido", sortBy: "pastDue", sortDir: "desc" },
  { key: "past_due_asc", label: "Menor pago vencido", sortBy: "pastDue", sortDir: "asc" },
  {
    key: "oldest_overdue_days",
    label: "Más días de mora",
    sortBy: "oldestOverdueDays",
    sortDir: "desc"
  },
  { key: "name", label: "Nombre A–Z", sortBy: "name", sortDir: "asc" }
];

/** Punto de cada tipo de nota crédito; un tipo nuevo sale en gris. */
export const CREDIT_NOTE_COLORS: Record<string, string> = {
  "Devolución producto": "rgb(var(--cp-blue))",
  "Negociaciones comerciales": "rgb(var(--cp-lime))",
  Averías: "#f5b700"
};

/** Botón secundario del header, del alto de los controles (docs/DESIGN.md §4 y §8). */
export const HEADER_BUTTON =
  "box-border flex h-[var(--control-h)] shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-[11px] border border-cp-line-2 bg-cp-surface px-3.5 text-[15px] font-medium text-cp-ink hover:border-cp-ink";

/** UiTab en móvil (prototipo): pestañas más pequeñas y juntas, que se deslizan en vez del "⋯". */
export const MOBILE_TABS =
  "max-md:[&_.ant-tabs-tab-btn]:!text-[12.5px] max-md:[&_.ant-tabs-tab+.ant-tabs-tab]:!ml-4 max-md:[&_.ant-tabs-nav-operations]:!hidden max-md:[&_.ant-tabs-tab:not(.ant-tabs-tab-active)_.ant-tabs-tab-btn]:!text-cp-ink-3";
