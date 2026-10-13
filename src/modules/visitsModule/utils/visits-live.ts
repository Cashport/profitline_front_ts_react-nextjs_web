import type {
  IAdvisorVisitDetail,
  ITodayVisitsLocation,
  ITodayVisitsPosition,
  ITodayVisitsUser
} from "@/types/visits/IVisits";

import { ACTIVE_STATUSES, STATUS_LABELS } from "../constants";
import type {
  AdvisorStatus,
  ILiveAdvisor,
  ILiveRun,
  ILiveState,
  ITrackPoint,
  IVisitsFilters,
  LngLat,
  SegmentKind
} from "../types";
import { normalizeQuery, positionOnTrack, type IAdvisorSegment } from "./visits-calc";
import { initialsOf, minutesOfDay } from "./visits-format";

/* Los asesores del API con la forma del mapa y la línea de tiempo: today-visits para
   el equipo y, para el abierto, su detalle del día. Estados y etiquetas van tal cual
   llegan; lo que el backend aún no envía queda en null y se pinta "XX". Como en el día
   simulado, `t` es el minuto que se mira y `now` el de ahora. */

interface IPoint extends ITrackPoint {
  state: SegmentKind;
  label: string;
  visitId: number | null;
}

/**
 * `locations` y, si es más nueva, `current_position`: los puntos del día en orden, con
 * los km acumulados. El primero trae la distancia desde uno anterior al día: los km
 * empiezan en él.
 */
function pointsOf(
  locations: ITodayVisitsLocation[],
  cur: ITodayVisitsPosition | null = null
): IPoint[] {
  const lastAt = locations.length ? minutesOfDay(locations[locations.length - 1].timestamp) : -1;
  // `current_position` no trae etiqueta.
  const reports =
    cur && minutesOfDay(cur.timestamp) > lastAt
      ? [...locations, { ...cur, state_name: STATUS_LABELS[cur.state] }]
      : locations;
  let km = 0;
  return reports.map((p, i): IPoint => {
    if (i) km += (p.distanceFromPreviousMeters ?? 0) / 1000;
    return {
      t: minutesOfDay(p.timestamp),
      position: [p.longitude, p.latitude],
      km,
      state: p.state,
      label: p.state_name,
      visitId: p.activeVisitId ?? null
    };
  });
}

/** Tramos: los puntos seguidos con el mismo estado (y la misma visita) forman uno. */
function runsOf(points: IPoint[]): ILiveRun[] {
  const runs: ILiveRun[] = [];
  let prevKey: string | null = null;
  points.forEach((p) => {
    const key = `${p.state}|${p.visitId ?? ""}`;
    if (key === prevKey) return;
    prevKey = key;
    const last = runs[runs.length - 1];
    if (last) last.end = p.t;
    runs.push({ status: p.state, label: p.label, start: p.t, end: null, position: p.position });
  });
  return runs;
}

export function toLiveAdvisor(u: ITodayVisitsUser): ILiveAdvisor {
  const points = pointsOf(u.locations, u.current_position);
  const next = u.next_visit;

  return {
    id: u.user_id,
    name: u.user.userName,
    initials: initialsOf(u.user.userName),
    status: u.state,
    statusLabel: u.state_name,
    visits: {
      total: u.total_visits,
      completed: u.completed_visits,
      failed: u.failed_visits,
      pending: u.pending_visits,
      done: u.completed_visits + u.failed_visits
    },
    next: next && {
      clientName: next.client_name,
      nit: next.client_nit,
      start: minutesOfDay(next.scheduled_start_at),
      end: minutesOfDay(next.scheduled_end_at),
      position:
        next.latitude != null && next.longitude != null ? [next.longitude, next.latitude] : null
    },
    dayStart: points[0]?.t ?? null,
    track: points,
    runs: runsOf(points),
    // Aún no llegan en today-visits.
    project: null,
    currentClient: null,
    zoneName: null,
    goal: null,
    activitiesOk: null
  };
}

/**
 * El asesor abierto, de GET /visit-admin/users/:user_id/day-detail: sus puntos son
 * `tracking.locations` (el último, la última posición conocida). La ruta no trae
 * coordenadas, así que la próxima visita va sin posición.
 */
export function toDetailAdvisor(d: IAdvisorVisitDetail): ILiveAdvisor {
  const points = pointsOf(d.tracking.locations);
  const { total, completed, failed, pending, route } = d.visits;
  const next = route.find((v) => v.status_code === "SCHEDULED");

  return {
    id: d.user_id,
    name: d.user.userName,
    initials: initialsOf(d.user.userName),
    status: d.state,
    statusLabel: d.state_name,
    visits: { total, completed, failed, pending, done: completed + failed },
    next: next
      ? {
          clientName: next.client_name,
          nit: next.client_nit,
          start: minutesOfDay(next.scheduled_start_at),
          end: minutesOfDay(next.scheduled_end_at),
          position: null
        }
      : null,
    dayStart: points[0]?.t ?? null,
    track: points,
    runs: runsOf(points),
    project: null,
    currentClient: route.find((v) => v.status_code === "IN_PROGRESS")?.client_name ?? null,
    zoneName: d.zones.join(", ") || null,
    goal: d.activities.goal,
    activitiesOk: d.activities.effective
  };
}

