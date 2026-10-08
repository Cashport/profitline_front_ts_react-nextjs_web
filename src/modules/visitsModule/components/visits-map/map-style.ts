import type { LayerSpecification } from "mapbox-gl";

import type { LngLat } from "../../types";

/**
 * Fuentes y capas propias. Cada estilo base (uno por tema) llega sin ellas: el mapa
 * las vuelve a agregar en cada "style.load".
 */
export const SOURCES = {
  clients: "visits-clients",
  tracks: "visits-tracks",
  plans: "visits-plans",
  focusTrack: "visits-focus-track",
  focusPlan: "visits-focus-plan"
} as const;

export const CLIENTS_LAYER = "visits-clients";

const ROUND_LINE = { "line-join": "round", "line-cap": "round" } as const;

/**
 * Capas propias, de abajo hacia arriba. Los colores van en cada feature (`color`,
 * `under`) para que el tema y el estado se resuelvan al armar los datos. Los
 * guiones se miden en anchos de línea (4px/6px sobre 1,6px; 6px/7px sobre 2,5px).
 */
export const OVERLAY_LAYERS: LayerSpecification[] = [
  {
    id: CLIENTS_LAYER,
    type: "circle",
    source: SOURCES.clients,
    paint: {
      "circle-radius": ["get", "radius"],
      "circle-color": ["get", "color"],
      "circle-opacity": ["get", "fillOpacity"],
      "circle-stroke-color": ["get", "color"],
      "circle-stroke-width": 1.5,
      "circle-stroke-opacity": ["get", "strokeOpacity"]
    }
  },
  {
    id: "visits-tracks",
    type: "line",
    source: SOURCES.tracks,
    layout: ROUND_LINE,
    paint: { "line-color": ["get", "color"], "line-width": 2, "line-opacity": 0.55 }
  },
  {
    id: "visits-plans",
    type: "line",
    source: SOURCES.plans,
    paint: {
      "line-color": ["get", "color"],
      "line-width": 1.6,
      "line-opacity": 0.55,
      "line-dasharray": [2.5, 3.75]
    }
  },
  {
    id: "visits-focus-under",
    type: "line",
    source: SOURCES.focusTrack,
    layout: ROUND_LINE,
    paint: { "line-color": ["get", "under"], "line-width": 9, "line-opacity": 0.85 }
  },
  {
    id: "visits-focus-track",
    type: "line",
    source: SOURCES.focusTrack,
    layout: ROUND_LINE,
    paint: { "line-color": ["get", "color"], "line-width": 4 }
  },
  {
    id: "visits-focus-plan",
    type: "line",
    source: SOURCES.focusPlan,
    paint: {
      "line-color": ["get", "color"],
      "line-width": 2.5,
      "line-opacity": 0.8,
      "line-dasharray": [2.4, 2.8]
    }
  }
];

/** Alias de tipo (no interfaz) para que encaje en `Record<string, unknown>`. */
export type ClientDotProperties = {
  id: number;
  color: string;
  radius: number;
  fillOpacity: number;
  strokeOpacity: number;
};

export const featureCollection = <G extends GeoJSON.Geometry, P>(
  features: GeoJSON.Feature<G, P>[]
): GeoJSON.FeatureCollection<G, P> => ({ type: "FeatureCollection", features });

/** Línea con sus colores; con menos de dos puntos no hay línea que pintar. */
export const lineFeatures = <P extends Record<string, unknown>>(
  coordinates: LngLat[],
  properties: P
): GeoJSON.Feature<GeoJSON.LineString, P>[] =>
  coordinates.length < 2
    ? []
    : [{ type: "Feature", geometry: { type: "LineString", coordinates }, properties }];

export const pointFeature = <P extends Record<string, unknown>>(
  coordinates: LngLat,
  properties: P
): GeoJSON.Feature<GeoJSON.Point, P> => ({
  type: "Feature",
  geometry: { type: "Point", coordinates },
  properties
});
