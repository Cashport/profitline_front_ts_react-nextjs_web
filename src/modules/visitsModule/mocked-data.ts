/* =========================================================================
   DATOS SIMULADOS — SE REEMPLAZAN POR EL API
   Mantienen la forma que debe devolver el backend (IVisitsDay). Se generan
   con una semilla por fecha: el mismo día siempre trae los mismos asesores,
   recorridos y actividades, y cada día es distinto. Porta el generador del
   prototipo "Visitas Cashport" (Bogotá, 6 zonas, 18 asesores, 204 clientes).
   ========================================================================= */

import type { Dayjs } from "dayjs";

import { PROJECT_ORDER } from "./constants";
import type {
  AdvisorItem,
  IAdvisorActivity,
  IAdvisorVisit,
  ITrackPoint,
  IVisitsAdvisor,
  IVisitsClient,
  IVisitsDay,
  IVisitsZone,
  LngLat,
  VisitResult
} from "./types";
import { initialsOf } from "./utils/visits-format";

/** Hora simulada de "ahora" para el día de hoy: cuando llegue el API será el reloj real. */
export const MOCK_NOW_MINUTES = 14 * 60 + 20;

/** El generador trabaja en [lat, lng] como el prototipo; la salida va en [lng, lat]. */
type LatLng = [number, number];
const toLngLat = (p: LatLng): LngLat => [p[1], p[0]];

const ZONE_SEEDS: { id: string; name: string; city?: string; center: LatLng }[] = [
  { id: "norte", name: "Norte", center: [4.713, -74.042] },
  { id: "suba", name: "Suba", center: [4.742, -74.083] },
  { id: "chap", name: "Chapinero", center: [4.651, -74.061] },
  { id: "occ", name: "Occidente", center: [4.68, -74.126] },
  { id: "centro", name: "Centro", center: [4.604, -74.083] },
  { id: "sur", name: "Sur", city: "Soacha", center: [4.62, -74.152] }
];

const CLIENT_PREFIXES = [
  "Ferretería",
  "Droguería",
  "Distribuidora",
  "Supermercado",
  "Almacén",
  "Panadería",
  "Miscelánea",
  "Autoservicio",
  "Depósito",
  "Tienda",
  "Cacharrería",
  "Surtidora"
];

const CLIENT_SUFFIXES = [
  "La Esperanza",
  "El Progreso",
  "Santa Fe",
  "Los Alpes",
  "La Cabaña",
  "El Dorado",
  "San Martín",
  "Nueva Granada",
  "La Floresta",
  "El Retiro",
  "Villa Luz",
  "Las Américas",
  "El Paraíso",
  "Santa Lucía",
  "La Colina",
  "San Jorge",
  "Los Andes",
  "La 80",
  "El Cóndor",
  "Primavera",
  "La Estrella",
  "Don Jaime",
  "Doña Rosa",
  "El Triunfo",
  "Mi Barrio",
  "La Económica",
  "El Porvenir",
  "Central",
  "Galerías",
  "Modelo"
];

const ADVISOR_NAMES = [
  "Alejandra Quintero",
  "Jorge Cárdenas",
  "Luisa Fernanda Rey",
  "Esteban Mejía",
  "Sara Villamil",
  "Diego Alarcón",
  "Tatiana Guzmán",
  "Nicolás Parra",
  "Marcela Duarte",
  "Iván Castaño",
  "Lorena Pinzón",
  "Hernán Bustos",
  "Catalina Rozo",
  "Fabián Ospina",
  "Angélica Mora",
  "Cristian Ávila",
  "Yuliana Cruz",
  "Wilson Garzón"
];

/** Asesores de punto fijo: pasan el día en un solo cliente. */
const FIXED_ADVISOR_IDS = [2, 7, 12, 16];
const CLIENTS_PER_ZONE = 34;
const ADVISORS_PER_ZONE = 3;

