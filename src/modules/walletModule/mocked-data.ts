/* ============================================================
   DATOS SIMULADOS — SE REEMPLAZAN POR EL API
   ------------------------------------------------------------
   Mantienen la forma que debe devolver el backend: al conectar el
   servicio sólo cambia el origen, no los componentes.

   La cartera ya sale del API; esto sólo alimenta Torre de control.
   ============================================================ */
import { ORDEN_EST } from "./constants";
import { sumCells } from "./utils/wallet-calc";
import { IWalletClientRow, IWalletMatrixCell, IWalletPerson, IWalletSummary } from "./types";

const M = 1e6;
const MM = 1e9;

/** Reparto por estado de cada tramo: entre más viejo, más novedad y sin conciliar. */
const PERFIL_TRAMO: Record<string, number>[] = [
  { compensada: 0.03, pagada: 0.04, conciliado: 0.82, novedad: 0.03, sin_conciliar: 0.08 },
  { compensada: 0.06, pagada: 0.1, conciliado: 0.45, novedad: 0.22, sin_conciliar: 0.17 },
  { compensada: 0.08, pagada: 0.09, conciliado: 0.32, novedad: 0.3, sin_conciliar: 0.21 },
  { compensada: 0.09, pagada: 0.08, conciliado: 0.28, novedad: 0.32, sin_conciliar: 0.23 },
  { compensada: 0.1, pagada: 0.07, conciliado: 0.22, novedad: 0.36, sin_conciliar: 0.25 },
  { compensada: 0.12, pagada: 0.06, conciliado: 0.16, novedad: 0.38, sin_conciliar: 0.28 }
];

/**
 * Convierte un total de tramo en su desglose por estado, cuadrando el redondeo.
 *
 * PERFIL_TRAMO sólo pesa los cinco estados del diseño original; los cuatro que
 * llegaron con el API (saldo, glosado, devolución, otros) quedan en cero aquí,
 * porque estos datos simulados sólo alimentan Torre de control.
 */
function cell(total: number, ti: number): IWalletMatrixCell {
  const perfil = PERFIL_TRAMO[ti];
  const parts = ORDEN_EST.map((e) => Math.round(total * (perfil[e] ?? 0)));
  const diff = total - parts.reduce((a, b) => a + b, 0);
  parts[2] += diff; // el sobrante cae en conciliado, el segmento más grande

  const c = { total, n: 0 } as IWalletMatrixCell;
  ORDEN_EST.forEach((e, i) => (c[e] = parts[i]));
  return c;
}

const row = (
  id: string,
  nombre: string,
  nit: string,
  ejecutivo: string,
  totales: number[]
): IWalletClientRow => {
  const tramos = totales.map((t, i) => cell(t, i));
  return { id, nombre, nit, ejecutivo, tramos, vencido: sumCells(tramos.slice(1)) };
};

export const WALLET_CLIENT_ROWS: IWalletClientRow[] = [
  row("C001", "OXXO COLOMBIA S.A.S.", "843326788", "Cristina Osorio", [
    7.92 * MM,
    1.32 * MM,
    377 * M,
    49 * M,
    150 * M,
    25 * M
  ]),
  row("C002", "KOBA COLOMBIA S.A.S. (D1)", "894204193", "Cristina Osorio", [
    5.61 * MM,
    1.16 * MM,
    336 * M,
    74 * M,
    135 * M,
    103 * M
  ]),
  row("C003", "ALMACENES ÉXITO S.A.", "846874074", "Mónica Bermúdez", [
    5.33 * MM,
    856 * M,
    371 * M,
    86 * M,
    109 * M,
    135 * M
  ]),
  row("C004", "ARCOS DORADOS COLOMBIA S.A.S.", "810162228", "Germán Torres", [
    3.54 * MM,
    479 * M,
    91 * M,
    0,
    136 * M,
    65 * M
  ])
];

/** Totales de la vista completa (16 clientes), no sólo de las filas mostradas. */
export const WALLET_SUMMARY: IWalletSummary = {
  clientes: 16,
  segments: {
    compensada: 2.12 * MM,
    pagada: 3.04 * MM,
    conciliado: 34.88 * MM,
    novedad: 4.37 * MM,
    sin_conciliar: 6.85 * MM,
    saldo: 0,
    saldo_factura: 0,
    glosado: 0,
    devolucion: 0,
    otros: 0,
    total: 51.26 * MM,
    vencido: 11.4 * MM,
    n: 835
  }
};

/* ---------- Personas ---------- */

