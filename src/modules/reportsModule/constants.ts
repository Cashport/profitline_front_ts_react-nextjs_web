import type { SortState } from "@/modules/walletModule/types";

import type { IReportsFilters } from "./types";

export const EMPTY_REPORTS_FILTERS: IReportsFilters = { typeIds: [], from: null, to: null };

/** Lo más reciente primero. */
export const DEFAULT_REPORTS_SORT: SortState = { col: "fecha", dir: "desc" };

/** Columnas que arrancan ascendentes al ordenar; la fecha arranca descendente. */
export const REPORTS_TEXTUAL_COLS = ["nombre", "tipo"];

export const REPORT_FILE_EXTENSIONS = [".html", ".htm"];
export const REPORT_FILE_MAX_MB = 20;
