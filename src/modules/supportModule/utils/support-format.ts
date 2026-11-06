import type {
  ISupportSla,
  ISupportTicket,
  SupportCriticality,
  SupportStatus
} from "@/types/support/ISupport";

export const CRITICALITY_META: Record<SupportCriticality, { label: string; color: string }> = {
  CRITICAL: { label: "Crítica", color: "#e5262b" },
  HIGH: { label: "Alta", color: "#ff6a13" },
  MEDIUM: { label: "Media", color: "#1677ff" },
  LOW: { label: "Baja", color: "#6b6b6b" }
};

export const CRITICALITY_ORDER: SupportCriticality[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];

export const STATUS_META: Record<SupportStatus, { label: string; color: string }> = {
  NEW: { label: "Sin atender", color: "#ff6a13" },
  IN_PROGRESS: { label: "En progreso", color: "#1677ff" },
  WAITING_CLIENT: { label: "Esperando tu respuesta", color: "#e0007a" },
  RESOLVED: { label: "Resuelto", color: "#9bb514" },
  CLOSED: { label: "Cerrado", color: "#8a8a8a" },
  CANCELLED: { label: "Cancelado", color: "#8a8a8a" }
};

/** Para soporte, "Esperando tu respuesta" se lee como "Esperando al usuario". */
export const statusLabel = (status: SupportStatus, asAgent: boolean) =>
  asAgent && status === "WAITING_CLIENT" ? "Esperando al usuario" : STATUS_META[status].label;

export const STATUS_ORDER: SupportStatus[] = [
  "NEW",
  "IN_PROGRESS",
  "WAITING_CLIENT",
  "RESOLVED",
  "CLOSED",
  "CANCELLED"
];

export const isFinal = (s: SupportStatus) => s === "CLOSED" || s === "CANCELLED";

export function formatDuration(minutes: number | null | undefined): string {
  if (minutes == null) return "—";
  const m = Math.abs(minutes);
  if (m < 60) return `${Math.round(m)} min`;
  const h = m / 60;
  if (h < 48) return `${(Math.round(h * 10) / 10).toString().replace(".", ",")} h`;
  return `${(Math.round((h / 24) * 10) / 10).toString().replace(".", ",")} d`;
}

export const formatSla = (attention: number | null, resolution: number | null) =>
  resolution == null
    ? "—"
    : attention != null
      ? `${formatDuration(attention)} / ${formatDuration(resolution)}`
      : formatDuration(resolution);

const pad = (n: number) => String(n).padStart(2, "0");

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export interface SlaBadge {
  text: string;
  color: string;
  tone: "ok" | "warn" | "bad" | "muted";
}

/** Semáforo del ANS de solución (el de atención se marca aparte cuando se incumple). */
export function slaBadge(t: Pick<ISupportTicket, "status" | "sla">): SlaBadge {
  const s: ISupportSla = t.sla;
  if (t.status === "CANCELLED") return { text: "—", color: "#8a8a8a", tone: "muted" };
  if (t.status === "RESOLVED" || t.status === "CLOSED") {
    return s.resolution_breached || s.attention_breached
      ? { text: "Incumplido", color: "#e5262b", tone: "bad" }
      : { text: "Cumplido", color: "#9bb514", tone: "ok" };
  }
  if (s.paused) return { text: "En pausa", color: "#6b6b6b", tone: "muted" };
  if (s.resolution_left_min < 0 || s.resolution_breached) {
    return {
      text: `Vencido hace ${formatDuration(-s.resolution_left_min)}`,
      color: "#e5262b",
      tone: "bad"
    };
  }
  const soon = s.resolution_left_min < Math.max(s.resolution_min * 0.25, 60);
  return {
    text: `Vence en ${formatDuration(s.resolution_left_min)}`,
    color: soon ? "#ff6a13" : "inherit",
    tone: soon ? "warn" : "ok"
  };
}

export const formatBytes = (n: number | null) =>
  n == null
    ? ""
    : n < 1048576
      ? `${Math.max(1, Math.round(n / 1024))} KB`
      : `${(n / 1048576).toFixed(1).replace(".", ",")} MB`;

export const WEEKDAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
