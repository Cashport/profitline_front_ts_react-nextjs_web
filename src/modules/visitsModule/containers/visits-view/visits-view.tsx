"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import dayjs, { type Dayjs } from "dayjs";

import UiSearchInput from "@/components/ui/search-input";

import AdvisorDayModal from "../../components/advisor-day-modal/advisor-day-modal";
import AdvisorDetail from "../../components/advisor-detail/advisor-detail";
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
import { useVisitsPalette } from "../../hooks/useVisitsPalette";
import { useVisitsPlayback } from "../../hooks/useVisitsPlayback";
import { MOCK_NOW_MINUTES, buildMockVisitsDay } from "../../mocked-data";
import type {
  AdvisorItem,
  AdvisorStatus,
  DayMode,
  IVisitsAdvisor,
  IVisitsFilters,
  IVisitsLayers,
  LngLat,
  VisitsCameraRequest,
  VisitsCameraTarget
} from "../../types";
import {
  clientOwners,
  effectiveTime,
  hasActiveFilters,
  isAdvisorVisible,
  normalizeQuery,
  overviewBuckets,
  rankAdvisors,
  stateAt,
  statusCounts,
  teamKpis,
  type IVisibilityContext
} from "../../utils/visits-calc";
import { fmtDayLabel } from "../../utils/visits-format";

// MapLibre necesita el navegador (WebGL, window): el mapa se carga sólo en cliente.
const VisitsMap = dynamic(() => import("../../components/visits-map/visits-map"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full animate-pulse rounded-2xl border border-border bg-secondary" />
  )
});

/**
 * Visitas: seguimiento del día de los asesores en campo. Todo sale de un día
 * (hoy con datos simulados) y de un minuto `t` que mueve la línea de tiempo;
 * ranking, mapa y KPIs se recalculan a partir de ese minuto.
 */
