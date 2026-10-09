"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import dayjs, { type Dayjs } from "dayjs";

import UiSearchInput from "@/components/ui/search-input";

import AdvisorDayModal from "../../components/advisor-day-modal/advisor-day-modal";
import AdvisorDetail from "../../components/advisor-detail/advisor-detail";
import AdvisorDetailPending from "../../components/advisor-detail/advisor-detail-pending";
import LiveClock from "../../components/live-clock/live-clock";
import RankingPanel from "../../components/ranking-panel/ranking-panel";
import StatusChips from "../../components/status-chips/status-chips";
import VisitsFilterModal from "../../components/visits-filter-modal/visits-filter-modal";
import VisitsHeader from "../../components/visits-header/visits-header";
import VisitsTimeline from "../../components/visits-timeline/visits-timeline";
import {
  DAY_END_MIN,
  DAY_START_MIN,
  EMPTY_VISITS_FILTERS,
  SEEK_STEP_MIN,
  layersFor
} from "../../constants";
import { useAdvisorVisitDetail } from "../../hooks/useAdvisorVisitDetail";
import { useNowMinutes } from "../../hooks/useNowMinutes";
import { useTodayVisits } from "../../hooks/useTodayVisits";
import { useVisitsPalette } from "../../hooks/useVisitsPalette";
import { useVisitsPlayback } from "../../hooks/useVisitsPlayback";
import type {
  AdvisorStatus,
  DayMode,
  ILiveRun,
  IVisitsFilters,
  IVisitsLayers,
  LngLat,
  VisitsCameraRequest,
  VisitsCameraTarget
} from "../../types";
import { hasActiveFilters, normalizeQuery, overviewBuckets } from "../../utils/visits-calc";
import {
  isLiveVisible,
  livePositionAt,
  liveStateAt,
  liveStatusCounts,
  liveTeamKpis,
  rankLiveAdvisors,
  toDetailAdvisor,
  toLiveAdvisor,
  type ILiveVisibilityContext
} from "../../utils/visits-live";

// Mapbox GL necesita el navegador (WebGL, window): el mapa se carga sólo en cliente.
const VisitsMap = dynamic(() => import("../../components/visits-map/visits-map"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full animate-pulse rounded-2xl border border-border bg-secondary" />
  )
});

/** Aviso del panel y del mapa en los días que el API aún no trae. */
const NOT_FROM_API = "Este día aún no llega del API.";

/**
 * Visitas: seguimiento del día de los asesores en campo, desde GET
 * /visit-admin/today-visits (sólo hoy; los demás días quedan vacíos) y, para el asesor
 * abierto, su detalle del día. Los estados son los que manda el backend; el minuto `t`
 * de la línea de tiempo mueve a los asesores por sus puntos en el mapa.
 */
