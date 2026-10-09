import { DAY_START_MIN, TIMELINE_BUCKET_MIN } from "../constants";
import type { ITrackPoint, IVisitsFilters, LngLat, SegmentKind } from "../types";

/* Todo el cálculo es puro y en minutos desde medianoche: `t` es el minuto que se
   mira (el cabezal de la línea de tiempo), `now` el minuto en vivo del día. */

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

/** Minúsculas y sin tildes, para que "angelica" encuentre a "Angélica". */
export const normalizeQuery = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();

/** Hay algún filtro o búsqueda activos (atenúa los clientes de asesores ocultos). */
export const hasActiveFilters = (f: IVisitsFilters, query: string) =>
  Boolean(query) || Object.values(f).some((list) => list.length > 0);

export interface ITimelineBucket {
  start: number;
  /** Asesores en cada tipo de tramo; los que no tienen puntos ahí sólo cuentan en `total`. */
  counts: Partial<Record<SegmentKind, number>>;
  total: number;
}

/** Barras de la vista general: tramo de cada asesor a mitad de cada bucket, hasta `now`. */
export function overviewBuckets<A>(
  advisors: A[],
  now: number,
  statusAt: (a: A, minute: number) => SegmentKind | null
): ITimelineBucket[] {
  const out: ITimelineBucket[] = [];
  for (let m = DAY_START_MIN; m < now; m += TIMELINE_BUCKET_MIN) {
    const mid = m + TIMELINE_BUCKET_MIN / 2;
    const counts: Partial<Record<SegmentKind, number>> = {};
    advisors.forEach((a) => {
      const status = statusAt(a, mid);
      if (status) counts[status] = (counts[status] ?? 0) + 1;
    });
    out.push({ start: m, counts, total: advisors.length });
  }
  return out;
}

export interface IAdvisorSegment {
  kind: SegmentKind;
  start: number;
  end: number;
}
