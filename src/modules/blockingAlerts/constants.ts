import { Check, Lock, TriangleAlert, type LucideIcon } from "lucide-react";

import type {
  BlockingAlertStatus,
  IBlockingAlertAging
} from "@/types/blockingAlerts/IBlockingAlerts";

export const BLOCKING_ALERTS_PATH = "/blockingAlerts";

export const PAGE_SIZE = 30;

export const BLOCKING_RULES =
  "Bloqueo: facturas de +60 días o cupo superado · Alerta desde 45 días";

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
  warning: {
    tab: "Por bloquear",
    color: "rgb(var(--cp-orange))",
    tint: "rgb(var(--cp-orange) / 0.14)",
    Icon: TriangleAlert
  },
  ok: {
    tab: "Al día",
    color: "rgb(var(--cp-lime-dark))",
    tint: "rgb(var(--cp-lime) / 0.22)",
    Icon: Check
  }
};

/** Tramos de la cartera, por el campo del API (escala de mora de docs/DESIGN.md §1). */
export const AGING_SEGMENTS: {
  key: keyof Pick<IBlockingAlertAging, "current" | "past_due_1_60" | "past_due_60_plus">;
  label: string;
  color: string;
}[] = [
  { key: "current", label: "Al día", color: "rgb(var(--cp-lime))" },
  { key: "past_due_1_60", label: "Vencida 1–60 días", color: "rgb(var(--cp-orange))" },
  { key: "past_due_60_plus", label: "Vencida +60 días", color: "rgb(var(--cp-red))" }
];

export type AlertsSort =
  | "urgency"
  | "past_due_desc"
  | "past_due_asc"
  | "oldest_overdue_days"
  | "name";

export const SORT_OPTIONS: { key: AlertsSort; label: string }[] = [
  { key: "urgency", label: "Más urgente primero" },
  { key: "past_due_desc", label: "Mayor pago vencido" },
  { key: "past_due_asc", label: "Menor pago vencido" },
  { key: "oldest_overdue_days", label: "Más días de mora" },
  { key: "name", label: "Nombre A–Z" }
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
