/* ============================================================
   DATOS DE EJEMPLO de la Torre de control de recaudo.
   SE REEMPLAZAN POR EL API (ver USE_TOWER_MOCK en constants).
   ------------------------------------------------------------
   Port de data/mock.js y data/catalogos.js del prototipo
   (cashport-recaudo-torre-front). Son deterministas: con la semilla fija
   el tablero muestra las mismas cifras que el prototipo, así que el orden
   en que se piden los números aleatorios no se puede cambiar.
   ============================================================ */

/** Corte de los datos simulados (m: 0 = enero). En producción el corte llega del API. */
export const MOCK_CUTOFF = { y: 2026, m: 8, d: 28, hour: 17, minute: 0 };

export const DAY_MS = 864e5;

const CUTOFF_DAY = new Date(MOCK_CUTOFF.y, MOCK_CUTOFF.m, MOCK_CUTOFF.d);

export interface MockMonth {
  y: number;
  /** 0 = enero. */
  m: number;
  /** Días del mes. */
  dim: number;
}

/** Últimos 12 meses; los 6 más antiguos sólo alimentan la mediana histórica. */
export const MOCK_MONTHS: MockMonth[] = [];
for (let i = 11; i >= 0; i--) {
  const dt = new Date(MOCK_CUTOFF.y, MOCK_CUTOFF.m - i, 1);
  MOCK_MONTHS.push({
    y: dt.getFullYear(),
    m: dt.getMonth(),
    dim: new Date(dt.getFullYear(), dt.getMonth() + 1, 0).getDate()
  });
}

/** Índice del mes en curso. */
export const CUR = MOCK_MONTHS.length - 1;

/** Último día con datos del mes `mi`: el del corte en el mes en curso. */
export const corte = (mi: number) => (mi === CUR ? MOCK_CUTOFF.d : MOCK_MONTHS[mi].dim);

export const fdate = (mi: number, d: number) => new Date(MOCK_MONTHS[mi].y, MOCK_MONTHS[mi].m, d);

export function sum(a: number[]): number;
export function sum<T>(a: T[], f: (x: T) => number): number;
export function sum<T>(a: T[], f?: (x: T) => number): number {
  return a.reduce((s, x) => s + (f ? f(x) : Number(x)), 0);
}

/* ---------- catálogos: estructura comercial del cliente ---------- */

export const GERENCIAS = [
  { id: "g1", n: "Gerencia Centro" },
  { id: "g2", n: "Gerencia Regiones" }
];

export const COORDINADORES = [
  { id: "c1", n: "Laura Méndez", g: "g1" },
  { id: "c2", n: "Andrés Villamil", g: "g1" },
  { id: "c3", n: "Paola Rincón", g: "g2" }
];

export const EJECUTIVOS = [
  { id: "e1", n: "Camilo Ruiz", c: "c1" },
  { id: "e2", n: "Diana Parra", c: "c1" },
  { id: "e3", n: "Julián Ortega", c: "c2" },
  { id: "e4", n: "Natalia Gómez", c: "c2" },
  { id: "e5", n: "Sergio Pineda", c: "c3" },
  { id: "e6", n: "Valentina Rojas", c: "c3" },
  { id: "e7", n: "Mauricio León", c: "c3" }
];

export const CANALES = [
  { id: "m1", n: "Cadenas" },
  { id: "m2", n: "Mayoristas" },
  { id: "m3", n: "Autoservicios" },
  { id: "m4", n: "Droguerías" },
  { id: "m5", n: "Tradicional" }
];

/** Tramos de mora, en el orden de `MockClientMonth.sh`. */
export const TRAMOS = [
  { key: "corriente", label: "Corriente" },
  { key: "1-30", label: "1–30" },
  { key: "31-60", label: "31–60" },
  { key: "61-90", label: "61–90" },
  { key: "91-120", label: "91–120" },
  { key: "+120", label: "+120" }
];

/* ---------- generador con semilla fija (mulberry32) ---------- */

