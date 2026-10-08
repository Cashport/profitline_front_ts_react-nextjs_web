/* ============================================================
   Respuesta simulada de la torre (ICollectionTower) — TEMPORAL.
   ------------------------------------------------------------
   Port de data/reglas.js del prototipo y de los cálculos que hacían sus
   componentes. Mientras el API no exista es la fuente del tablero, y es la
   definición de referencia de cada cifra para el backend: las reglas se
   pueden mover allá, pero su definición no puede cambiar.
   - Forecast = recaudo al corte + saldo de los acuerdos PENDIENTES que
     vencen antes del cierre (en mes cerrado, = recaudo). El de un grupo es
     la suma del de sus clientes.
   - Estados: Pendiente (no ha llegado la fecha, o vence hoy sin pago
     completo) · Cumplido (pagado completo) · Incumplido (venció sin pago
     completo; los parciales cuentan aquí).
   ============================================================ */
import type {
  AgreementStatus,
  ICollectionTower,
  ICollectionTowerQuery,
  ITowerAgreementsDay,
  ITowerDailyPoint,
  ITowerSeries
} from "@/types/collectionTower/ICollectionTower";
import {
  CANALES,
  COORDINADORES,
  CUR,
  DAY_MS,
  EJECUTIVOS,
  GERENCIAS,
  MOCK_CLIENTS,
  MOCK_CUTOFF,
  MOCK_MONTHS,
  TRAMOS,
  acuerdosDe,
  corte,
  fdate,
  leadTime,
  pagosPNA,
  splitPago,
  sum
} from "../mocked-data";
import type { MockAgreement, MockClient, TramoFactor } from "../mocked-data";

/* Colores: uno por estado, elegidos para leerse en los dos temas (el
   prototipo usaba #011722 para "Pendiente" en claro, que en oscuro desaparece). */
const SERIES: Record<
  "collected" | "pendingAgreements" | "brokenAgreements" | "applied" | "unapplied",
  ITowerSeries
> = {
  collected: { key: "collected", label: "Recaudo", color: "#FF5500" },
  pendingAgreements: { key: "pendingAgreements", label: "Acuerdos pendientes", color: "#8B949B" },
  brokenAgreements: { key: "brokenAgreements", label: "Incumplidos", color: "#EB5A5B" },
  applied: { key: "applied", label: "Aplicado", color: "#7393B3" },
  unapplied: { key: "unapplied", label: "Sin aplicar (PNA)", color: "#13B5C4" }
};

const AGREEMENT_STATUSES: (ITowerSeries & { key: AgreementStatus })[] = [
  { key: "FULFILLED", label: "Cumplido", color: "#CBE71E" },
  { key: "BROKEN", label: "Incumplido", color: "#EB5A5B" },
  { key: "PENDING", label: "Pendiente", color: "#8B949B" }
];

const AGING_COLORS = ["#CBE71E", "#F5C542", "#FF9A3C", "#FF6A13", "#E0245E", "#B0124A"];

/** El selector ofrece los últimos 6 meses; los anteriores sólo dan historia. */
const FIRST_SELECTABLE = MOCK_MONTHS.length - 6;

const MES_N = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre"
];

