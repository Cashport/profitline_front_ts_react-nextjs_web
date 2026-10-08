"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl, {
  type GeoJSONSource,
  type Map as MapLibreMap,
  type Marker,
  type PaddingOptions,
  type Popup
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import { MAP_CENTER, MAP_ZOOM, RESULT_LABELS, statusLabel } from "../../constants";
import type {
  AdvisorItem,
  IAdvisorVisit,
  IVisitsAdvisor,
  IVisitsClient,
  IVisitsLayers,
  IVisitsPalette,
  LngLat,
  VisitsCameraRequest
} from "../../types";
import {
  effectiveTime,
  okActivities,
  pendingVisits,
  positionAt,
  stateAt,
  trackUntil,
  visitPhase,
  visitsOf
} from "../../utils/visits-calc";
import { fmtClock } from "../../utils/visits-format";
import {
  applyAdvisorMarkerState,
  applyStopState,
  createAdvisorMarkerElement,
  createStartMarkerElement,
  createStopMarkerElement,
  tooltipContent,
  type AdvisorMarkerHandles
} from "./map-markers";
import MapOverlays from "./map-overlays";
import {
  BASEMAP_LAYERS,
  CLIENTS_LAYER,
  OVERLAY_LAYERS,
  SOURCES,
  buildBaseStyle,
  featureCollection,
  lineFeatures,
  pointFeature,
  type ClientDotProperties
} from "./map-style";

interface VisitsMapProps {
  advisors: IVisitsAdvisor[];
  clients: IVisitsClient[];
  /** Quién visita a cada cliente hoy. */
  owners: Map<number, { advisor: IVisitsAdvisor; visit: IAdvisorVisit }>;
  t: number;
  isLive: boolean;
  /** Asesores que pasan filtros y búsqueda. */
  visibleIds: Set<number>;
  filtersActive: boolean;
  selectedId: number | null;
  hoveredId: number | null;
  /** Primero del ranking general. */
  leaderId: number | null;
  layers: IVisitsLayers;
  palette: IVisitsPalette;
  isDark: boolean;
  future: boolean;
  camera: VisitsCameraRequest;
  onSelectAdvisor: (id: number, focus?: LngLat) => void;
  onJumpToItem: (item: AdvisorItem) => void;
  onToggleLayer: (key: keyof IVisitsLayers) => void;
}

const FIT_ALL_PADDING: PaddingOptions = { top: 60, bottom: 40, left: 24, right: 24 };

/**
 * Mapa de Visitas con MapLibre (la misma API de mapbox-gl 1.x que usa TMS, sin
 * token). Se crea una sola vez; cada cuadro sólo actualiza los datos de las
 * fuentes GeoJSON y la posición y clase de los marcadores.
 */
