/* Formato de moneda y fechas de la cartera.
   fmtM produce la forma compacta del diseño ("$51,26 MM", "$377 M"), que
   formatCurrencyMoney de @/utils/utils no cubre. */

/** Millones / miles de millones abreviados, con separadores es-CO. */
export const fmtM = (v: number): string => {
  const m = v / 1e6;
  if (Math.abs(m) >= 1000) {
    return "$" + (m / 1000).toLocaleString("es-CO", { maximumFractionDigits: 2 }) + " MM";
  }
  return "$" + m.toLocaleString("es-CO", { maximumFractionDigits: m < 10 ? 1 : 0 }) + " M";
};

/** Valor completo en pesos, sin decimales. */
export const fmtFull = (v: number): string => "$" + Math.round(v).toLocaleString("es-CO");

export const fac = (n: number): string => `${n} ${n === 1 ? "factura" : "facturas"}`;
export const cli = (n: number): string => `${n} ${n === 1 ? "cliente" : "clientes"}`;

/** Quita el sufijo societario para que el nombre quepa en una celda. */
export const corto = (n: string): string =>
  n.replace(/\s+(S\.A\.S\.?|S\.A\.|LTDA\.?|E\.U\.)\s*$/i, "").trim();

export const pct = (part: number, total: number): number => (total ? (part / total) * 100 : 0);
