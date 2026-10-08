import {
  ACTIVITY_HOURS,
  DAY_START_MIN,
  PROJECTION_END_MIN,
  TIMELINE_BUCKET_MIN
} from "../constants";
import type {
  AdvisorStatus,
  DayMode,
  IAdvisorState,
  IAdvisorVisit,
  ITrackPoint,
  IVisitsAdvisor,
  IVisitsFilters,
  LngLat
} from "../types";

/* Todo el cálculo es puro y en minutos desde medianoche: `t` es el minuto que se
   mira (el cabezal de la línea de tiempo), `now` el minuto en vivo del día. */

const visitsCache = new WeakMap<IVisitsAdvisor, IAdvisorVisit[]>();

/** Visitas del asesor, en orden (sin pausas). */
export const visitsOf = (a: IVisitsAdvisor): IAdvisorVisit[] => {
  let visits = visitsCache.get(a);
  if (!visits) {
    visits = a.items.filter((i): i is IAdvisorVisit => i.type === "visita");
    visitsCache.set(a, visits);
  }
  return visits;
};

/** Minuto hasta el que se conoce al asesor: sin señal, todo se congela en la última. */
export const effectiveTime = (a: IVisitsAdvisor, t: number) =>
  a.lastPing ? Math.min(t, a.lastPing) : t;

/** Posición y km recorridos en el minuto `t`, interpolando el recorrido. */
export const positionAt = (a: IVisitsAdvisor, t: number) => positionOnTrack(a.track, t);

/** Posición y km en el minuto `t` sobre un recorrido con al menos un punto. */
export function positionOnTrack(track: ITrackPoint[], t: number): { position: LngLat; km: number } {
  if (t <= track[0].t) return { position: track[0].position, km: 0 };
  for (let i = 1; i < track.length; i++) {
    const q = track[i];
    if (q.t < t) continue;
    const p = track[i - 1];
    const f = (t - p.t) / (q.t - p.t || 1);
    return {
      position: [
        p.position[0] + (q.position[0] - p.position[0]) * f,
        p.position[1] + (q.position[1] - p.position[1]) * f
      ],
      km: p.km + (q.km - p.km) * f
    };
  }
  const last = track[track.length - 1];
  return { position: last.position, km: last.km };
}

export function stateAt(a: IVisitsAdvisor, t: number): IAdvisorState {
  if (t < a.dayStart) return { status: "nostart" };
  const itemAt = (m: number) => a.items.find((i) => i.start <= m && m < i.end);
  if (a.lastPing && t > a.lastPing) {
    return { status: "sinsenal", item: itemAt(a.lastPing), signalLostAt: a.lastPing };
  }
  // Tramo sin señal ya recuperado: se informa desde su inicio (el prototipo mostraba NaN aquí).
  const gap = a.signalGaps.find(([g0, g1]) => t >= g0 && t < g1);
  if (gap) return { status: "sinsenal", item: itemAt(gap[0]), signalLostAt: gap[0] };
  const item = itemAt(t);
  if (item) return { status: item.type === "pausa" ? "pausa" : "visita", item };
  const next = visitsOf(a).find((v) => v.start > t);
  return next ? { status: "transito", next } : { status: "fin" };
}

/** Visitas ya cerradas en el minuto `t`. */
export const completedVisits = (a: IVisitsAdvisor, t: number) => {
  const te = effectiveTime(a, t);
  return visitsOf(a).filter((v) => v.end <= te);
};

/** Actividades exitosas registradas hasta `t`. */
export const okActivities = (a: IVisitsAdvisor, t: number) => {
  const te = effectiveTime(a, t);
  return a.activities.filter((g) => g.ok && g.t <= te).length;
};

/** Todas las actividades registradas hasta `t`, exitosas o no. */
export const registeredActivities = (a: IVisitsAdvisor, t: number) => {
  const te = effectiveTime(a, t);
  return a.activities.filter((g) => g.t <= te).length;
};

