export const SPANISH_MONTHS = [
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

export interface MonthOption {
  id: string;
  name: string;
}

/** Nombre del mes con mayúscula inicial en el idioma indicado (español si no se indica). */
const monthName = (date: Date, locale?: string): string => {
  if (!locale) return SPANISH_MONTHS[date.getMonth()];
  const name = new Intl.DateTimeFormat(locale, { month: "long" }).format(date);
  return name.charAt(0).toLocaleUpperCase(locale) + name.slice(1);
};

export const buildLastSixMonths = (locale?: string): MonthOption[] => {
  const now = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const id = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const name = `${monthName(d, locale)} ${d.getFullYear()}`;
    return { id, name };
  });
};

export const getCurrentMonthId = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};