export default function VisitsView() {
  const { palette, isDark } = useVisitsPalette();
  const [today] = useState(() => dayjs().startOf("day"));
  const [day, setDay] = useState<Dayjs>(today);
  const offset = day.diff(today, "day");
  const dayMode: DayMode = offset < 0 ? "past" : offset > 0 ? "future" : "today";
  const future = dayMode === "future";
  const clock = useNowMinutes();
  // Hoy corre a la hora real, dentro de la jornada (hasta montar no hay hora: arranca al
  // inicio); un día pasado se ve cerrado y uno futuro, sin empezar.
  const now =
    dayMode === "past"
      ? DAY_END_MIN
      : future || clock == null
        ? DAY_START_MIN
        : Math.min(DAY_END_MIN, Math.max(DAY_START_MIN, clock));

  const { todayVisits, isLoading, error } = useTodayVisits();
  const team = useMemo(
    () => (dayMode === "today" ? (todayVisits?.users.map(toLiveAdvisor) ?? []) : []),
    [dayMode, todayVisits]
  );

  const [filters, setFilters] = useState<IVisitsFilters>(EMPTY_VISITS_FILTERS);
  const [search, setSearch] = useState("");
  const query = normalizeQuery(search);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [layers, setLayers] = useState<IVisitsLayers>(() => layersFor(false));
  const [camera, setCamera] = useState<VisitsCameraRequest>({ id: 0, kind: "fit-all" });
  const requestCamera = useCallback(
    (target: VisitsCameraTarget) => setCamera((prev) => ({ ...target, id: prev.id + 1 })),
    []
  );
  const [dayOpen, setDayOpen] = useState(false);

  // El asesor abierto sale entero de su detalle del día: panel, mapa, línea de tiempo y
  // chips. El resto del equipo, de today-visits.
  const openId = team.some((a) => a.id === selectedId) ? selectedId : null;
  const { detail, error: detailError } = useAdvisorVisitDetail(openId);
  const detailAdvisor = useMemo(() => (detail ? toDetailAdvisor(detail) : null), [detail]);
  const advisors = useMemo(
    () =>
      detailAdvisor ? team.map((a) => (a.id === detailAdvisor.id ? detailAdvisor : a)) : team,
    [team, detailAdvisor]
  );

  const { t, playing, speed, seek, togglePlay, toggleSpeed, goLive, pause } = useVisitsPlayback(
    now,
    day.format("YYYY-MM-DD")
  );
  const isLive = dayMode === "today" && t === now;

  const view = useMemo(() => {
    const ctx: ILiveVisibilityContext = { filters, query };
    const visible = advisors.filter((a) => isLiveVisible(a, ctx));
    return {
      visibleIds: new Set(visible.map((a) => a.id)),
      rows: rankLiveAdvisors(visible).map((advisor) => ({
        advisor,
        state: liveStateAt(advisor, t)
      })),
      kpis: liveTeamKpis(visible),
      counts: liveStatusCounts(advisors, ctx),
      leaderId: rankLiveAdvisors(advisors)[0]?.id ?? null
    };
  }, [advisors, filters, query, t]);

  // Las barras del equipo no dependen del cabezal: el tramo de puntos de cada asesor hasta `now`.
  const buckets = useMemo(() => {
    const ctx: ILiveVisibilityContext = { filters, query };
    const visible = advisors.filter((a) => isLiveVisible(a, ctx));
    return overviewBuckets(visible, now, (a, minute) => liveStateAt(a, minute).run?.status ?? null);
  }, [advisors, filters, query, now]);

  const filtersActive = hasActiveFilters(filters, query);
  const selected = advisors.find((a) => a.id === selectedId) ?? null;
  // El modal del día va sobre el detalle ya cargado del asesor abierto.
  const dayDetail = dayOpen && detail && selected === detailAdvisor ? detail : null;
  const emptyText =
    dayMode !== "today"
      ? NOT_FROM_API
      : error
        ? "No se pudieron cargar las visitas de hoy."
        : isLoading
          ? "Cargando asesores…"
          : advisors.length
            ? "Ningún asesor coincide con el filtro."
            : "No hay asesores en campo hoy.";

  // El primer encuadre llega antes que los datos: se repite cuando aparecen los asesores,
  // también al volver a hoy desde otro día.
  const hasAdvisors = advisors.length > 0;
  useEffect(() => {
    if (!hasAdvisors) return;
    requestCamera(
      selectedId != null ? { kind: "fit-advisor", advisorId: selectedId } : { kind: "fit-all" }
    );
  }, [hasAdvisors]);

  // Al abrir un asesor se encuadra con sus puntos de today-visits; su detalle puede
  // traerlo en otro lado, así que se vuelve a encuadrar cuando llega.
  const detailId = detailAdvisor?.id ?? null;
  useEffect(() => {
    if (detailId != null) requestCamera({ kind: "fit-advisor", advisorId: detailId });
  }, [detailId]);

  const changeDay = (next: Dayjs) => {
    const nextDay = next.startOf("day");
    if (nextDay.isSame(day, "day")) return;
    setDay(nextDay);
    setLayers(layersFor(nextDay.isAfter(today, "day")));
    setHoveredId(null);
  };

  const selectAdvisor = (id: number, focus?: LngLat) => {
    setSelectedId(id);
    setHoveredId(null);
    setDayOpen(false);
    requestCamera(
      focus ? { kind: "fly-to", center: focus } : { kind: "fit-advisor", advisorId: id }
    );
  };

  const clearSelection = () => {
    setSelectedId(null);
    setDayOpen(false);
    requestCamera({ kind: "fit-all" });
  };

  /** Pausa o visita del mapa: el cabezal salta a su inicio y el mapa vuela a donde fue. */
  const jumpToRun = (run: ILiveRun) => {
    pause();
    seek(Math.min(now, Math.round(run.start + 1)));
    requestCamera({ kind: "fly-to", center: run.position });
  };

  /** Visita de la ruta del panel: el cabezal salta a ese minuto y el mapa, a donde estaba. */
  const jumpTo = (minute: number) => {
    pause();
    seek(Math.min(now, Math.round(minute + 1)));
    const at = selected && livePositionAt(selected, minute);
    if (at) requestCamera({ kind: "fly-to", center: at.position });
  };

  const showOnMap = () => {
    setDayOpen(false);
    if (selectedId != null) requestCamera({ kind: "fit-advisor", advisorId: selectedId });
  };

  const flyTo = (center: LngLat) => requestCamera({ kind: "fly-to", center });

  const changeFilters = (next: IVisitsFilters) => {
    setFilters(next);
    requestCamera({ kind: "fit-all" });
  };

  const toggleStatus = (status: AdvisorStatus) =>
    setFilters((f) => ({
      ...f,
      status: f.status.includes(status)
        ? f.status.filter((s) => s !== status)
        : [...f.status, status]
    }));

  const toggleLayer = (key: keyof IVisitsLayers) => setLayers((l) => ({ ...l, [key]: !l[key] }));

  const handleTogglePlay = () =>
    togglePlay(selected?.dayStart != null ? Math.floor(selected.dayStart) - 10 : DAY_START_MIN);

  const handleGoLive = () => (dayMode === "today" ? goLive() : changeDay(today));

  // Atajos: espacio reproduce, flechas mueven 5 min, Esc suelta al asesor enfocado.
  const onKeyDown = useRef<(e: KeyboardEvent) => void>(() => {});
  onKeyDown.current = (e) => {
    // Con el modal del día abierto las teclas son suyas: Esc sólo lo cierra.
    if (dayDetail || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    const target = e.target instanceof HTMLElement ? e.target : null;
    if (target?.closest("input, textarea, select, [contenteditable='true']")) return;
    if (e.key === "Escape" && selectedId != null) {
      clearSelection();
    } else if (e.key === " " && !target?.closest("button, a, [role='button']")) {
      e.preventDefault();
      handleTogglePlay();
    } else if (e.key === "ArrowLeft") {
      seek(t - SEEK_STEP_MIN);
    } else if (e.key === "ArrowRight") {
      seek(t + SEEK_STEP_MIN);
    }
  };
  useEffect(() => {
    const listener = (e: KeyboardEvent) => onKeyDown.current(e);
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);

  return (
    <div className="wallet-scope flex min-h-0 flex-1 flex-col gap-3 max-[900px]:flex-none">
      <VisitsHeader day={day} today={today} onDayChange={changeDay} />

      <div className="grid min-h-0 flex-1 grid-cols-[360px_minmax(0,1fr)] grid-rows-[auto_minmax(0,1fr)_92px] gap-3 max-[1200px]:grid-cols-[340px_minmax(0,1fr)] max-[900px]:flex-none max-[900px]:grid-cols-1 max-[900px]:grid-rows-[auto_auto_58vh_92px_auto]">
        <div className="col-start-1 row-start-1 flex min-w-0 items-center">
          <UiSearchInput
            id="visits-search"
            showBorder
            placeholder="Buscar asesor o cliente"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="!max-w-none"
          />
        </div>

        <div className="col-start-2 row-start-1 min-w-0 max-[900px]:col-start-1 max-[900px]:row-start-2">
          <VisitsFilterModal
            value={filters}
            onChange={changeFilters}
            advisors={advisors}
            // Zonas y clientes aún no llegan del API.
            zones={[]}
            clients={[]}
            barEnd={
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <StatusChips
                  counts={view.counts}
                  selected={filters.status}
                  onToggle={toggleStatus}
                  palette={palette}
                />
                <div className="ml-auto">
                  <LiveClock dayMode={dayMode} isLive={isLive} t={t} palette={palette} />
                </div>
              </div>
            }
          />
        </div>

        <aside className="col-start-1 row-[2/4] flex min-h-0 flex-col overflow-hidden rounded-2xl border border-border bg-card max-[900px]:row-[5/6]">
          {selected ? (
            detail && selected === detailAdvisor ? (
              <AdvisorDetail
                detail={detail}
                t={t}
                isLive={isLive}
                palette={palette}
                onBack={clearSelection}
                onOpenDay={() => setDayOpen(true)}
                onJumpTo={jumpTo}
              />
            ) : (
              <AdvisorDetailPending failed={detailError != null} onBack={clearSelection} />
            )
          ) : (
            <RankingPanel
              rows={view.rows}
              totalAdvisors={advisors.length}
              kpis={dayMode === "today" ? view.kpis : null}
              t={t}
              palette={palette}
              emptyText={emptyText}
              onSelect={selectAdvisor}
              onHover={setHoveredId}
            />
          )}
        </aside>

        <div className="col-start-2 row-start-2 min-h-0 min-w-0 max-[900px]:col-start-1 max-[900px]:row-start-3">
          <VisitsMap
            advisors={advisors}
            t={t}
            isLive={isLive}
            visibleIds={view.visibleIds}
            filtersActive={filtersActive}
            selectedId={selectedId}
            hoveredId={hoveredId}
            leaderId={view.leaderId}
            layers={layers}
            palette={palette}
            isDark={isDark}
            camera={camera}
            notice={dayMode === "today" ? null : NOT_FROM_API}
            onSelectAdvisor={selectAdvisor}
            onJumpToRun={jumpToRun}
            onFlyTo={flyTo}
            onToggleLayer={toggleLayer}
          />
        </div>

        <div className="col-start-2 row-start-3 min-w-0 max-[900px]:col-start-1 max-[900px]:row-start-4">
          <VisitsTimeline
            t={t}
            now={now}
            dayMode={dayMode}
            playing={playing}
            speed={speed}
            buckets={buckets}
            advisor={selected}
            palette={palette}
            onTogglePlay={handleTogglePlay}
            onToggleSpeed={toggleSpeed}
            onSeek={seek}
            onGoLive={handleGoLive}
          />
        </div>
      </div>

      <AdvisorDayModal
        detail={dayDetail}
        palette={palette}
        isDark={isDark}
        onClose={() => setDayOpen(false)}
        onShowOnMap={showOnMap}
      />
    </div>
  );
}
