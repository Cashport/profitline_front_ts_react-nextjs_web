import dayjs, { type Dayjs } from "dayjs";

const pad = (n: number) => String(n).padStart(2, "0");

/** Fecha ISO (o Dayjs) → minutos desde medianoche en hora local, la unidad de la jornada. */
export const minutesOfDay = (value: string | Dayjs) => {
  const d = dayjs(value);
  return d.diff(d.startOf("day"), "minute", true);
};

/** "Felipe Angarita" → "FA"; tres letras como máximo. */
export const initialsOf = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 3)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

/** Minutos desde medianoche → "14:20". */
export const fmtClock = (minutes: number) => {
  const m = Math.round(minutes);
  return `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
};

/** Duración en minutos → "31 min" o "1h 05m". */
export const fmtDuration = (minutes: number) => {
  const m = Math.max(0, Math.round(minutes));
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)}h ${pad(m % 60)}m`;
};

const WEEKDAYS = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

/** "Hoy · mié 7 oct"; ayer y mañana llevan su prefijo, los demás días sólo la fecha. */
export const fmtDayLabel = (day: Dayjs, today: Dayjs) => {
  const offset = day.startOf("day").diff(today.startOf("day"), "day");
  const prefix =
    offset === 0 ? "Hoy · " : offset === -1 ? "Ayer · " : offset === 1 ? "Mañana · " : "";
  return `${prefix}${WEEKDAYS[day.day()]} ${day.date()} ${MONTHS[day.month()]}`;
};

/** Query param de /visits que lleva el día que se mira. */
export const DAY_PARAM = "date";

/**
 * YYYY-MM-DD: el mismo formato viaja en la URL y en la petición al API, así que el
 * día que se ve en la barra es literalmente el que consulta el backend.
 */
export const DAY_PARAM_FORMAT = "YYYY-MM-DD";

/**
 * "2026-10-15" → ese día a medianoche; null si no viene o no es una fecha válida
 * (`2026-02-31` no pasa, el parseo es estricto). El plugin `customParseFormat`
 * está extendido en el layout raíz.
 */
export const parseDayParam = (value: string | null): Dayjs | null => {
  if (!value) return null;
  const parsed = dayjs(value, DAY_PARAM_FORMAT, true);
  return parsed.isValid() ? parsed.startOf("day") : null;
};

/** Día → "2026-10-15", el formato que espera GET /visit-admin/today-visits. */
export const formatDayParam = (day: Dayjs) => day.format(DAY_PARAM_FORMAT);

/** Número con el formato de Colombia (coma decimal). */
export const fmtNumber = (value: number, decimals = 0) =>
  value.toLocaleString("es-CO", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
