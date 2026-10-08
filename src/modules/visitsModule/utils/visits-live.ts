import type { ITodayVisitsUser } from "@/types/visits/IVisits";

import { ACTIVE_STATUSES, API_STATUS, STATUS_LABELS } from "../constants";
import type {
  AdvisorStatus,
  ILiveAdvisor,
  ILiveRun,
  ILiveState,
  ITrackPoint,
  IVisitsFilters,
  LngLat
} from "../types";
import {
  normalizeQuery,
  positionOnTrack,
  type IAdvisorSegment,
  type SegmentKind
} from "./visits-calc";
import { initialsOf, minutesOfDay } from "./visits-format";

/* GET /visit-admin/today-visits → forma de la pantalla. Lo que no llega tal cual sale
   de los puntos de `locations`; lo que el backend aún no envía queda en null y se pinta
   "XX". Como en el día simulado, `t` es el minuto que se mira y `now` el de ahora. */

const statusOf = (state: string): AdvisorStatus => API_STATUS[state] ?? "nostart";

interface IPoint {
  t: number;
  position: LngLat;
  state: string;
  label: string;
  /** Metros desde el punto anterior. */
  meters: number;
  visitId: number | null;
}

/** `locations` y, si es más nueva, `current_position`: los puntos del día en orden. */
function pointsOf(u: ITodayVisitsUser): IPoint[] {
  const points = u.locations.map((p): IPoint => ({
    t: minutesOfDay(p.timestamp),
    position: [p.longitude, p.latitude],
    state: p.state,
    label: p.state_name,
    meters: p.distanceFromPreviousMeters ?? 0,
    visitId: p.activeVisitId ?? null
  }));
  const cur = u.current_position;
  const last = points[points.length - 1];
  if (cur && (!last || minutesOfDay(cur.timestamp) > last.t)) {
    points.push({
      t: minutesOfDay(cur.timestamp),
      position: [cur.longitude, cur.latitude],
      state: cur.state,
      label: cur.state === u.state ? u.state_name : STATUS_LABELS[statusOf(cur.state)],
      meters: cur.distanceFromPreviousMeters ?? 0,
      visitId: cur.activeVisitId ?? null
    });
  }
  return points;
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
    runs.push({
      status: statusOf(p.state),
      label: p.label,
      start: p.t,
      end: null,
      position: p.position
    });
  });
  return runs;
}

export function toLiveAdvisor(u: ITodayVisitsUser): ILiveAdvisor {
  const points = pointsOf(u);
  // El primer punto trae la distancia desde uno anterior al día: los km empiezan en él.
  let km = 0;
  const track = points.map((p, i): ITrackPoint => {
    if (i) km += p.meters / 1000;
    return { t: p.t, position: p.position, km };
  });
  const next = u.next_visit;

  return {
    id: u.user_id,
    name: u.user.userName,
    initials: initialsOf(u.user.userName),
    status: statusOf(u.state),
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
    track,
    runs: runsOf(points),
    // Aún no llegan del backend.
    code: null,
    zoneName: null,
    project: null,
    goal: null,
    activitiesOk: null,
    battery: null,
    gpsAccuracy: null,
    currentClient: null
  };
}

/** Estado en el minuto `t`: el del tramo en curso. Antes del primer punto, sin iniciar. */
export function liveStateAt(a: ILiveAdvisor, t: number): ILiveState {
  // Sin puntos no hay tiempos: vale el estado que manda el backend.
  if (!a.runs.length) return { status: a.status, label: a.statusLabel, run: null };
  let run: ILiveRun | null = null;
  for (const r of a.runs) {
    if (r.start > t) break;
    run = r;
  }
  return run
    ? { status: run.status, label: run.label, run }
    : { status: "nostart", label: STATUS_LABELS.nostart, run: null };
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

/** Último punto reportado hasta `t`. */
export function liveSignalAt(a: ILiveAdvisor, t: number): number | null {
  let last: number | null = null;
  for (const q of a.track) {
    if (q.t > t) break;
    last = q.t;
  }
  return last;
}

/** Visitas vistas en los puntos del día (tramos en visita), en orden. */
export const liveVisitRuns = (a: ILiveAdvisor) => a.runs.filter((r) => r.status === "visita");

/** Fase de un tramo en el minuto `t`. */
export const runPhase = (r: ILiveRun, t: number): "done" | "now" | "pending" =>
  r.start > t ? "pending" : r.end != null && r.end <= t ? "done" : "now";

const SEGMENT_KINDS: AdvisorStatus[] = ["visita", "transito", "pausa", "sinsenal"];
const isSegmentKind = (s: AdvisorStatus): s is SegmentKind => SEGMENT_KINDS.includes(s);

/** Tramos del día hasta `now` para la línea de tiempo del asesor. */
export const liveSegments = (a: ILiveAdvisor, now: number): IAdvisorSegment[] =>
  a.runs.flatMap((r) => {
    const end = Math.min(r.end ?? now, now);
    return isSegmentKind(r.status) && r.start < end ? [{ kind: r.status, start: r.start, end }] : [];
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
export function isLiveVisible(
  a: ILiveAdvisor,
  status: AdvisorStatus,
  { filters: f, query }: ILiveVisibilityContext
) {
  if (f.advisor.length && !f.advisor.includes(a.id)) return false;
  if (f.status.length && !f.status.includes(status)) return false;
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

/** Conteo por estado en `t` para los chips; ignora el propio filtro de estado. */
export function liveStatusCounts(advisors: ILiveAdvisor[], t: number, ctx: ILiveVisibilityContext) {
  const noStatus = { ...ctx, filters: { ...ctx.filters, status: [] } };
  const counts: Partial<Record<AdvisorStatus, number>> = {};
  advisors.forEach((a) => {
    const { status } = liveStateAt(a, t);
    if (isLiveVisible(a, status, noStatus)) counts[status] = (counts[status] ?? 0) + 1;
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

/** KPIs de los asesores visibles: activos en `t`; las visitas son las del día completo. */
export function liveTeamKpis(advisors: ILiveAdvisor[], t: number): ILiveTeamKpis {
  const kpis: ILiveTeamKpis = {
    active: 0,
    total: advisors.length,
    visitsDone: 0,
    visitsPlanned: 0,
    effectivenessPct: 0
  };
  let effective = 0;
  advisors.forEach((a) => {
    if (ACTIVE_STATUSES.includes(liveStateAt(a, t).status)) kpis.active++;
    kpis.visitsDone += a.visits.done;
    kpis.visitsPlanned += a.visits.total;
    effective += a.visits.completed;
  });
  kpis.effectivenessPct = kpis.visitsDone ? (effective / kpis.visitsDone) * 100 : 0;
  return kpis;
}
