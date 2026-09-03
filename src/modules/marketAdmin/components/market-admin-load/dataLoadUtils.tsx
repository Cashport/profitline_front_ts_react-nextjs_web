const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

// Se parte el string en vez de usar `new Date(iso)`: para un "YYYY-MM-DD" el
// constructor asume UTC y en UTC-5 devolvería el día anterior.
export const formatDate = (iso: string | null) => {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  const month = MONTHS[Number(m) - 1];
  if (!month) return iso;
  return `${d} ${month} ${y}`;
};

// Para timestamps ISO completos ("2026-09-02T21:20:56.000Z") — fecha + hora local.
export const formatDateTime = (iso: string | null) => {
  if (!iso) return "—";
  const date = new Date(iso);
  if (isNaN(date.getTime())) return iso;
  const month = MONTHS[date.getMonth()];
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${date.getDate()} ${month} ${date.getFullYear()} · ${hours}:${minutes}`;
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
    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full w-fit ${statusColorClasses(color)}`}
  >
    {label}
  </span>
);