/** El estado del asesor (el del backend, fijo) y su tramo de puntos en el minuto `t`. */
export function liveStateAt(a: ILiveAdvisor, t: number): ILiveState {
  let run: ILiveRun | null = null;
  for (const r of a.runs) {
    if (r.start > t) break;
    run = r;
  }
  return { status: a.status, label: a.statusLabel, run };
}

/** Posición y km en `t` sobre los puntos reportados; null si aún no hay puntos. */
export const livePositionAt = (a: ILiveAdvisor, t: number) =>
  a.track.length ? positionOnTrack(a.track, t) : null;

/** Recorrido hecho hasta `t`, terminando en la posición interpolada. */
export function liveTrackUntil(a: ILiveAdvisor, t: number): LngLat[] {
  if (!a.track.length || t < a.track[0].t) return [];
  const out: LngLat[] = [];
  for (const q of a.track) {
    if (q.t > t) break;
    out.push(q.position);
  }
  out.push(positionOnTrack(a.track, t).position);
  return out;
}

/** Visitas vistas en los puntos del día (tramos en visita), en orden. */
export const liveVisitRuns = (a: ILiveAdvisor) => a.runs.filter((r) => r.status === "IN_VISIT");

/** Fase de un tramo en el minuto `t`. */
export const runPhase = (r: ILiveRun, t: number): "done" | "now" | "pending" =>
  r.start > t ? "pending" : r.end != null && r.end <= t ? "done" : "now";

/** Tramos del día hasta `now` para la línea de tiempo del asesor. */
export const liveSegments = (a: ILiveAdvisor, now: number): IAdvisorSegment[] =>
  a.runs.flatMap((r) => {
    const end = Math.min(r.end ?? now, now);
    return r.start < end ? [{ kind: r.status, start: r.start, end }] : [];
  });

/** Sin actividades en el API todavía, el ranking va por visitas efectivas y luego por nombre. */
export const rankLiveAdvisors = (advisors: ILiveAdvisor[]) =>
  advisors
    .slice()
    .sort((x, y) => y.visits.completed - x.visits.completed || x.name.localeCompare(y.name));

export interface ILiveVisibilityContext {
  filters: IVisitsFilters;
  /** Búsqueda ya normalizada con `normalizeQuery`. */
  query: string;
}

/**
 * Filtros (AND entre categorías, OR dentro) y búsqueda sobre los datos del API. Las
 * categorías cuyos datos aún no llegan (operación, zona, ciudad, cliente, resultado, y
 * proyecto mientras sea null) no coinciden con nadie. La búsqueda mira el asesor y su
 * próximo cliente, el único que llega.
 */
export function isLiveVisible(a: ILiveAdvisor, { filters: f, query }: ILiveVisibilityContext) {
  if (f.advisor.length && !f.advisor.includes(a.id)) return false;
  if (f.status.length && !f.status.includes(a.status)) return false;
  if (f.project.length && !(a.project && f.project.includes(a.project))) return false;
  if (f.operation.length || f.zone.length || f.city.length || f.client.length || f.result.length) {
    return false;
  }
  return (
    !query ||
    normalizeQuery(a.name).includes(query) ||
    (a.next != null && normalizeQuery(a.next.clientName).includes(query))
  );
}

/** Conteo por estado para los chips; ignora el propio filtro de estado. */
export function liveStatusCounts(advisors: ILiveAdvisor[], ctx: ILiveVisibilityContext) {
  const noStatus = { ...ctx, filters: { ...ctx.filters, status: [] } };
  const counts: Partial<Record<AdvisorStatus, number>> = {};
  advisors.forEach((a) => {
    if (isLiveVisible(a, noStatus)) counts[a.status] = (counts[a.status] ?? 0) + 1;
  });
  return counts;
}

export interface ILiveTeamKpis {
  active: number;
  total: number;
  visitsDone: number;
  visitsPlanned: number;
  effectivenessPct: number;
}

/** KPIs de los asesores visibles: activos según su estado; las visitas, las del día. */
export function liveTeamKpis(advisors: ILiveAdvisor[]): ILiveTeamKpis {
  const kpis: ILiveTeamKpis = {
    active: 0,
    total: advisors.length,
    visitsDone: 0,
    visitsPlanned: 0,
    effectivenessPct: 0
  };
  let effective = 0;
  advisors.forEach((a) => {
    if (ACTIVE_STATUSES.includes(a.status)) kpis.active++;
    kpis.visitsDone += a.visits.done;
    kpis.visitsPlanned += a.visits.total;
    effective += a.visits.completed;
  });
  kpis.effectivenessPct = kpis.visitsDone ? (effective / kpis.visitsDone) * 100 : 0;
  return kpis;
}
