import {
  MonitoringAlertType,
  MonitoringPeriodicity,
  MonitoringSeverity
} from "../../types/monitoring";

const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const MONTHS_LONG = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre"
];

export const formatNumber = (value: number) => Math.round(value).toLocaleString("es-CO");

export const formatPct = (value: number | null, digits = 1) =>
  value === null
    ? "—"
    : `${value.toLocaleString("es-CO", { maximumFractionDigits: digits, minimumFractionDigits: digits })}%`;

export const formatVariation = (value: number) =>
  `${value > 0 ? "+" : "−"}${Math.round(Math.abs(value)).toLocaleString("es-CO")}%`;

export const formatShortDate = (iso: string | null) => {
  if (!iso) return "—";
  const [, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]}`;
};

export const formatMonthLabel = (month: string) => {
  const [y, m] = month.split("-").map(Number);
  return `${MONTHS_LONG[m - 1]} ${y}`;
};

export const recentMonths = (count: number, from = new Date()) =>
  Array.from({ length: count }, (_, i) => {
    const d = new Date(from.getFullYear(), from.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    return { value, label: formatMonthLabel(value) };
  });

export const plural = (n: number, one: string, many: string) => (n === 1 ? one : many);

export const STATE_COLORS = {
  received: "#cbe71e",
  novelty: "#2b4a5f",
  pending: "#ff6a13"
} as const;

export const ALERT_META: Record<
  MonitoringAlertType,
  { label: string; color: string; hint: string }
> = {
  no_email: {
    label: "Sin correo",
    color: "#ff6a13",
    hint: "El archivo no ha llegado al buzón. Confirma con el cliente que lo envíe."
  },
  password: {
    label: "Contraseña",
    color: "#e0007a",
    hint: "No podemos ingresar al portal del cliente. Actualiza el acceso para reanudar la descarga."
  },
  format: {
    label: "Formato",
    color: "#2b4a5f",
    hint: "El archivo llegó con una estructura distinta. Valida el nuevo formato con el cliente."
  },
  automation: {
    label: "En gestión",
    color: "#1677ff",
    hint: "La descarga automática falló por una causa técnica. Nuestro equipo ya la está gestionando."
  },
  missing: {
    label: "Sin recibir",
    color: "#8a8a8a",
    hint: "Aún no hemos recibido el archivo por el canal acordado."
  }
};

export const ALERT_ORDER: MonitoringAlertType[] = [
  "no_email",
  "password",
  "format",
  "automation",
  "missing"
];

export const SEVERITY_META: Record<MonitoringSeverity, { label: string; color: string }> = {
  critical: { label: "Crítico", color: "#e0007a" },
  late: { label: "Retrasado", color: "#ff6a13" },
  novelty: { label: "Con novedad", color: "#2b4a5f" },
  received: { label: "Recibido", color: "#9bb514" }
};

export const PERIODICITY_LABEL: Record<MonitoringPeriodicity, string> = {
  Daily: "Diario",
  Weekly: "Semanal",
  Monthly: "Mensual"
};
