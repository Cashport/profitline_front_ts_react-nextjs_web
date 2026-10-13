/* Clases compartidas de la torre: tarjetas de indicadores y tablas. */

/** Rótulo de las tarjetas de indicadores (el mismo de las tarjetas de la cartera). */
export const KPI_LABEL = "text-[11px] font-medium uppercase tracking-[0.03em] text-muted-foreground";

/** Cifra de las tarjetas de indicadores. */
export const KPI_VALUE =
  "mt-1.5 text-[19px] font-bold leading-[1.15] tracking-[-0.02em] tabular-nums text-foreground";

/* ---------- tablas ----------
   border-separate y no collapse: con collapse los bordes del encabezado y del
   total no acompañan a las celdas fijas al hacer scroll. */
export const TABLE = "w-full table-fixed border-separate border-spacing-0";

/** Encabezado fijo; el fondo opaco va en el thead porque los th son translúcidos. */
export const THEAD = "sticky top-0 z-[2] bg-card";

/** Encabezado sin orden, con el mismo aspecto que SortableTh. */
export const TH =
  "whitespace-nowrap border-b border-border bg-muted/40 px-3 py-2.5 text-left text-[10.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground";

export const TD = "border-b border-border px-3 py-2 align-middle text-[11.5px] text-foreground";

/** Fila de total, fija abajo. */
export const TD_TOTAL =
  "sticky bottom-0 z-[1] border-t border-muted-foreground/40 bg-muted px-3 py-2 align-middle text-[11.5px] font-bold text-foreground";

/** Fila que filtra el tablero al hacer clic. */
export const ROW_CLICK = "cursor-pointer transition-colors hover:bg-muted/40";

/** Fila que es el filtro activo. */
export const ROW_SELECTED = "bg-wallet-accent-soft hover:bg-wallet-accent-soft";

/** Nombre de cliente (en mayúsculas) y su línea de detalle. */
export const NAME = "block truncate text-[11px] font-semibold uppercase tracking-[0.01em]";
/** Nombre de una persona o canal (grupos): sin mayúsculas sostenidas. */
export const PERSON = "block truncate text-[11.5px] font-semibold";
export const SUB = "block truncate text-[10px] font-normal text-muted-foreground";

export const AMOUNT = "whitespace-nowrap font-semibold tabular-nums";

/** Columnas que se ocultan en pantallas angostas (el h-sm del prototipo). */
export const HIDE_SM = "max-sm:hidden";

export const EMPTY = "px-7 py-7 text-center text-[11.5px] text-muted-foreground";