export const WALLET_PEOPLE: Record<string, IWalletPerson> = {
  cosorio: { id: "cosorio", nombre: "Cristina Osorio", iniciales: "CO" },
  gtorres: { id: "gtorres", nombre: "Germán Torres", iniciales: "GT" },
  mbermudez: { id: "mbermudez", nombre: "Mónica Bermúdez", iniciales: "MB" },
  eorjuela: { id: "eorjuela", nombre: "Elkin Orjuela", iniciales: "EO" },
  malfonso: { id: "malfonso", nombre: "Miguel Alfonso", iniciales: "MA" },
  backoffice: { id: "backoffice", nombre: "Back Office", iniciales: "BO" },
  comercial: { id: "comercial", nombre: "Comercial", iniciales: "CM" }
};

/* ---------- El resto del portafolio ----------
   WALLET_SUMMARY siempre ha declarado 16 clientes; la matriz muestra cuatro a
   modo de muestra. Éstos son los doce que faltaban. Se generan porque nadie los
   lee al detalle: la torre de control necesita el universo completo para sus
   agregados, y ninguna otra vista los toca. */

/** [nombre, NIT, ejecutivo, saldo en millones]. */
const RESTO_SEED: [string, string, string, number][] = [
  ["SUPERTIENDAS OLÍMPICA S.A.", "890107487", "cosorio", 4180],
  ["JERÓNIMO MARTINS COLOMBIA S.A.S. (ARA)", "900707644", "mbermudez", 3620],
  ["MAKRO SUPERMAYORISTA S.A.S.", "830032468", "gtorres", 2980],
  ["CENCOSUD COLOMBIA S.A.", "900155107", "mbermudez", 2410],
  ["ALKOSTO S.A.", "860030777", "gtorres", 1960],
  ["PRICESMART COLOMBIA S.A.S.", "830010337", "eorjuela", 1540],
  ["COMERCIALIZADORA MERQUEO S.A.S.", "901231549", "eorjuela", 1290],
  ["SUPERMERCADOS LA 14 S.A.", "890303025", "malfonso", 1120],
  ["COOPERATIVA CONSUMO MEDELLÍN", "817497224", "malfonso", 980],
  ["DISTRIBUIDORA TROPICAL DEL CARIBE S.A.S.", "900412855", "malfonso", 850],
  ["SUPERMERCADOS EL RENDIDOR S.A.S.", "900884012", "eorjuela", 1120],
  ["DISTRIBUIDORA NACIONAL DE ALIMENTOS S.A.S.", "901004526", "cosorio", 753]
];

/** Tres repartos por tramo —sano, medio y moroso— alternados por índice. */
const PERFIL_MORA = [
  [0.8, 0.1, 0.04, 0.02, 0.02, 0.02],
  [0.74, 0.12, 0.055, 0.025, 0.03, 0.03],
  [0.66, 0.14, 0.065, 0.035, 0.04, 0.06]
];

const clienteId = (i: number): string => `C${String(i + 5).padStart(3, "0")}`;

/** Vectores de tramo del resto, cuadrados contra el total de WALLET_SUMMARY. */
const RESTO_TRAMOS: number[][] = (() => {
  const vectores = RESTO_SEED.map(([, , , saldo], i) =>
    PERFIL_MORA[i % PERFIL_MORA.length].map((p) => Math.round(saldo * M * p))
  );

  const suma = (v: number[]) => v.reduce((a, b) => a + b, 0);
  const yaContado = WALLET_CLIENT_ROWS.reduce((a, c) => a + suma(c.tramos.map((t) => t.total)), 0);
  const generado = vectores.reduce((a, v) => a + suma(v), 0);

  // El último absorbe el redondeo: así el portafolio suma exactamente el total
  // que anuncia WALLET_SUMMARY.
  vectores[vectores.length - 1][0] += WALLET_SUMMARY.segments.total - yaContado - generado;
  return vectores;
})();

/** Los 16 clientes. Los cuatro de la matriz se reutilizan tal cual. */
export const WALLET_PORTFOLIO: IWalletClientRow[] = [
  ...WALLET_CLIENT_ROWS,
  ...RESTO_SEED.map(([nombre, nit, ejecutivo], i) =>
    row(clienteId(i), nombre, nit, WALLET_PEOPLE[ejecutivo].nombre, RESTO_TRAMOS[i])
  )
];

export const EJECUTIVO_POR_CLIENTE: Record<string, IWalletPerson> = {
  C001: WALLET_PEOPLE.cosorio,
  C002: WALLET_PEOPLE.cosorio,
  C003: WALLET_PEOPLE.mbermudez,
  C004: WALLET_PEOPLE.gtorres,
  ...Object.fromEntries(
    RESTO_SEED.map(([, , ejecutivo], i) => [clienteId(i), WALLET_PEOPLE[ejecutivo]])
  )
};
