/* Trazos y textos de los gráficos SVG: salen de los tokens del tema; los
   colores de las series, del API. */

/** Rótulos de los ejes. */
export const AXIS = "fill-muted-foreground text-[10px] tabular-nums";

/** Título de cada eje ("ACUMULADO", "POR DÍA"). */
export const PANEL_TITLE = "fill-muted-foreground text-[9.5px] font-semibold tracking-[0.05em]";

/** Día del fin de semana en el eje X. */
export const AXIS_WEEKEND = "fill-muted-foreground/60";

/** El día del corte en el eje X. */
export const AXIS_TODAY = "fill-foreground font-bold";

/** Rótulo "Hoy dd/mm" sobre la línea del corte. */
export const TODAY_LABEL = "fill-foreground/80 text-[10px] font-semibold";

export const GRID = "stroke-border";
export const WEEK_LINE = "stroke-border opacity-55";
export const WEEK_TICK = "stroke-muted-foreground";
export const TODAY_LINE = "stroke-muted-foreground/40";

/** Colores CSS para los cuadritos de los tooltips de series que no vienen del API. */
export const FOREGROUND = "rgb(var(--foreground))";
export const MUTED = "rgb(var(--muted-foreground))";
export const PREVIOUS = "rgb(var(--muted-foreground) / 0.6)";

/** Márgenes del área de dibujo: los dos gráficos alinean sus días. */
export const CHART_MARGIN = { l: 62, r: 62, t: 36, b: 24 };

/** Alto de los gráficos; su tabla vecina se estira a lo mismo. */
export const CHART_HEIGHT = 410;