let seed = 20260928;
function R(): number {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const r = (a: number, b: number) => a + (b - a) * R();

function canalDe(name: string): string {
  const n = name.toLowerCase();
  if (/droguer/.test(n)) return "m4";
  if (/mayorista|abastos|distribu|surtidora|comercializadora/.test(n)) return "m2";
  if (/supermercado|hipermercado|supertienda|almacenes|cadena|mercados/.test(n)) return "m1";
  if (/autoservicio|minimercado|ahorro/.test(n)) return "m3";
  return "m5";
}

const NOMBRES = [
  "Almacenes La Colina S.A.S",
  "Supermercados El Trébol S.A",
  "Distribuidora Andina del Norte S.A.S",
  "Grupo Comercial Santa Fe S.A",
  "Hipermercado Los Pinos S.A.S",
  "Autoservicio La Economía S.A.S",
  "Droguerías Vida Plena S.A",
  "Mayorista El Surtidor S.A.S",
  "Comercializadora Río Claro S.A.S",
  "Tiendas Mi Barrio S.A.S",
  "Minimercados Casablanca S.A.S",
  "Distribuciones Altamira S.A",
  "Almacenes Punto Fijo S.A.S",
  "Supertiendas Oriente S.A",
  "Cadena Los Andes S.A",
  "Mercados La Canasta S.A.S",
  "Abastos del Caribe S.A.S",
  "Distribuidora Tres Ríos S.A.S",
  "Comercial Villa Verde S.A.S",
  "Súper Ahorro Express S.A.S",
  "Surtidora del Valle S.A",
  "Centro de Abastos Occidente S.A.S",
  "Almacenes El Faro S.A",
  "Distribuidora La Pradera S.A.S",
  "Comercial Horizonte S.A.S",
  "Autoservicios Buen Precio S.A.S"
];
const PATS = ["cierre", "quincena", "uniforme", "inicio", "cierre", "quincena", "cierre"];
const NITP = ["900", "901", "890", "830", "800", "811"];

/** Peso de un día en el recaudo del mes según el patrón de pago del cliente. */
function peso(d: number, dim: number, pat: string, dow: number): number {
  let w = 1;
  if (pat === "cierre") w = d > dim - 5 ? 3.4 : d >= 14 && d <= 16 ? 1.2 : 0.55;
  else if (pat === "quincena") w = (d >= 13 && d <= 16) || d > dim - 3 ? 2.7 : 0.6;
  else if (pat === "inicio") w = d <= 8 ? 2.5 : 0.7;
  else w = d > dim - 3 ? 1.5 : 1;
  if (dow === 0) w *= 0.05;
  else if (dow === 6) w *= 0.4;
  return w;
}

function shares(): number[] {
  const b = [0.22, 0.36, 0.17, 0.11, 0.08, 0.06].map((x) => x * r(0.6, 1.4));
  const s = sum(b);
  return b.map((x) => x / s);
}

export interface MockAgreementSeed {
  /** Monto acordado. */
  v: number;
  /** Día de compromiso dentro del mes (puede caer antes o después). */
  dia: number;
  /** Sorteo que decide si se pagó completo, parcial o nada. */
  p: number;
  frac: number;
  reprog: number;
  gest: number;
  /** Días entre la carga y el compromiso. */
  carga: number;
}

export interface MockClientMonth {
  meta: number;
  /** Recaudo de cada día del mes (índice 0 = día 1). */
  dia: number[];
  pr: [number, number][];
  /** Participación del recaudo por tramo de mora (TRAMOS). */
  sh: number[];
  acu: MockAgreementSeed[];
}

export interface MockClient {
  id: string;
  /** Posición en MOCK_CLIENTS: alimenta horas e ids de los pagos. */
  idx: number;
  n: string;
  nit: string;
  /** Ejecutivo. */
  e: string;
  /** Canal. */
  kam: string;
  base: number;
  perf: number;
  pat: string;
  sh: number[];
  lag: number;
  pnaF: number;
  mes: MockClientMonth[];
}

export const MOCK_CLIENTS: MockClient[] = NOMBRES.map((n, i) => {
  const e = EJECUTIVOS[(i * 3) % EJECUTIVOS.length];
  const big = R() < 0.2;
  // Mismo orden de llamadas que el prototipo: nit, base, perf, pat, sh, lag, pnaF.
  const nit = NITP[i % NITP.length] + String(Math.floor(r(1e6, 9.99e6)));
  const base = big ? r(4.2e9, 7.5e9) : r(0.7e9, 3.2e9);
  const perf = r(0.86, 1.1);
  const pat = PATS[Math.floor(R() * PATS.length)];
  const sh = shares();
  const lag = R() < 0.3 ? r(-0.24, -0.1) : r(-0.03, 0.07);
  const pnaF = r(0.45, 1.7);
  return { id: "k" + i, idx: i, n, nit, e: e.id, kam: canalDe(n), base, perf, pat, sh, lag, pnaF, mes: [] };
});

MOCK_CLIENTS.forEach((c) => {
  c.mes = MOCK_MONTHS.map((M, mi) => {
    const meta = Math.round((c.base * r(0.93, 1.1)) / 1e7) * 1e7;
    let perf = c.perf + r(-0.08, 0.08);
    if (mi === CUR) perf += c.lag;
    const tot = meta * perf;
    const w: number[] = [];
    const pr: [number, number][] = [];
    for (let d = 1; d <= M.dim; d++) {
      const dow = new Date(M.y, M.m, d).getDay();
      w.push(peso(d, M.dim, c.pat, dow) * r(0.55, 1.45));
      pr.push([r(0.5, 1.5), r(0.3, 1.7)]);
    }
    const sw = sum(w);
    const dia = w.map((x) => (tot * x) / sw);
    const sh = c.sh.map((x) => x * r(0.85, 1.15));
    const ss = sum(sh);
    // Novedades: el prototipo las sortea aunque la torre no las use. Se
    // conservan las dos llamadas para no correr la secuencia de la semilla.
    r(0, 4.6);
    r(20, 240);
    const acu: MockAgreementSeed[] = [];
    const na = Math.floor(r(1, 5.4));
    for (let j = 0; j < na; j++) {
      const v = Math.round(r(40, 700)) * 1e6;
      const diaCompromiso = Math.floor(r(-2, M.dim + 16));
      const p = R();
      const frac = r(0.2, 0.8);
      const reprog = R() < 0.25 ? 1 + Math.floor(R() * 2) : 0;
      const gest = Math.floor(r(0, 12));
      const carga = Math.floor(r(4, 22));
      acu.push({ v, dia: diaCompromiso, p, frac, reprog, gest, carga });
    }
    return { meta, dia, pr, sh: sh.map((x) => x / ss), acu };
  });
});

/**
 * Parte del recaudo del día `d` ya aplicada y parte identificada sin aplicar
 * (PNA), como fracciones. En producción el API entrega los dos valores por día.
 */
export function splitPago(c: MockClient, mi: number, d: number): [number, number] {
  const a = Math.round((CUTOFF_DAY.getTime() - fdate(mi, d).getTime()) / DAY_MS);
  const q = c.mes[mi].pr[d - 1];
  let pna =
    (a <= 1 ? 0.42 : a <= 3 ? 0.24 : a <= 7 ? 0.1 : a <= 14 ? 0.04 : a <= 21 ? 0.012 : 0) *
    c.pnaF *
    q[0];
  pna = Math.min(pna, 0.85);
  return [1 - pna, pna];
}

/** Lead time de aplicación (días) del cliente `c` en el mes `m`. */
export const leadTime = (c: MockClient, m: number) =>
  (0.4 + c.pnaF * 1.6) * (1 + 0.16 * Math.sin(m * 1.3 + 0.8));

/** Factor de tramo: participación del tramo elegido en el recaudo (1 sin tramo). */
export type TramoFactor = (c: MockClient, mi: number) => number;

export interface MockPayment {
  id: string;
  c: MockClient;
  /** Fecha y hora del pago. */
  f: Date;
  /** Monto pendiente. */
  v: number;
  /** Horas desde el pago hasta el corte. */
  hrs: number;
}

/**
 * Pagos identificados sin aplicar (PNA) abiertos al corte del mes `mi`,
 * incluidos los del mes anterior que siguen abiertos.
 */
export function pagosPNA(cls: MockClient[], mi: number, tf: TramoFactor): MockPayment[] {
  const items: MockPayment[] = [];
  [mi - 1, mi].forEach((m) => {
    if (m < 0) return;
    const D = m === mi ? corte(mi) : MOCK_MONTHS[m].dim;
    cls.forEach((c) => {
      const f = tf(c, m);
      for (let d = 1; d <= D; d++) {
        const v = c.mes[m].dia[d - 1] * f * splitPago(c, m, d)[1];
        const dias = Math.round((fdate(mi, corte(mi)).getTime() - fdate(m, d).getTime()) / DAY_MS);
        if (v >= 5e6 && dias >= 0) {
          const ci = c.idx;
          const hr = 7 + ((ci * 7 + d * 3 + m) % 11);
          const mn = (ci * 13 + d * 7) % 60;
          const fp = new Date(MOCK_MONTHS[m].y, MOCK_MONTHS[m].m, d, hr, mn);
          const cutH = new Date(MOCK_MONTHS[mi].y, MOCK_MONTHS[mi].m, corte(mi), 17, 0);
          const h = Math.max(0, Math.floor((cutH.getTime() - fp.getTime()) / 36e5));
          items.push({
            c,
            f: fp,
            v,
            hrs: h,
            id: "PAG-" + String(100000 + ((ci * 7919 + m * 373 + d * 131) % 899999))
          });
        }
      }
    });
  });
  return items;
}

export interface MockAgreement {
  id: string;
  c: MockClient;
  /** Acordado. */
  v: number;
  /** Pagado a la fecha de corte. */
  pag: number;
  /** Fecha comprometida. */
  comp: Date;
  /** Fecha en que se cargó. */
  carga: Date;
  reprog: number;
}

/** Acuerdos de pago con fecha de compromiso en el mes `mi` (el estado lo calcula tower-mock). */
export function acuerdosDe(cls: MockClient[], mi: number): MockAgreement[] {
  const cut = fdate(mi, corte(mi));
  const out: MockAgreement[] = [];
  cls.forEach((c) =>
    c.mes[mi].acu.forEach((a, j) => {
      const comp = fdate(mi, a.dia);
      let pag = 0;
      const pendiente = comp > cut || (comp.getTime() === cut.getTime() && a.p >= 0.52);
      if (!pendiente) {
        if (a.p < 0.52) pag = a.v;
        else if (a.p < 0.72) pag = Math.round((a.v * a.frac) / 1e6) * 1e6;
      }
      out.push({
        id: `ACU-${c.idx}-${mi}-${j}`,
        c,
        v: a.v,
        pag,
        comp,
        carga: new Date(comp.getTime() - a.carga * DAY_MS),
        reprog: a.reprog
      });
    })
  );
  return out;
}
