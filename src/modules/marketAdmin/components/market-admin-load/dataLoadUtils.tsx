import { getActiveLocale } from "@/i18n/translator";

// Mes abreviado según el idioma activo ("2 sept 2026" / "Sep 2, 2026").
const shortDate = (date: Date, timeZone?: string) =>
  new Intl.DateTimeFormat(getActiveLocale(), {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone
  }).format(date);

// Se parte el string en vez de usar `new Date(iso)`: para un "YYYY-MM-DD" el
// constructor asume UTC y en UTC-5 devolvería el día anterior.
export const formatDate = (iso: string | null) => {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || m > 12 || !d) return iso;
  // Se arma en UTC y se formatea en UTC: el día no se corre por la zona horaria.
  return shortDate(new Date(Date.UTC(y, m - 1, d)), "UTC");
};

// Para timestamps ISO completos ("2026-09-02T21:20:56.000Z") — fecha + hora local.
export const formatDateTime = (iso: string | null) => {
  if (!iso) return "—";
  const date = new Date(iso);
  if (isNaN(date.getTime())) return iso;
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${shortDate(date)} · ${hours}:${minutes}`;
};

// El API manda `color` como string ("gray", "green", ...); se mapea a clases.
const COLOR_STYLES: Record<string, string> = {
  gray: "bg-[#F0F0F0] text-[#666666]",
  green: "bg-[#E8F9E8] text-[#1A7A1A]",
  orange: "bg-[#FFF0E6] text-[#B84A00]",
  red: "bg-[#FDE8E8] text-[#B00020]",
  blue: "bg-[#E8F0FE] text-[#1A4FA0]",
  yellow: "bg-[#FFF8E1] text-[#8F6D00]"
};

export const statusColorClasses = (color: string) => COLOR_STYLES[color] ?? COLOR_STYLES.gray;

export const EstadoPill = ({ label, color }: { label: string; color: string }) => (
  <span
    className={`text-[13px] font-semibold px-2 py-0.5 rounded-full w-fit ${statusColorClasses(color)}`}
  >
    {label}
  </span>
);