export default function VisitsMap(props: VisitsMapProps) {
  const {
    advisors,
    clients,
    owners,
    t,
    isLive,
    visibleIds,
    filtersActive,
    selectedId,
    hoveredId,
    leaderId,
    layers,
    palette,
    isDark,
    camera,
    onToggleLayer
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const popupRef = useRef<Popup | null>(null);
  const advisorMarkers = useRef(
    new Map<number, { marker: Marker; handles: AdvisorMarkerHandles }>()
  );
  const stopMarkers = useRef<{ el: HTMLDivElement; visit: IAdvisorVisit }[]>([]);
  const [ready, setReady] = useState(false);

  // Los eventos del mapa se registran una sola vez: leen siempre las props vigentes.
  const latest = useRef(props);
  useEffect(() => {
    latest.current = props;
  });

  const showTooltip = (at: LngLat, title: string, detail: string | undefined, offset: number) => {
    const map = mapRef.current;
    const popup = popupRef.current;
    if (!map || !popup) return;
    popup.setLngLat(at).setOffset(offset).setDOMContent(tooltipContent(title, detail));
    // addTo sobre un popup abierto lo quita y lo vuelve a montar: sólo se agrega una vez.
    if (!popup.isOpen()) popup.addTo(map);
  };
  const hideTooltip = () => popupRef.current?.remove();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const map = new maplibregl.Map({
      container,
      style: buildBaseStyle(latest.current.isDark),
      center: MAP_CENTER,
      zoom: MAP_ZOOM,
      // Teselas con <img>: el CSP (src/middleware.ts) permite img-src https: pero no
      // abre connect-src a CARTO, que es lo que usaría fetch (el modo por defecto).
      refreshExpiredTiles: false,
      attributionControl: { compact: true },
      dragRotate: false,
      pitchWithRotate: false,
      touchPitch: false
    });
    map.touchZoomRotate.disableRotation();
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");
    popupRef.current = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      anchor: "bottom",
      className: "visits-popup",
      maxWidth: "260px"
    });

    map.on("load", () => {
      Object.values(SOURCES).forEach((id) =>
        map.addSource(id, { type: "geojson", data: featureCollection([]) })
      );
      OVERLAY_LAYERS.forEach((layer) => map.addLayer(layer));

      map.on("mousemove", CLIENTS_LAYER, (e) => {
        const id = Number(e.features?.[0]?.properties?.id);
        const { clients: allClients, owners: allOwners } = latest.current;
        const client = allClients.find((c) => c.id === id);
        if (!client) return;
        map.getCanvas().style.cursor = "pointer";
        const owner = allOwners.get(id);
        showTooltip(
          client.position,
          client.name,
          `${client.code} · ${owner ? owner.advisor.name : "sin programar hoy"}`,
          8
        );
      });
      map.on("mouseleave", CLIENTS_LAYER, () => {
        map.getCanvas().style.cursor = "";
        hideTooltip();
      });
      map.on("click", CLIENTS_LAYER, (e) => {
        const owner = latest.current.owners.get(Number(e.features?.[0]?.properties?.id));
        if (owner) latest.current.onSelectAdvisor(owner.advisor.id, owner.visit.client.position);
      });

      setReady(true);
    });

    // El contenedor cambia de tamaño sin que cambie la ventana (p. ej. al plegar el menú).
    const resize = new ResizeObserver(() => map.resize());
    resize.observe(container);
    mapRef.current = map;

    return () => {
      resize.disconnect();
      popupRef.current?.remove();
      map.remove();
      mapRef.current = null;
      setReady(false);
    };
  }, []);

  // Tema: sólo cambia qué mapa base se ve.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    map.setLayoutProperty(BASEMAP_LAYERS.light, "visibility", isDark ? "none" : "visible");
    map.setLayoutProperty(BASEMAP_LAYERS.dark, "visibility", isDark ? "visible" : "none");
  }, [ready, isDark]);

  // Un marcador por asesor; se rehacen al cambiar de día.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const markers = advisorMarkers.current;
    advisors.forEach((a) => {
      const handles = createAdvisorMarkerElement(a.initials);
      handles.root.addEventListener("click", (ev) => {
        ev.stopPropagation();
        latest.current.onSelectAdvisor(a.id);
      });
      handles.root.addEventListener("mouseenter", () => {
        const entry = markers.get(a.id);
        if (!entry) return;
        const s = stateAt(a, latest.current.t);
        const client = s.item?.type === "visita" ? ` · ${s.item.client.name}` : "";
        const detail = `${statusLabel(s.status, latest.current.future)}${client}`;
        const { lng, lat } = entry.marker.getLngLat();
        showTooltip([lng, lat], a.name, detail, 18);
      });
      handles.root.addEventListener("mouseleave", hideTooltip);
      const marker = new maplibregl.Marker({ element: handles.root, anchor: "center" })
        .setLngLat(a.base)
        .addTo(map);
      markers.set(a.id, { marker, handles });
    });
    return () => {
      markers.forEach(({ marker }) => marker.remove());
      markers.clear();
      hideTooltip();
    };
  }, [advisors]);

  // Paradas numeradas y punto de inicio del asesor enfocado.
  useEffect(() => {
    const map = mapRef.current;
    const focused = advisors.find((a) => a.id === selectedId);
    if (!map || !focused) return;
    const markers: Marker[] = [];
    const stops = visitsOf(focused).map((visit, k) => {
      const { root, body } = createStopMarkerElement(k + 1);
      root.addEventListener("click", (ev) => {
        ev.stopPropagation();
        latest.current.onJumpToItem(visit);
      });
      root.addEventListener("mouseenter", () => {
        const phase = visitPhase(visit, effectiveTime(focused, latest.current.t));
        const detail =
          phase === "done"
            ? `${fmtClock(visit.start)}–${fmtClock(visit.end)} · ${RESULT_LABELS[visit.result]}`
            : phase === "now"
              ? `En curso desde ${fmtClock(visit.start)}`
              : `ETA ${fmtClock(visit.start)}`;
        showTooltip(visit.client.position, visit.client.name, detail, 14);
      });
      root.addEventListener("mouseleave", hideTooltip);
      markers.push(
        new maplibregl.Marker({ element: root, anchor: "center" })
          .setLngLat(visit.client.position)
          .addTo(map)
      );
      // El estado se pinta en `body`: escribir clases en `root` borraría la de MapLibre.
      return { el: body, visit };
    });
    const startEl = createStartMarkerElement();
    startEl.addEventListener("mouseenter", () =>
      showTooltip(focused.base, "Punto de inicio", undefined, 10)
    );
    startEl.addEventListener("mouseleave", hideTooltip);
    markers.push(
      new maplibregl.Marker({ element: startEl, anchor: "center" })
        .setLngLat(focused.base)
        .addTo(map)
    );
    stopMarkers.current = stops;
    return () => {
      markers.forEach((m) => m.remove());
      stopMarkers.current = [];
      hideTooltip();
    };
  }, [advisors, selectedId]);

  // Cada cuadro: posiciones, clases y datos de las fuentes.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    const focused = advisors.find((a) => a.id === selectedId) ?? null;
    const setData = (id: string, data: GeoJSON.FeatureCollection) =>
      map.getSource<GeoJSONSource>(id)?.setData(data);

    advisors.forEach((a) => {
      const entry = advisorMarkers.current.get(a.id);
      if (!entry) return;
      const status = stateAt(a, t).status;
      entry.marker.setLngLat(positionAt(a, effectiveTime(a, t)).position);
      applyAdvisorMarkerState(entry.handles, {
        color: palette.status[status],
        selected: selectedId === a.id,
        hovered: hoveredId === a.id,
        lost: status === "sinsenal",
        pulse: isLive && (status === "visita" || status === "transito"),
        count: okActivities(a, t),
        leader: leaderId === a.id
      });
      const opacity = focused ? (focused.id === a.id ? 1 : 0.28) : visibleIds.has(a.id) ? 1 : 0.18;
      entry.marker.setOpacity(String(opacity));
      entry.handles.root.style.zIndex =
        selectedId === a.id ? "3" : hoveredId === a.id ? "2" : "";
    });

    // Vista de equipo: recorrido hecho y plan pendiente de los asesores visibles.
    const overview = focused ? [] : advisors.filter((a) => visibleIds.has(a.id));
    setData(
      SOURCES.tracks,
      featureCollection(
        layers.track
          ? overview.flatMap((a) => lineFeatures(trackUntil(a, t), { color: palette.ink3 }))
          : []
      )
    );
    setData(
      SOURCES.plans,
      featureCollection(
        layers.plan
          ? overview.flatMap((a) =>
              stateAt(a, t).status === "fin"
                ? []
                : lineFeatures(
                    [
                      positionAt(a, effectiveTime(a, t)).position,
                      ...pendingVisits(a, t).map((v) => v.client.position)
                    ],
                    { color: palette.ink2 }
                  )
            )
          : []
      )
    );

    // Clientes: color del resultado, verde de marca en visita, anillo si está pendiente.
    const dots = clients.flatMap((c) => {
      const owner = owners.get(c.id);
      let color = palette.ink3;
      let fill = 0.35;
      let radius = 3;
      if (owner) {
        const phase = visitPhase(owner.visit, effectiveTime(owner.advisor, t));
        if (phase === "done") {
          color = palette.result[owner.visit.result];
          fill = 0.95;
          radius = 4.5;
        } else if (phase === "now") {
          color = palette.accent;
          fill = 1;
          radius = 5.5;
        } else {
          color = palette.bone;
          fill = 0;
          radius = 4;
        }
      }
      const matches = !filtersActive || (owner && visibleIds.has(owner.advisor.id));
      const opacity = focused || !layers.clients ? 0 : matches ? 1 : 0.12;
      if (!opacity) return [];
      return [
        pointFeature<ClientDotProperties>(c.position, {
          id: c.id,
          color,
          radius,
          fillOpacity: fill * opacity,
          strokeOpacity: opacity * 0.95
        })
      ];
    });
    setData(SOURCES.clients, featureCollection(dots));

    // Asesor enfocado: su recorrido con contorno, lo que falta y el estado de cada parada.
    if (focused) {
      const te = effectiveTime(focused, t);
      setData(
        SOURCES.focusTrack,
        featureCollection(
          lineFeatures(trackUntil(focused, t), { color: palette.accent, under: palette.under })
        )
      );
      setData(
        SOURCES.focusPlan,
        featureCollection(
          stateAt(focused, t).status === "fin"
            ? []
            : lineFeatures(
                [
                  positionAt(focused, te).position,
                  ...pendingVisits(focused, t).map((v) => v.client.position)
                ],
                { color: palette.ink }
              )
        )
      );
      stopMarkers.current.forEach(({ el, visit }) =>
        applyStopState(el, visitPhase(visit, te), palette.result[visit.result])
      );
    } else {
      setData(SOURCES.focusTrack, featureCollection([]));
      setData(SOURCES.focusPlan, featureCollection([]));
    }
  }, [
    ready,
    advisors,
    clients,
    owners,
    t,
    isLive,
    visibleIds,
    filtersActive,
    selectedId,
    hoveredId,
    leaderId,
    layers,
    palette
  ]);

  // Cámara: encuadrar el equipo, un asesor o volar a un punto.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    // El primer encuadre es inmediato; los demás se animan.
    const duration = camera.id === 0 ? 0 : 800;
    const fit = (points: LngLat[], padding: number | PaddingOptions) => {
      if (!points.length) return;
      const bounds = points.reduce(
        (b, p) => b.extend(p),
        new maplibregl.LngLatBounds(points[0], points[0])
      );
      map.fitBounds(bounds, { padding, duration, maxZoom: 16 });
    };

    if (camera.kind === "fly-to") {
      map.flyTo({ center: camera.center, zoom: 16, duration: 700 });
    } else if (camera.kind === "fit-advisor") {
      const a = advisors.find((x) => x.id === camera.advisorId);
      if (a) fit([a.base, ...visitsOf(a).map((v) => v.client.position)], 70);
    } else {
      const points = advisors
        .filter((a) => visibleIds.has(a.id))
        .flatMap((a) => visitsOf(a).map((v) => v.client.position));
      fit(points.length ? points : clients.map((c) => c.position), FIT_ALL_PADDING);
    }
  }, [ready, camera.id]);

  return (
    <div className="visits-map relative h-full min-h-0 w-full overflow-hidden rounded-2xl border border-border bg-secondary">
      {/* MapLibre fuerza position: relative en su contenedor (.maplibregl-map), que le gana a
          `absolute inset-0` y lo deja en 0px: el tamaño sale del contenedor padre. */}
      <div ref={containerRef} className="h-full w-full" />
      <MapOverlays
        layers={layers}
        onToggleLayer={onToggleLayer}
        focused={selectedId != null}
        palette={palette}
      />
    </div>
  );
}