export default function VisitsView() {
  const { palette, isDark } = useVisitsPalette();
  const [today] = useState(() => dayjs().startOf("day"));
  const [day, setDay] = useState<Dayjs>(today);
  const offset = day.diff(today, "day");
  const dayMode: DayMode = offset < 0 ? "past" : offset > 0 ? "future" : "today";
  const future = dayMode === "future";
  // Hoy corre a la hora simulada; un día pasado se ve cerrado y uno futuro, sin empezar.
  const now = dayMode === "past" ? DAY_END_MIN : future ? DAY_START_MIN : MOCK_NOW_MINUTES;

  const data = useMemo(() => buildMockVisitsDay(day, dayMode === "today"), [day, dayMode]);
  const { advisors, clients, zones } = data;
  const cityByZone = useMemo(
    () => Object.fromEntries(zones.map((z) => [z.id, z.city] as const)),
    [zones]
  );
  const zoneNames = useMemo(
    () => Object.fromEntries(zones.map((z) => [z.id, z.name] as const)),
    [zones]
  );
  const owners = useMemo(() => clientOwners(advisors), [advisors]);
  const scheduledClients = useMemo(
    () => clients.filter((c) => owners.has(c.id)),
    [clients, owners]
  );

  const [filters, setFilters] = useState<IVisitsFilters>(EMPTY_VISITS_FILTERS);
  const [search, setSearch] = useState("");
  const query = normalizeQuery(search);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [dayModalId, setDayModalId] = useState<number | null>(null);
  const [layers, setLayers] = useState<IVisitsLayers>(() => layersFor(false));
  const [camera, setCamera] = useState<VisitsCameraRequest>({ id: 0, kind: "fit-all" });
  const requestCamera = useCallback(
    (target: VisitsCameraTarget) => setCamera((prev) => ({ ...target, id: prev.id + 1 })),
    []
  );

  const { t, playing, speed, seek, togglePlay, toggleSpeed, goLive, pause } = useVisitsPlayback(
    now,
    data.date
  );
  const isLive = dayMode === "today" && t === now;

  const view = useMemo(() => {
    const ctx: IVisibilityContext = { filters, query, t, cityByZone };
    const states = new Map(advisors.map((a) => [a.id, stateAt(a, t)]));
    const stateOf = (a: IVisitsAdvisor) => states.get(a.id) ?? stateAt(a, t);
    const visible = advisors.filter((a) => isAdvisorVisible(a, stateOf(a).status, ctx));
    const ranked = rankAdvisors(advisors, t);
    return {
      stateOf,
      visibleIds: new Set(visible.map((a) => a.id)),
      rows: rankAdvisors(visible, t).map((advisor) => ({ advisor, state: stateOf(advisor) })),
      kpis: teamKpis(visible, t),
      counts: statusCounts(advisors, ctx),
      ranks: new Map(ranked.map((a, i) => [a.id, i + 1])),
      leaderId: ranked[0]?.id ?? null
    };
  }, [advisors, filters, query, t, cityByZone]);

  // Las barras del equipo no dependen del cabezal: el estado de cada tramo hasta `now`.
  const buckets = useMemo(() => {
    const ctx: IVisibilityContext = { filters, query, t: now, cityByZone };
    const visibleNow = advisors.filter((a) => isAdvisorVisible(a, stateAt(a, now).status, ctx));
    return overviewBuckets(visibleNow, now);
  }, [advisors, filters, query, now, cityByZone]);

  const filtersActive = hasActiveFilters(filters, query);
  const selected = advisors.find((a) => a.id === selectedId) ?? null;
  const dayModalAdvisor = advisors.find((a) => a.id === dayModalId) ?? null;

  const changeDay = (next: Dayjs) => {
    const nextDay = next.startOf("day");
    if (nextDay.isSame(day, "day")) return;
    setDay(nextDay);
    setLayers(layersFor(nextDay.isAfter(today, "day")));
    setDayModalId(null);
    setHoveredId(null);
    requestCamera(
      selectedId != null ? { kind: "fit-advisor", advisorId: selectedId } : { kind: "fit-all" }
    );
  };

  const selectAdvisor = (id: number, focus?: LngLat) => {
    setSelectedId(id);
    setHoveredId(null);
    requestCamera(
      focus ? { kind: "fly-to", center: focus } : { kind: "fit-advisor", advisorId: id }
    );
  };

  const clearSelection = () => {
    setSelectedId(null);
    requestCamera({ kind: "fit-all" });
  };

  /** Parada de la ruta: el cabezal salta a su inicio (si ya pasó) y el mapa vuela a ella. */
  const jumpToItem = (item: AdvisorItem) => {
    if (!selected) return;
    pause();
    if (item.start <= effectiveTime(selected, now)) seek(Math.min(now, Math.round(item.start + 1)));
    requestCamera({
      kind: "fly-to",
      center: item.type === "visita" ? item.checkIn : item.position
    });
  };

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
    togglePlay(selected ? Math.floor(selected.dayStart) - 10 : DAY_START_MIN);

  const handleGoLive = () => (dayMode === "today" ? goLive() : changeDay(today));

  const showOnMap = (id: number) => {
    setDayModalId(null);
    selectAdvisor(id);
  };

  // Atajos: espacio reproduce, flechas mueven 5 min, Esc suelta al asesor enfocado.
  const onKeyDown = useRef<(e: KeyboardEvent) => void>(() => {});
  onKeyDown.current = (e) => {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    const target = e.target instanceof HTMLElement ? e.target : null;
    if (target?.closest("input, textarea, select, [contenteditable='true']")) return;
    // Con el modal del día abierto no se mueve nada detrás; Esc lo cierra el propio modal.
    if (dayModalId != null) return;
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
            zones={zones}
            clients={scheduledClients}
            future={future}
            barEnd={
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <StatusChips
                  counts={view.counts}
                  selected={filters.status}
                  onToggle={toggleStatus}
                  palette={palette}
                  future={future}
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
            <AdvisorDetail
              advisor={selected}
              state={view.stateOf(selected)}
              t={t}
              isLive={isLive}
              dayMode={dayMode}
              zoneName={zoneNames[selected.zoneId]}
              palette={palette}
              onBack={clearSelection}
              onOpenDay={setDayModalId}
              onJumpToItem={jumpToItem}
            />
          ) : (
            <RankingPanel
              rows={view.rows}
              totalAdvisors={advisors.length}
              kpis={view.kpis}
              t={t}
              now={now}
              dayMode={dayMode}
              zoneNames={zoneNames}
              palette={palette}
              onSelect={selectAdvisor}
              onHover={setHoveredId}
              onOpenDay={setDayModalId}
            />
          )}
        </aside>

        <div className="col-start-2 row-start-2 min-h-0 min-w-0 max-[900px]:col-start-1 max-[900px]:row-start-3">
          <VisitsMap
            advisors={advisors}
            clients={clients}
            owners={owners}
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
            future={future}
            camera={camera}
            onSelectAdvisor={selectAdvisor}
            onJumpToItem={jumpToItem}
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
        advisor={dayModalAdvisor}
        t={t}
        dayMode={dayMode}
        dayLabel={dayMode === "today" ? "Hoy" : fmtDayLabel(day, today)}
        rank={dayModalAdvisor ? view.ranks.get(dayModalAdvisor.id) ?? 0 : 0}
        totalAdvisors={advisors.length}
        zoneName={dayModalAdvisor ? zoneNames[dayModalAdvisor.zoneId] : ""}
        palette={palette}
        isDark={isDark}
        onClose={() => setDayModalId(null)}
        onShowOnMap={showOnMap}
      />
    </div>
  );
}