const pad = (n: number) => String(n).padStart(2, "0");
const isoDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
/** Fecha y hora sin zona: el navegador la lee como hora local, igual que el prototipo. */
const isoDateTime = (d: Date) => `${isoDate(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
const periodKey = (mi: number) => `${MOCK_MONTHS[mi].y}-${pad(MOCK_MONTHS[mi].m + 1)}`;
const periodLabel = (mi: number) => {
  const name = MES_N[MOCK_MONTHS[mi].m];
  return `${name[0].toUpperCase()}${name.slice(1)} ${MOCK_MONTHS[mi].y}`;
};

const E = Object.fromEntries(EJECUTIVOS.map((x) => [x.id, x]));
const C = Object.fromEntries(COORDINADORES.map((x) => [x.id, x]));

function median(a: number[]): number {
  const b = a.filter(isFinite).sort((x, y) => x - y);
  const n = b.length;
  if (!n) return NaN;
  return n % 2 ? b[(n - 1) / 2] : (b[n / 2 - 1] + b[n / 2]) / 2;
}

/* ---------- acuerdos ---------- */

interface Agreement extends MockAgreement {
  st: AgreementStatus;
  saldo: number;
  atraso: number;
}

function estadoAcuerdo(a: MockAgreement, cut: Date): AgreementStatus {
  if (a.comp > cut) return "PENDING";
  if (a.pag >= a.v) return "FULFILLED";
  if (a.comp.getTime() === cut.getTime()) return "PENDING";
  return "BROKEN";
}

function acuerdos(cls: MockClient[], mi: number): Agreement[] {
  const cut = fdate(mi, corte(mi));
  return acuerdosDe(cls, mi).map((a) => {
    const st = estadoAcuerdo(a, cut);
    return {
      ...a,
      st,
      saldo: a.v - a.pag,
      atraso: st === "BROKEN" ? Math.round((cut.getTime() - a.comp.getTime()) / DAY_MS) : 0
    };
  });
}

/* ---------- filtros ---------- */

interface MockFilters {
  mi: number;
  g: string;
  c: string;
  e: string;
  kam: string;
  q: string;
  tramo: number | null;
  sel: { k: string; st: AgreementStatus | null }[];
}

function filtrarClientes(S: MockFilters): MockClient[] {
  const q = S.q.trim().toLowerCase();
  return MOCK_CLIENTS.filter((c) => {
    const e = E[c.e];
    const co = C[e.c];
    if (S.e && c.e !== S.e) return false;
    if (S.kam && c.kam !== S.kam) return false;
    if (S.c && e.c !== S.c) return false;
    if (S.g && co.g !== S.g) return false;
    if (q && !(c.n.toLowerCase().includes(q) || c.nit.includes(q))) return false;
    return true;
  });
}

const factorTramo =
  (tramo: number | null): TramoFactor =>
  (c, mi) =>
    tramo == null ? 1 : c.mes[mi].sh[tramo];

/* ---------- análisis del mes ---------- */

interface Serie {
  /** Recaudo acumulado por día. */
  s: number[];
  meta: number;
  dim: number;
}

function serieMes(cls: MockClient[], mi: number, tf: TramoFactor): Serie {
  const M = MOCK_MONTHS[mi];
  const s = new Array<number>(M.dim).fill(0);
  let meta = 0;
  cls.forEach((c) => {
    const x = c.mes[mi];
    const f = tf(c, mi);
    meta += x.meta * f;
    let acc = 0;
    for (let d = 0; d < M.dim; d++) {
      acc += x.dia[d] * f;
      s[d] += acc;
    }
  });
  return { s, meta, dim: M.dim };
}

interface Analisis {
  cur: Serie;
  D: number;
  dim: number;
  actual: number;
  meta: number;
  forecast: number;
  medAcum: number[];
  /** Proyección [día, acumulado] del corte al cierre. */
  proy: [number, number][];
  prev: Serie | null;
  hist: Serie[];
  cumpl: number;
  cAvg3: number;
  /** Ritmo: fracción del mes que un mes típico ya lleva al día de corte. */
  pace: number;
}

/** Recaudo acumulado, meta, mediana de 6 meses y proyección del mes (que luego reescala forecastPorAcuerdos). */
function analizar(cls: MockClient[], mi: number, tf: TramoFactor): Analisis {
  const cur = serieMes(cls, mi, tf);
  const D = corte(mi);
  const dim = cur.dim;
  const actual = cur.s[D - 1] || 0;
  const hist: Serie[] = [];
  for (let h = mi - 1; h >= Math.max(0, mi - 6); h--) hist.push(serieMes(cls, h, tf));
  const at = (h: Serie, t: number) => h.s[Math.min(t, h.dim) - 1];
  const medShare: number[] = [];
  const medAcum: number[] = [];
  for (let t = 1; t <= dim; t++) {
    medShare.push(
      t === dim
        ? 1
        : median(
            hist.map((h) => {
              const f = h.s[h.dim - 1];
              return f ? at(h, t) / f : NaN;
            })
          )
    );
    medAcum.push(median(hist.map((h) => at(h, t))));
  }
  const ms = D >= dim ? 1 : Math.max(medShare[D - 1] || 0, 0.2);
  const forecast = D >= dim ? actual : actual / ms;
  const proy: [number, number][] = [];
  for (let t = D; t <= dim; t++) {
    const k = 1 - ms > 0.001 ? (Math.min(medShare[t - 1], 1) - ms) / (1 - ms) : 1;
    proy.push([t, actual + (forecast - actual) * Math.max(0, Math.min(1, k))]);
  }
  const cumplAt = (h: Serie) => (h.meta ? at(h, D) / h.meta : NaN);
  const c3 = hist.slice(0, 3);
  return {
    cur,
    D,
    dim,
    actual,
    meta: cur.meta,
    forecast,
    medAcum,
    proy,
    prev: hist[0] || null,
    hist,
    cumpl: cur.meta ? actual / cur.meta : 0,
    cAvg3: c3.length ? sum(c3, cumplAt) / c3.length : NaN,
    pace: medShare[D - 1] || 0
  };
}

/**
 * FORECAST = recaudo al corte + saldo de los acuerdos PENDIENTES que vencen
 * antes del cierre. En meses cerrados, forecast = recaudo. Reescala la
 * proyección para que termine en el forecast.
 */
function forecastPorAcuerdos(A: Analisis, acu: Agreement[], mi: number): Analisis {
  if (A.D >= A.dim) return A;
  const fin = fdate(mi, MOCK_MONTHS[mi].dim);
  const fc = A.actual + sum(acu.filter((a) => a.st === "PENDING" && a.comp <= fin), (a) => a.saldo);
  const old = A.forecast;
  const n = A.proy.length - 1;
  A.proy =
    old > A.actual + 1
      ? A.proy.map(([t, v]): [number, number] => [
          t,
          A.actual + ((v - A.actual) * (fc - A.actual)) / (old - A.actual)
        ])
      : A.proy.map(([t], i): [number, number] => [t, A.actual + (fc - A.actual) * (n ? i / n : 1)]);
  A.forecast = fc;
  return A;
}

/** Recaudo de cada día hasta el corte, partido en [aplicado, PNA]. */
function diario(cls: MockClient[], mi: number, tf: TramoFactor): [number, number][] {
  const D = corte(mi);
  const out: [number, number][] = [];
  for (let d = 1; d <= D; d++) out.push([0, 0]);
  cls.forEach((c) => {
    const f = tf(c, mi);
    for (let d = 1; d <= D; d++) {
      const v = c.mes[mi].dia[d - 1] * f;
      const s = splitPago(c, mi, d);
      out[d - 1][0] += v * s[0];
      out[d - 1][1] += v * s[1];
    }
  });
  return out;
}

/** Llave del día de compromiso de un acuerdo ("prev" / "post" si cae fuera del mes). */
const llaveDia = (mi: number) => {
  const d1 = fdate(mi, 1);
  const last = fdate(mi, MOCK_MONTHS[mi].dim);
  return (a: MockAgreement) => (a.comp < d1 ? "prev" : a.comp > last ? "post" : isoDate(a.comp));
};

const coincideSel = (sel: MockFilters["sel"], key: string, st: AgreementStatus) =>
  sel.some((x) => x.k === key && (!x.st || x.st === st));

/** Todo lo de la torre para unos filtros. El forecast total es la SUMA del de cada cliente. */
function calcularTorre(S: MockFilters) {
  const mi = S.mi;
  const tf = factorTramo(S.tramo);
  const clsBase = filtrarClientes(S);
  const acuBase = acuerdos(clsBase, mi);
  let cls = clsBase;
  let acu = acuBase;
  if (S.sel.length) {
    const k = llaveDia(mi);
    acu = acuBase.filter((a) => coincideSel(S.sel, k(a), a.st));
    const cs = new Set(acu.map((a) => a.c));
    cls = clsBase.filter((c) => cs.has(c));
  }
  const A = forecastPorAcuerdos(analizar(cls, mi, tf), acu, mi);
  const AC = cls.map((c) => ({
    c,
    A: forecastPorAcuerdos(
      analizar([c], mi, tf),
      acu.filter((a) => a.c === c),
      mi
    )
  }));
  if (A.D < A.dim && AC.length) {
    const tot = sum(AC, (x) => x.A.forecast);
    const old = A.forecast;
    const k = (tot - A.actual) / (old - A.actual || 1);
    A.forecast = tot;
    A.proy = A.proy.map(([t, v]): [number, number] => [t, A.actual + (v - A.actual) * k]);
  }
  return { tf, cls, acu, acuBase, A, AC, dia: diario(cls, mi, tf), pna: pagosPNA(cls, mi, tf) };
}

/* ---------- respuesta ---------- */

const periodIndex = (key: string | null) => {
  const i = MOCK_MONTHS.findIndex((_, mi) => mi >= FIRST_SELECTABLE && periodKey(mi) === key);
  return i >= 0 ? i : CUR;
};

/** Lo que mandaría GET /collection/tower/project/:id para estos filtros. */
export function buildTowerMock(query: ICollectionTowerQuery): ICollectionTower {
  const mi = periodIndex(query.period);
  const tramo = TRAMOS.findIndex((t) => t.key === query.aging);
  const T = calcularTorre({
    mi,
    g: query.management ?? "",
    c: query.coordinator ?? "",
    e: query.executive ?? "",
    kam: query.channel ?? "",
    q: query.search,
    tramo: tramo >= 0 ? tramo : null,
    sel: query.segments.map((s) => ({ k: s.date, st: s.status }))
  });
  const { A, acu, cls, dia, pna } = T;
  const M = MOCK_MONTHS[mi];
  const D = A.D;
  const dim = A.dim;
  const open = D < dim;
  const cut = fdate(mi, D);
  const fin = fdate(mi, dim);

  // Lead time: días promedio (ponderado por valor) entre la entrada del pago y su aplicación.
  const ltOf = (m: number): [number, number] => {
    if (m < 0) return [NaN, NaN];
    let num = 0;
    let den = 0;
    let fast = 0;
    const Dm = m === mi ? D : MOCK_MONTHS[m].dim;
    cls.forEach((c) => {
      const f = T.tf(c, m);
      const l = leadTime(c, m);
      for (let d = 1; d <= Dm; d++) {
        const v = c.mes[m].dia[d - 1] * f * splitPago(c, m, d)[0];
        num += v * l;
        den += v;
        if (l <= 2) fast += v;
      }
    });
    return [den ? num / den : NaN, den ? fast / den : NaN];
  };
  const [lt, le2] = ltOf(mi);
  const [ltPrev] = ltOf(mi - 1);
  const finite = (x: number) => (isFinite(x) ? x : null);

  // Recaudo por tramo: no aplica el filtro de tramo (los demás tramos se atenúan, no desaparecen).
  const comp = [0, 0, 0, 0, 0, 0];
  cls.forEach((c) => {
    const x = c.mes[mi];
    let a = 0;
    for (let d = 0; d < D; d++) a += x.dia[d];
    x.sh.forEach((s, k) => {
      comp[k] += a * s;
    });
  });

  const daily: ITowerDailyPoint[] = Array.from({ length: dim }, (_, i) => {
    const t = i + 1;
    const p = A.proy.find((x) => x[0] === t);
    const med = A.medAcum[t - 1];
    return {
      day: t,
      date: isoDate(fdate(mi, t)),
      applied: t <= D ? dia[t - 1][0] : null,
      unapplied: t <= D ? dia[t - 1][1] : null,
      cumulative: t <= D ? A.cur.s[t - 1] : null,
      projected: open && p ? p[1] : null,
      median6m: A.hist.length && isFinite(med) ? med : null,
      previousMonth: A.prev ? A.prev.s[Math.min(t, A.prev.dim) - 1] : null
    };
  });

  // Acuerdos por día del mes: sin el filtro de segmentos, para que el gráfico conserve todas sus barras.
  const key = llaveDia(mi);
  const acuMes = T.acuBase.filter((a) => a.comp.getMonth() === M.m && a.comp.getFullYear() === M.y);
  const agreementsByDay: ITowerAgreementsDay[] = daily.map(({ date }) => {
    const delDia = acuMes.filter((a) => key(a) === date);
    const values: ITowerAgreementsDay["values"] = {};
    AGREEMENT_STATUSES.forEach(({ key: st }) => {
      const g = delDia.filter((a) => a.st === st);
      if (g.length) values[st] = { amount: sum(g, (a) => a.v), count: g.length };
    });
    return { date, values };
  });

  const pendienteAntesDeCierre = (a: Agreement) => a.st === "PENDING" && a.comp <= fin;

  return {
    cutoffAt: open
      ? isoDateTime(new Date(M.y, M.m, D, MOCK_CUTOFF.hour, MOCK_CUTOFF.minute))
      : isoDateTime(new Date(M.y, M.m, dim, 23, 59)),
    period: { key: periodKey(mi), label: periodLabel(mi), days: dim, cutoffDay: D, open },
    periods: MOCK_MONTHS.map((_, i) => i)
      .filter((i) => i >= FIRST_SELECTABLE)
      .map((i) => ({ key: periodKey(i), label: periodLabel(i) })),
    catalogs: {
      managements: GERENCIAS.map((g) => ({ id: g.id, name: g.n })),
      coordinators: COORDINADORES.map((c) => ({ id: c.id, name: c.n, managementId: c.g })),
      executives: EJECUTIVOS.map((e) => ({ id: e.id, name: e.n, coordinatorId: e.c })),
      channels: CANALES.map((k) => ({ id: k.id, name: k.n })),
      clients: MOCK_CLIENTS.map((c) => ({
        id: c.id,
        name: c.n,
        nit: c.nit,
        executiveId: c.e,
        channelId: c.kam
      }))
    },
    summary: {
      collected: A.actual,
      goal: A.meta,
      forecast: A.forecast,
      complianceAvg3: finite(A.cAvg3),
      pendingAgreements: sum(acu.filter(pendienteAntesDeCierre), (a) => a.saldo),
      brokenAgreements: sum(
        acu.filter((a) => a.st === "BROKEN"),
        (a) => a.saldo
      ),
      series: {
        collected: SERIES.collected,
        pendingAgreements: SERIES.pendingAgreements,
        brokenAgreements: SERIES.brokenAgreements
      }
    },
    application: {
      leadTimeDays: finite(lt),
      previousLeadTimeDays: finite(ltPrev),
      appliedWithin2Days: finite(le2),
      series: { applied: SERIES.applied, unapplied: SERIES.unapplied }
    },
    agingBuckets: TRAMOS.map((t, k) => ({
      key: t.key,
      label: t.label,
      color: AGING_COLORS[k],
      amount: comp[k]
    })),
    daily,
    agreementStatuses: AGREEMENT_STATUSES,
    agreementsByDay,
    agreements: acu.map((a) => ({
      id: a.id,
      clientId: a.c.id,
      dueDate: isoDate(a.comp),
      loadedAt: isoDate(a.carga),
      reschedules: a.reprog,
      status: a.st,
      agreed: a.v,
      paid: a.pag,
      balance: a.saldo,
      lateDays: a.atraso,
      daysToDue: Math.round((a.comp.getTime() - cut.getTime()) / DAY_MS)
    })),
    clients: T.AC.map(({ c, A: Ac }) => {
      const own = acu.filter((a) => a.c === c);
      const vencidos = own.filter((a) => a.st !== "PENDING");
      return {
        clientId: c.id,
        collected: Ac.actual,
        goal: Ac.meta,
        forecast: Ac.forecast,
        pace: open ? Ac.pace : 1,
        pendingAgreements: sum(own.filter(pendienteAntesDeCierre), (a) => a.saldo),
        brokenAgreements: sum(
          own.filter((a) => a.st === "BROKEN"),
          (a) => a.saldo
        ),
        overdueAgreed: sum(vencidos, (a) => a.v),
        overduePaid: sum(vencidos, (a) => a.pag),
        overdueCount: vencidos.length
      };
    }),
    unappliedPayments: pna.map((x) => ({
      id: x.id,
      clientId: x.c.id,
      paidAt: isoDateTime(x.f),
      amount: x.v,
      pendingHours: x.hrs,
      url: null
    }))
  };
}
