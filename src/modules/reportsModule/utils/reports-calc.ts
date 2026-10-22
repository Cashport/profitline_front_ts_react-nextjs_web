import { parseApiDate } from "@/modules/walletModule/utils/api-adapter";
import type { IReport } from "@/types/reports/IReports";

import type { IReportsFilters } from "../types";

/** Día de publicación (YYYY-MM-DD), comparable con el rango del filtro. */
const publishedDay = (r: IReport) => r.published_at.slice(0, 10);

/** Búsqueda por nombre o tipo, más los filtros: tipos en OR y rango de fechas inclusivo. */
export function filterReports(
  reports: IReport[],
  search: string,
  filters: IReportsFilters
): IReport[] {
  const q = search.trim().toLowerCase();

  return reports.filter(
    (r) =>
      (!q || r.name.toLowerCase().includes(q) || r.report_type_name.toLowerCase().includes(q)) &&
      (!filters.typeIds.length || filters.typeIds.includes(r.report_type_id)) &&
      (!filters.from || publishedDay(r) >= filters.from) &&
      (!filters.to || publishedDay(r) <= filters.to)
  );
}

/** Valor por el que ordena cada columna de la tabla. */
export const reportSortValue = (r: IReport, col: string): string | number => {
  if (col === "tipo") return r.report_type_name;
  if (col === "fecha") return parseApiDate(r.published_at)?.getTime() ?? 0;
  return r.name;
};

export const hasActiveFilters = (filters: IReportsFilters): boolean =>
  Boolean(filters.typeIds.length || filters.from || filters.to);