/** Recorrido hecho hasta `t`, terminando en la posición interpolada. */
export function trackUntil(a: IVisitsAdvisor, t: number): LngLat[] {
  const te = effectiveTime(a, t);
  const out: LngLat[] = [];
  for (const q of a.track) {
    if (q.t > te) break;
    out.push(q.position);
  }
  if (te >= a.dayStart) out.push(positionAt(a, te).position);
  return out;
}

/** Visitas que faltan por empezar en `t`: el plan pendiente. */
export const pendingVisits = (a: IVisitsAdvisor, t: number) => {
  const te = effectiveTime(a, t);
  return visitsOf(a).filter((v) => v.start > te);
};

/** Ranking: más actividades exitosas, luego mayor avance sobre la meta, luego nombre. */
export const rankAdvisors = (advisors: IVisitsAdvisor[], t: number) =>
  advisors
    .map((a) => ({ a, ok: okActivities(a, t) }))
    .sort(
      (x, y) =>
        y.ok - x.ok || y.ok / y.a.goal - x.ok / x.a.goal || x.a.name.localeCompare(y.a.name)
    )
    .map(({ a }) => a);

/** Minúsculas y sin tildes, para que "angelica" encuentre a "Angélica". */
export const normalizeQuery = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();

export interface IVisibilityContext {
  filters: IVisitsFilters;
  /** Búsqueda ya normalizada con `normalizeQuery`. */
  query: string;
  t: number;
  cityByZone: Record<string, string>;
}

/** Filtros con AND entre categorías y OR dentro de cada una; la búsqueda mira asesor y clientes. */
export function isAdvisorVisible(
  a: IVisitsAdvisor,
  status: AdvisorStatus,
  { filters: f, query, t, cityByZone }: IVisibilityContext
) {
  if (f.zone.length && !f.zone.includes(a.zoneId)) return false;
  if (f.city.length && !f.city.includes(cityByZone[a.zoneId])) return false;
  if (f.advisor.length && !f.advisor.includes(a.id)) return false;
  if (f.project.length && !f.project.includes(a.project)) return false;
  if (f.operation.length && !f.operation.includes(a.fixed ? "fijo" : "ruta")) return false;
  if (f.status.length && !f.status.includes(status)) return false;
  if (f.client.length && !visitsOf(a).some((v) => f.client.includes(v.client.id))) return false;
  if (f.result.length && !completedVisits(a, t).some((v) => f.result.includes(v.result))) {
    return false;
  }
  if (
    query &&
    !normalizeQuery(a.name).includes(query) &&
    !visitsOf(a).some((v) => normalizeQuery(v.client.name).includes(query))
  ) {
    return false;
  }
  return true;
}

/** Hay algún filtro o búsqueda activos (atenúa los clientes de asesores ocultos). */
export const hasActiveFilters = (f: IVisitsFilters, query: string) =>
  Boolean(query) || Object.values(f).some((list) => list.length > 0);

/** Conteo por estado para los chips; ignora el propio filtro de estado. */
export function statusCounts(advisors: IVisitsAdvisor[], ctx: IVisibilityContext) {
  const noStatus = { ...ctx, filters: { ...ctx.filters, status: [] } };
  const counts: Partial<Record<AdvisorStatus, number>> = {};
  advisors.forEach((a) => {
    const { status } = stateAt(a, ctx.t);
    if (isAdvisorVisible(a, status, noStatus)) counts[status] = (counts[status] ?? 0) + 1;
  });
  return counts;
}

export interface ITimelineBucket {
  start: number;
  counts: Partial<Record<AdvisorStatus, number>>;
  total: number;
}

/** Barras de la vista general: estado de cada asesor a mitad de cada tramo, hasta `now`. */
export function overviewBuckets<A>(
  advisors: A[],
  now: number,
  statusAt: (a: A, minute: number) => AdvisorStatus
): ITimelineBucket[] {
  const out: ITimelineBucket[] = [];
  for (let m = DAY_START_MIN; m < now; m += TIMELINE_BUCKET_MIN) {
    const mid = m + TIMELINE_BUCKET_MIN / 2;
    const counts: Partial<Record<AdvisorStatus, number>> = {};
    advisors.forEach((a) => {
      const status = statusAt(a, mid);
      counts[status] = (counts[status] ?? 0) + 1;
    });
    out.push({ start: m, counts, total: advisors.length });
  }
  return out;
}

