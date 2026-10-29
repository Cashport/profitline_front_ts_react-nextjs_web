/* Clases compartidas de la torre: tarjetas de indicadores y tablas. */

/** Rótulo de las tarjetas de indicadores (el mismo de las tarjetas de la cartera). */
export const KPI_LABEL =
  "text-[13px] font-medium text-muted-foreground";

/** Cifra de las tarjetas de indicadores. */
export const KPI_VALUE =
  "mt-1.5 text-[19px] font-bold leading-[1.15] tracking-[-0.02em] tabular-nums text-foreground";

/**
 * Tarjeta de indicador con barra (aplicación, tramos): encabezado, barra y
 * leyenda son tres filas de la rejilla del tablero (subgrid), así las barras
 * de tarjetas vecinas quedan a la misma altura.
 */
export const KPI_CARD =
  "row-span-3 grid min-w-0 grid-cols-1 grid-rows-subgrid cp-card px-[18px] py-[14px]";

/* ---------- tablas ----------
   border-separate y no collapse: con collapse los bordes del encabezado y del
   total no acompañan a las celdas fijas al hacer scroll. */
export const TABLE = "w-full table-fixed border-separate border-spacing-0";

/** Encabezado fijo, con el fondo opaco de la tarjeta. */
export const THEAD = "sticky top-0 z-[2] bg-cp-surface";

/** Encabezado sin orden, con el mismo aspecto que SortableTh. */
export const TH =
  "whitespace-nowrap border-b border-cp-line bg-cp-surface px-3 py-3 text-left text-[13.5px] font-semibold text-cp-ink";

export const TD = "border-b border-border px-3 py-2 align-middle text-[13px] text-foreground";

/** Fila de total, fija abajo. */
export const TD_TOTAL =
  "sticky bottom-0 z-[1] border-t border-muted-foreground/40 bg-muted px-3 py-2 align-middle text-[13px] font-bold text-foreground";

/** Fila que filtra el tablero al hacer clic. */
export const ROW_CLICK = "cursor-pointer transition-colors hover:bg-muted/40";

/** Fila que es el filtro activo. */
export const ROW_SELECTED = "bg-wallet-accent-soft hover:bg-wallet-accent-soft";

/** Nombre de cliente y su línea de detalle. */
export const NAME = "block truncate text-[13px] font-semibold";
/** Nombre de una persona o canal (grupos): sin mayúsculas sostenidas. */
export const PERSON = "block truncate text-[13px] font-semibold";
export const SUB = "block truncate text-[13px] font-normal text-muted-foreground";

export const AMOUNT = "whitespace-nowrap font-semibold tabular-nums";

/** "Sin meta" en lugar de la barra de avance: sin meta no hay contra qué medir. */
export const NO_GOAL = "whitespace-nowrap text-[13px] font-normal text-muted-foreground";

/** Columnas que se ocultan en pantallas angostas (el h-sm del prototipo). */
export const HIDE_SM = "max-sm:hidden";

export const EMPTY = "px-7 py-7 text-center text-[13px] text-muted-foreground";
