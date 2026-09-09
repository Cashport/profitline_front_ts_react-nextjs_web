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
export const grp = (n: number): string => `${n} ${n === 1 ? "grupo" : "grupos"}`;

/** Quita el sufijo societario para que el nombre quepa en una celda. */
export const corto = (n: string): string =>
  n.replace(/\s+(S\.A\.S\.?|S\.A\.|LTDA\.?|E\.U\.)\s*$/i, "").trim();

export const pct = (part: number, total: number): number => (total ? (part / total) * 100 : 0);

/* ---------- Fechas ----------
   Todo se mide contra la fecha de corte de la carga, no contra el reloj del
   navegador: así la vista es la misma para todos hasta el siguiente corte. */

/** Fecha de corte. En producción viene del backend, igual que FECHA_CORTE. */
export const HOY = new Date(2026, 7, 31);

/** Suma (o resta) días a una fecha, sin mutar la original. */
export const dias = (d: Date, n: number): Date => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

const pad = (n: number): string => String(n).padStart(2, "0");

/** dd/mm/aaaa */
export const fmtD = (d: Date): string =>
  `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;

/** dd/mm/aa */
export const fmtDc = (d: Date): string =>
  `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${String(d.getFullYear()).slice(2)}`;

/** Días de `a` a `b`: positivo si `b` es posterior. */
export const diasEntre = (a: Date, b: Date): number =>
  Math.round((b.getTime() - a.getTime()) / 86400000);