export type SegmentKind = "visita" | "transito" | "pausa" | "sinsenal";

export interface IAdvisorSegment {
  kind: SegmentKind;
  start: number;
  end: number;
}

/** Tramos del día de un asesor hasta `now`, para su línea de tiempo. */
export function advisorSegments(a: IVisitsAdvisor, now: number): IAdvisorSegment[] {
  const te = effectiveTime(a, now);
  const out: IAdvisorSegment[] = [];
  let cur = a.dayStart;
  a.items.forEach((i) => {
    if (i.start > te) return;
    if (i.start > cur) out.push({ kind: "transito", start: cur, end: Math.min(i.start, te) });
    out.push({
      kind: i.type === "pausa" ? "pausa" : "visita",
      start: i.start,
      end: Math.min(i.end, te)
    });
    cur = i.end;
  });
  if (cur < te) out.push({ kind: "transito", start: cur, end: te });
  if (a.lastPing && a.lastPing < now) out.push({ kind: "sinsenal", start: a.lastPing, end: now });
  a.signalGaps.forEach(([g0, g1]) => {
    if (g0 < te) out.push({ kind: "sinsenal", start: g0, end: Math.min(g1, te) });
  });
  return out;
}

export interface IHourlyActivity {
  hour: number;
  count: number;
  /** La hora aún no empieza en `t`. */
  future: boolean;
}

/** Actividades exitosas por hora (7:00 a 17:00) hasta `t`. */
export function hourlyActivities(a: IVisitsAdvisor, t: number): IHourlyActivity[] {
  const te = effectiveTime(a, t);
  return ACTIVITY_HOURS.map((hour) => ({
    hour,
    count: a.activities.filter((g) => g.ok && g.t <= te && g.t >= hour * 60 && g.t < hour * 60 + 60)
      .length,
    future: hour * 60 > te
  }));
}

export interface IDayProjection {
  ok: number;
  /** Actividades exitosas por hora trabajada. */
  rate: number;
  projected: number;
  pctGoal: number;
  /** Ancho de la proyección sobre la meta, tope 100. */
  pctProjectedBar: number;
}

/** Ritmo y proyección al cierre (17:30): ok + ritmo × horas que quedan. */
export function dayProjection(
  a: IVisitsAdvisor,
  t: number,
  status: AdvisorStatus,
  dayMode: DayMode
): IDayProjection {
  const te = effectiveTime(a, t);
  const ok = okActivities(a, t);
  const worked = Math.max(0, te - a.dayStart);
  const rate = worked > 20 ? ok / (worked / 60) : 0;
  const finished =
    status === "fin" || (status === "nostart" && te < a.dayStart && dayMode !== "today");
  const left = finished ? 0 : Math.max(0, PROJECTION_END_MIN - Math.max(te, a.dayStart));
  const projected = Math.round(ok + (rate * left) / 60);
  return {
    ok,
    rate,
    projected,
    pctGoal: Math.round((ok / a.goal) * 100),
    pctProjectedBar: Math.min(100, (projected / a.goal) * 100)
  };
}

/** Fase de una visita en el minuto `te` (ya ajustado por señal). */
export const visitPhase = (v: IAdvisorVisit, te: number): "done" | "now" | "pending" =>
  v.end <= te ? "done" : v.start <= te ? "now" : "pending";

/** Quién visita a cada cliente hoy (cada cliente tiene a lo sumo un asesor). */
export function clientOwners(advisors: IVisitsAdvisor[]) {
  const owners = new Map<number, { advisor: IVisitsAdvisor; visit: IAdvisorVisit }>();
  advisors.forEach((advisor) =>
    visitsOf(advisor).forEach((visit) => owners.set(visit.client.id, { advisor, visit }))
  );
  return owners;
}
