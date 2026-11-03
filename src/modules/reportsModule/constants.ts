import type { SortState } from "@/modules/walletModule/types";
import type { IReportsFilters } from "@/types/reports/IReports";

export const EMPTY_REPORTS_FILTERS: IReportsFilters = { report_type_ids: [], from: null, to: null };

/** Lo más reciente primero. Las columnas son campos de IReport. */
export const DEFAULT_REPORTS_SORT: SortState = { col: "created_at", dir: "desc" };

/** Columnas que arrancan ascendentes al ordenar; la fecha arranca descendente. */
export const REPORTS_TEXTUAL_COLS = ["name", "report_type_name"];

export const REPORT_FILE_EXTENSIONS = [".html", ".htm"];
export const REPORT_FILE_MAX_MB = 30;
