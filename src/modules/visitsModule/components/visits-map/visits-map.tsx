"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl, {
  type GeoJSONSource,
  type Map as MapLibreMap,
  type MapLayerMouseEvent,
  type Marker,
  type PaddingOptions,
  type Popup
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import { MAP_CENTER, MAP_ZOOM, MISSING } from "../../constants";
import type {
  ILiveAdvisor,
  ILiveRun,
  IVisitsLayers,
  IVisitsPalette,
  LngLat,
  VisitsCameraRequest
} from "../../types";
import { fmtClock } from "../../utils/visits-format";
import {
  livePositionAt,
  liveStateAt,
  liveTrackUntil,
  liveVisitRuns,
  runPhase
} from "../../utils/visits-live";
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
  /** Asesores del día según el API; vacío en los días que aún no llegan. */
  advisors: ILiveAdvisor[];
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
  camera: VisitsCameraRequest;
  /** Aviso sobre el mapa cuando el día no trae datos. */
  notice: string | null;
  onSelectAdvisor: (id: number, focus?: LngLat) => void;
  onJumpToRun: (run: ILiveRun) => void;
  onFlyTo: (center: LngLat) => void;
  onToggleLayer: (key: keyof IVisitsLayers) => void;
}

type Phase = "done" | "now" | "pending";

/** Lugar de una visita: dónde se hizo según los puntos, o la próxima si trae coordenadas. */
interface IVisitPlace {
  advisor: ILiveAdvisor;
  position: LngLat;
  phase: Phase;
  title: string;
  detail: string;
}

/** Visitas del asesor como lugares en el minuto `t`; de las hechas aún no llega el cliente. */
function visitPlaces(a: ILiveAdvisor, t: number): IVisitPlace[] {
  const places: IVisitPlace[] = liveVisitRuns(a).map((run) => ({
    advisor: a,
    position: run.position,
    phase: runPhase(run, t),
    title: MISSING,
    detail: `${MISSING} · ${a.name}`
  }));
  if (a.next?.position) {
    places.push({
      advisor: a,
      position: a.next.position,
      phase: "pending",
      title: a.next.clientName,
      detail: `${a.next.nit} · ${a.name}`
    });
  }
  return places;
}

/** Lo que falta: de la posición en `t` a la próxima visita, si trae coordenadas. */
function planLine(a: ILiveAdvisor, t: number, color: string) {
  const at = livePositionAt(a, t);
  return at && a.next?.position ? lineFeatures([at.position, a.next.position], { color }) : [];
}

/** Lo que entra en el encuadre de un asesor: su recorrido y la próxima visita. */
const framePoints = (a: ILiveAdvisor): LngLat[] => [
  ...a.track.map((q) => q.position),
  ...(a.next?.position ? [a.next.position] : [])
];

const FIT_ALL_PADDING: PaddingOptions = { top: 60, bottom: 40, left: 24, right: 24 };

/**
 * Mapa de Visitas con MapLibre (la misma API de mapbox-gl 1.x que usa TMS, sin
 * token). Se crea una sola vez; cada cuadro sólo actualiza los datos de las
 * fuentes GeoJSON y la posición y clase de los marcadores. Todo sale de los puntos
 * que reporta cada asesor (`locations` del API), interpolados en el minuto `t`.
 */