/** mulberry32: aleatorio con semilla, idéntico en cualquier motor de JS. */
function seededRandom(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Random = ReturnType<typeof seededRandom>;

/** Fisher–Yates; `sort(() => R() - .5)` del prototipo depende del motor de JS. */
function shuffle<T>(items: T[], random: Random): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Distancia aproximada en km entre dos puntos [lat, lng] cercanos (Bogotá). */
const distanceKm = (a: LatLng, b: LatLng) => Math.hypot(a[0] - b[0], (a[1] - b[1]) * 0.997) * 111.2;

interface InternalClient {
  client: IVisitsClient;
  latLng: LatLng;
}

const ZONES: IVisitsZone[] = ZONE_SEEDS.map((z) => ({
  id: z.id,
  name: z.name,
  city: z.city ?? "Bogotá D.C.",
  center: toLngLat(z.center)
}));

/** Los clientes no cambian entre días: semilla fija. */
const INTERNAL_CLIENTS: InternalClient[] = (() => {
  const random = seededRandom(20260929);
  const pick = <T>(list: T[]) => list[Math.floor(random() * list.length)];
  const used = new Set<string>();
  const out: InternalClient[] = [];
  ZONE_SEEDS.forEach((z) => {
    for (let i = 0; i < CLIENTS_PER_ZONE; i++) {
      let name: string;
      do {
        name = `${pick(CLIENT_PREFIXES)} ${pick(CLIENT_SUFFIXES)}`;
      } while (used.has(name));
      used.add(name);
      const latLng: LatLng = [
        z.center[0] + (random() - 0.5) * 0.05,
        z.center[1] + (random() - 0.5) * 0.05
      ];
      const id = out.length;
      out.push({
        latLng,
        client: { id, code: `CL-${10240 + id * 7}`, name, zoneId: z.id, position: toLngLat(latLng) }
      });
    }
  });
  return out;
})();

/**
 * Tramo de recorrido de `a` a `b` entre t0 y t1: pasa por una esquina (como
 * siguiendo calles), con un punto cada ~1,2 min y un poco de ruido de GPS.
 */
function pushSegment(
  a: LatLng,
  b: LatLng,
  t0: number,
  t1: number,
  out: { t: number; p: LatLng }[],
  random: Random
) {
  const corner: LatLng = random() < 0.5 ? [a[0], b[1]] : [b[0], a[1]];
  const mid: LatLng = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const c: LatLng = [corner[0] * 0.55 + mid[0] * 0.45, corner[1] * 0.55 + mid[1] * 0.45];
  const n = Math.max(4, Math.round((t1 - t0) / 1.2));
  const l1 = distanceKm(a, c);
  const l2 = distanceKm(c, b);
  const total = l1 + l2 || 1;
  for (let i = 1; i <= n; i++) {
    const f = i / n;
    const d = f * total;
    let p: LatLng;
    if (d <= l1) {
      const g = l1 ? d / l1 : 1;
      p = [a[0] + (c[0] - a[0]) * g, a[1] + (c[1] - a[1]) * g];
    } else {
      const g = (d - l1) / (l2 || 1);
      p = [c[0] + (b[0] - c[0]) * g, c[1] + (b[1] - c[1]) * g];
    }
    // El último punto cae exacto en el destino.
    const jitter = i < n ? 0.00035 : 0;
    out.push({
      t: t0 + (t1 - t0) * f,
      p: [p[0] + (random() - 0.5) * jitter, p[1] + (random() - 0.5) * jitter]
    });
  }
}

function buildAdvisor(
  idx: number,
  zone: (typeof ZONE_SEEDS)[number],
  pool: InternalClient[],
  random: Random,
  isToday: boolean
): IVisitsAdvisor {
  const name = ADVISOR_NAMES[idx];
  const fixed = FIXED_ADVISOR_IDS.includes(idx);
  const visitsCount = pool.length;

  const base: LatLng = [
    zone.center[0] + (random() - 0.5) * 0.03,
    zone.center[1] + (random() - 0.5) * 0.03
  ];

  // Ruta del día: siempre al cliente más cercano que falte.
  const plan: InternalClient[] = [];
  const rest = pool.slice();
  let cur = base;
  while (rest.length) {
    rest.sort((x, y) => distanceKm(cur, x.latLng) - distanceKm(cur, y.latLng));
    const next = rest.shift() as InternalClient;
    plan.push(next);
    cur = next.latLng;
  }

  const battery = 35 + Math.floor(random() * 60);
  const gpsAccuracy = 4 + Math.floor(random() * 12);
  // Casos fijos de hoy: uno abre tarde, otro perdió la señal y otro alarga el almuerzo.
  const late = isToday && idx === 10;
  const lastPing = isToday && idx === 4 ? 13 * 60 + 38 : undefined;

  let t = late ? 15 * 60 + 10 : 7 * 60 + 10 + random() * 110;
  const dayStart = t;
  let pos = base;
  let lunchTaken = fixed;
  const items: AdvisorItem[] = [];
  const rawTrack: { t: number; p: LatLng }[] = [{ t, p: base }];

  plan.forEach(({ client, latLng }) => {
    if (!lunchTaken && t >= 12 * 60 + 5) {
      const d = isToday && idx === 13 ? 80 : 35 + random() * 20;
      items.push({ type: "pausa", start: t, end: t + d, position: toLngLat(pos) });
      rawTrack.push({ t: t + d, p: pos });
      t += d;
      lunchTaken = true;
    }
    const outside = random() < 0.09;
    const checkIn: LatLng = outside
      ? [
          latLng[0] + (random() < 0.5 ? 1 : -1) * (0.0017 + random() * 0.0015),
          latLng[1] + (random() - 0.5) * 0.002
        ]
      : latLng;
    const travel = distanceKm(pos, checkIn) * 3.1 + 6 + random() * 8;
    pushSegment(pos, checkIn, t, t + travel, rawTrack, random);
    t += travel;
    const duration = fixed
      ? 16 * 60 + 30 + random() * 40 - t
      : random() < 0.1
        ? 60 + random() * 25
        : 15 + random() * 32;
    const rv = random();
    const result: VisitResult = rv < 0.72 ? "efectiva" : rv < 0.87 ? "reprogramada" : "sincontacto";
    items.push({
      type: "visita",
      client,
      start: t,
      end: t + duration,
      checkIn: toLngLat(checkIn),
      result,
      outsideGeofence: outside,
      offsetMeters: outside ? Math.round(distanceKm(checkIn, latLng) * 1000) : 0
    });
    rawTrack.push({ t: t + duration, p: checkIn });
    t += duration;
    pos = checkIn;
  });

  const visits = items.filter((i): i is IAdvisorVisit => i.type === "visita");
  const activities: IAdvisorActivity[] = [];
  let goal: number;
  if (fixed) {
    const v = visits[0];
    let g = v.start + 12;
    while (g < v.end) {
      activities.push({ t: g, ok: random() < 0.58 });
      g += 7 + random() * 22;
    }
    goal = 26 + Math.floor(random() * 10);
  } else {
    visits.forEach((v) => {
      const q =
        v.result === "efectiva"
          ? 1 + Math.floor(random() * 2)
          : v.result === "reprogramada" && random() < 0.4
            ? 1
            : 0;
      for (let j = 0; j < q; j++) {
        const at = v.start + (v.end - v.start) * (0.4 + 0.55 * random());
        activities.push({ t: at, ok: v.result === "efectiva" ? random() < 0.85 : random() < 0.3 });
      }
    });
    goal = Math.round(visitsCount * 1.3);
  }
  activities.sort((a, b) => a.t - b.t);

  // La mitad tiene un tramo sin señal ya recuperado; hoy sólo si ya pasó.
  const signalGaps: [number, number][] = [];
  if (random() < 0.5) {
    const a = dayStart + 50 + random() * 320;
    const b = a + 12 + random() * 40;
    if (!isToday || b < MOCK_NOW_MINUTES - 5) signalGaps.push([a, b]);
  }

  let km = 0;
  const track: ITrackPoint[] = rawTrack.map((q, i) => {
    if (i) km += distanceKm(rawTrack[i - 1].p, q.p);
    return { t: q.t, position: toLngLat(q.p), km };
  });

  return {
    id: idx,
    name,
    initials: initialsOf(name),
    code: `AS-${301 + idx}`,
    zoneId: zone.id,
    project: PROJECT_ORDER[idx % PROJECT_ORDER.length],
    fixed,
    base: toLngLat(base),
    dayStart,
    goal,
    items,
    track,
    activities,
    signalGaps,
    lastPing,
    battery,
    gpsAccuracy
  };
}

/** Día simulado; `isToday` activa los casos fijos de hoy (inicio tarde, sin señal, pausa larga). */
export function buildMockVisitsDay(date: Dayjs, isToday: boolean): IVisitsDay {
  const random = seededRandom(Number(date.format("YYYYMMDD")));
  const advisors: IVisitsAdvisor[] = [];

  ZONE_SEEDS.forEach((zone, zi) => {
    const pool = shuffle(
      INTERNAL_CLIENTS.filter((c) => c.client.zoneId === zone.id),
      random
    );
    let offset = 0;
    for (let k = 0; k < ADVISORS_PER_ZONE; k++) {
      const idx = zi * ADVISORS_PER_ZONE + k;
      const count = FIXED_ADVISOR_IDS.includes(idx) ? 1 : 7 + Math.floor(random() * 4);
      advisors.push(buildAdvisor(idx, zone, pool.slice(offset, offset + count), random, isToday));
      offset += count;
    }
  });

  return {
    date: date.format("YYYY-MM-DD"),
    zones: ZONES,
    clients: INTERNAL_CLIENTS.map((c) => c.client),
    advisors
  };
}