export default function VisitsMap(props: VisitsMapProps) {
  const {
    advisors,
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
    notice,
    onToggleLayer
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const popupRef = useRef<Popup | null>(null);
  const advisorMarkers = useRef(
    new Map<number, { marker: Marker; handles: AdvisorMarkerHandles }>()
  );
  const stopMarkers = useRef<{ el: HTMLDivElement; phaseAt: (t: number) => Phase }[]>([]);
  /** Lugares de visita pintados: los eventos de la capa los buscan por su índice. */
  const places = useRef<IVisitPlace[]>([]);
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

      const placeAt = (e: MapLayerMouseEvent) =>
        places.current[Number(e.features?.[0]?.properties?.id)];
      map.on("mousemove", CLIENTS_LAYER, (e) => {
        const place = placeAt(e);
        if (!place) return;
        map.getCanvas().style.cursor = "pointer";
        showTooltip(place.position, place.title, place.detail, 8);
      });
      map.on("mouseleave", CLIENTS_LAYER, () => {
        map.getCanvas().style.cursor = "";
        hideTooltip();
      });
      map.on("click", CLIENTS_LAYER, (e) => {
        const place = placeAt(e);
        if (place) latest.current.onSelectAdvisor(place.advisor.id, place.position);
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

  // Un marcador por asesor con puntos; se rehacen cuando cambian los datos.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const markers = advisorMarkers.current;
    advisors.forEach((a) => {
      if (!a.track.length) return;
      const handles = createAdvisorMarkerElement(a.initials);
      handles.root.addEventListener("click", (ev) => {
        ev.stopPropagation();
        latest.current.onSelectAdvisor(a.id);
      });
      handles.root.addEventListener("mouseenter", () => {
        const entry = markers.get(a.id);
        if (!entry) return;
        const s = liveStateAt(a, latest.current.t);
        const client = s.status === "visita" ? ` · ${a.currentClient ?? MISSING}` : "";
        const { lng, lat } = entry.marker.getLngLat();
        showTooltip([lng, lat], a.name, `${s.label}${client}`, 18);
      });
      handles.root.addEventListener("mouseleave", hideTooltip);
      const marker = new maplibregl.Marker({ element: handles.root, anchor: "center" })
        .setLngLat(a.track[0].position)
        .addTo(map);
      markers.set(a.id, { marker, handles });
    });
    return () => {
      markers.forEach(({ marker }) => marker.remove());
      markers.clear();
      hideTooltip();
    };
  }, [advisors]);

  // Visitas numeradas, la próxima y el punto de inicio del asesor enfocado.
  useEffect(() => {
    const map = mapRef.current;
    const focused = advisors.find((a) => a.id === selectedId);
    if (!map || !focused?.track.length) return;
    const markers: Marker[] = [];
    const addMarker = (el: HTMLElement, at: LngLat) => {
      const marker = new maplibregl.Marker({ element: el, anchor: "center" }).setLngLat(at);
      markers.push(marker.addTo(map));
    };

    const visitRuns = liveVisitRuns(focused);
    const stops = visitRuns.map((run, k) => {
      const { root, body } = createStopMarkerElement(k + 1);
      root.addEventListener("click", (ev) => {
        ev.stopPropagation();
        latest.current.onJumpToRun(run);
      });
      root.addEventListener("mouseenter", () => {
        const phase = runPhase(run, latest.current.t);
        const detail =
          phase === "done"
            ? `${fmtClock(run.start)}–${fmtClock(run.end ?? run.start)} · ${MISSING}`
            : phase === "now"
              ? `En curso desde ${fmtClock(run.start)}`
              : `Desde ${fmtClock(run.start)}`;
        showTooltip(run.position, MISSING, detail, 14);
      });
      root.addEventListener("mouseleave", hideTooltip);
      addMarker(root, run.position);
      // El estado se pinta en `body`: escribir clases en `root` borraría la de MapLibre.
      return { el: body, phaseAt: (m: number) => runPhase(run, m) };
    });

    const next = focused.next;
    if (next?.position) {
      const at = next.position;
      const { root, body } = createStopMarkerElement(visitRuns.length + 1);
      root.addEventListener("click", (ev) => {
        ev.stopPropagation();
        latest.current.onFlyTo(at);
      });
      root.addEventListener("mouseenter", () =>
        showTooltip(at, next.clientName, `ETA ${fmtClock(next.start)}`, 14)
      );
      root.addEventListener("mouseleave", hideTooltip);
      addMarker(root, at);
      stops.push({ el: body, phaseAt: () => "pending" });
    }

    const start = focused.track[0].position;
    const startEl = createStartMarkerElement();
    startEl.addEventListener("mouseenter", () =>
      showTooltip(start, "Punto de inicio", undefined, 10)
    );
    startEl.addEventListener("mouseleave", hideTooltip);
    addMarker(startEl, start);

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
      const at = livePositionAt(a, t);
      if (!entry || !at) return;
      const { status } = liveStateAt(a, t);
      entry.marker.setLngLat(at.position);
      applyAdvisorMarkerState(entry.handles, {
        color: palette.status[status],
        selected: selectedId === a.id,
        hovered: hoveredId === a.id,
        lost: status === "sinsenal",
        pulse: isLive && (status === "visita" || status === "transito"),
        count: a.activitiesOk,
        leader: leaderId === a.id
      });
      const opacity = focused ? (focused.id === a.id ? 1 : 0.28) : visibleIds.has(a.id) ? 1 : 0.18;
      entry.marker.setOpacity(String(opacity));
      entry.handles.root.style.zIndex =
        selectedId === a.id ? "3" : hoveredId === a.id ? "2" : "";
    });

    // Vista de equipo: recorrido hecho y lo que falta hasta la próxima visita.
    const overview = focused ? [] : advisors.filter((a) => visibleIds.has(a.id));
    setData(
      SOURCES.tracks,
      featureCollection(
        layers.track
          ? overview.flatMap((a) => lineFeatures(liveTrackUntil(a, t), { color: palette.ink3 }))
          : []
      )
    );
    setData(
      SOURCES.plans,
      featureCollection(layers.plan ? overview.flatMap((a) => planLine(a, t, palette.ink2)) : [])
    );

    // Lugares de visita: verde de marca la que está en curso y anillo la pendiente. Las
    // hechas van en gris mientras no llegue su resultado.
    places.current = advisors.flatMap((a) => visitPlaces(a, t));
    const dots = places.current.flatMap((p, id) => {
      const matches = !filtersActive || visibleIds.has(p.advisor.id);
      const opacity = focused || !layers.clients ? 0 : matches ? 1 : 0.12;
      if (!opacity) return [];
      const style =
        p.phase === "done"
          ? { color: palette.ink3, radius: 4.5, fill: 0.95 }
          : p.phase === "now"
            ? { color: palette.accent, radius: 5.5, fill: 1 }
            : { color: palette.bone, radius: 4, fill: 0 };
      return [
        pointFeature<ClientDotProperties>(p.position, {
          id,
          color: style.color,
          radius: style.radius,
          fillOpacity: style.fill * opacity,
          strokeOpacity: opacity * 0.95
        })
      ];
    });
    setData(SOURCES.clients, featureCollection(dots));

    // Asesor enfocado: su recorrido con contorno, lo que falta y el estado de cada visita.
    if (focused) {
      setData(
        SOURCES.focusTrack,
        featureCollection(
          lineFeatures(liveTrackUntil(focused, t), { color: palette.accent, under: palette.under })
        )
      );
      setData(SOURCES.focusPlan, featureCollection(planLine(focused, t, palette.ink)));
      stopMarkers.current.forEach(({ el, phaseAt }) =>
        applyStopState(el, phaseAt(t), palette.ink3)
      );
    } else {
      setData(SOURCES.focusTrack, featureCollection([]));
      setData(SOURCES.focusPlan, featureCollection([]));
    }
  }, [
    ready,
    advisors,
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
      if (a) fit(framePoints(a), 70);
    } else {
      const points = advisors.filter((a) => visibleIds.has(a.id)).flatMap(framePoints);
      fit(points.length ? points : advisors.flatMap(framePoints), FIT_ALL_PADDING);
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
        focused={advisors.some((a) => a.id === selectedId)}
        palette={palette}
      />
      {notice && (
        <div className="pointer-events-none absolute inset-0 z-[3] grid place-items-center p-4">
          <span className="rounded-lg border border-border bg-card/95 px-3 py-2 text-xs font-medium text-muted-foreground backdrop-blur-sm">
            {notice}
          </span>
        </div>
      )}
    </div>
  );
}
