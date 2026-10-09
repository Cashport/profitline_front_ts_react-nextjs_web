"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import type { IAdvisorVisitDetail } from "@/types/visits/IVisits";
import { cn } from "@/utils/utils";

import { ACTIVITY_HOURS } from "../../constants";
import type { IVisitsPalette } from "../../types";
import {
  fmtClock,
  fmtDuration,
  fmtNumber,
  initialsOf,
  minutesOfDay
} from "../../utils/visits-format";
import StatusPill from "../shared/status-pill";

interface AdvisorDetailProps {
  /** GET /visit-admin/users/:user_id/day-detail: todo lo que pinta el panel. */
  detail: IAdvisorVisitDetail;
  t: number;
  isLive: boolean;
  palette: IVisitsPalette;
  onBack: () => void;
  onOpenDay: () => void;
  /** Lleva el cabezal y el mapa a ese minuto. */
  onJumpTo: (minute: number) => void;
}

/** Qué está haciendo, en una línea junto al estado: la visita en curso o la próxima. */
function nowText({ state, visits }: IAdvisorVisitDetail) {
  if (state === "IN_VISIT") {
    const current = visits.route.find((v) => v.status_code === "IN_PROGRESS");
    if (current?.started_at) {
      return `en ${current.client_name} · desde ${fmtClock(minutesOfDay(current.started_at))}`;
    }
  }
  if (state === "EN_ROUTE") {
    const next = visits.route.find((v) => v.status_code === "SCHEDULED");
    if (next) return `hacia ${next.client_name} · ${fmtClock(minutesOfDay(next.scheduled_start_at))}`;
  }
  return "";
}

/** Antigüedad de la última señal: "ahora" dentro del primer minuto. */
const signalAge = (minutes: number) => (minutes < 1 ? "ahora" : `hace ${fmtDuration(minutes)}`);

const STOP_ROW =
  "grid cursor-pointer grid-cols-[44px_16px_minmax(0,1fr)] gap-2 rounded-[7px] pr-1.5 transition-colors hover:bg-secondary";
/** Fila sin un minuto al que llevar el cabezal. */
const STATIC_ROW = cn(STOP_ROW, "cursor-default hover:bg-transparent");

/** Riel de la ruta: línea vertical (verde si ya se recorrió) con el nodo encima. */
function Rail({ done, children }: { done: boolean; children: React.ReactNode }) {
  return (
    <div className="relative flex justify-center">
      <span
        className={cn("absolute inset-y-0 w-0.5", done ? "bg-[#cbe71e]" : "bg-border")}
        aria-hidden
      />
      {children}
    </div>
  );
}

const NODE =
  "relative mt-[9px] grid h-3.5 w-3.5 place-items-center rounded-full border-2 bg-card text-[8px] font-semibold";

/** Vista de un asesor desde su detalle del día: estado, actividades, KPIs y ruta. */
export default function AdvisorDetail({
  detail: d,
  t,
  isLive,
  palette,
  onBack,
  onOpenDay,
  onJumpTo
}: AdvisorDetailProps) {
  const { activities, visits, tracking } = d;
  const color = palette.status[d.state];
  const dayStart = tracking.started_at ? minutesOfDay(tracking.started_at) : null;
  const startText = dayStart != null ? fmtClock(dayStart) : "—";
  const lastSignal = tracking.last_signal_at ? minutesOfDay(tracking.last_signal_at) : null;
  const maxHour = Math.max(1, ...activities.by_hour.map((h) => h.count));

  const tiles: { label: string; value: string | number; suffix?: string; detail: string }[] = [
    {
      label: "Visitas",
      value: visits.completed + visits.failed,
      suffix: `/ ${visits.total}`,
      detail: `${visits.pending} por hacer`
    },
    {
      label: "Efectividad",
      value: visits.effectivity_pct != null ? fmtNumber(visits.effectivity_pct) : "—",
      suffix: visits.effectivity_pct != null ? "%" : undefined,
      detail: `${visits.completed} efectivas`
    },
    {
      label: "Recorrido",
      value: fmtNumber(tracking.distance_km, 1),
      suffix: "km",
      detail: `desde ${startText}`
    },
    {
      label: "En visita",
      value: visits.total_visit_minutes != null ? fmtDuration(visits.total_visit_minutes) : "—",
      detail:
        visits.average_duration_minutes != null
          ? `${Math.round(visits.average_duration_minutes)} min prom.`
          : "—"
    }
  ];

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3.5 [scrollbar-width:thin]">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 py-1 text-[11px] tracking-[0.06em] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-3 w-3" />
        Equipo
      </button>

      <div className="mt-2.5 flex items-center gap-3">
        <div
          className="grid h-12 w-12 shrink-0 place-items-center rounded-full border-2 bg-secondary text-sm font-semibold text-foreground"
          style={{ borderColor: color }}
        >
          {initialsOf(d.user.userName)}
        </div>
        <div className="min-w-0">
          <h2 className="truncate text-[17px] font-semibold tracking-[-0.01em] text-foreground">
            {d.user.userName}
          </h2>
          {d.zones.length > 0 && (
            <div className="text-xs text-muted-foreground">Zona {d.zones.join(", ")}</div>
          )}
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
            <StatusPill label={d.state_name} color={color} />
            <button
              type="button"
              onClick={onOpenDay}
              className="flex h-6 items-center gap-0.5 rounded-lg bg-[#cbe71e] pl-2 pr-1.5 text-xs font-bold text-[#141414] transition-colors hover:bg-[#b9d417]"
            >
              Ver día
              <ChevronRight className="h-3 w-3" />
            </button>
            <span className="text-[11.5px] text-muted-foreground">{nowText(d)}</span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-3.5 gap-y-1 text-[10.5px] text-muted-foreground">
        <span className="whitespace-nowrap">
          Últ. señal{" "}
          <b className="font-medium text-foreground/80">
            {lastSignal == null ? "—" : isLive ? signalAge(t - lastSignal) : fmtClock(lastSignal)}
          </b>
        </span>
        <span className="whitespace-nowrap">
          Inicio <b className="font-medium text-foreground/80">{startText}</b>
        </span>
      </div>

      <div className="mt-3 rounded-xl border border-border px-3 py-2.5">
        <div className="flex items-baseline justify-between gap-2 text-xs font-semibold text-foreground">
          <span>Actividades</span>
          <b className="whitespace-nowrap text-xl font-semibold">
            {activities.effective}
            <small className="text-xs font-medium text-muted-foreground">/{activities.goal}</small>
          </b>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-[3px] bg-secondary">
          <i
            className="block h-full bg-[#cbe71e]"
            style={{ width: `${Math.min(100, activities.goal_pct)}%` }}
          />
        </div>
        <div className="mt-1.5 text-[11px] text-muted-foreground">
          {activities.registered} registradas
        </div>
        <div className="mt-2.5 flex h-[38px] items-end gap-[3px]">
          {ACTIVITY_HOURS.map((hour) => {
            const count = activities.by_hour.find((h) => h.hour === hour)?.count ?? 0;
            return (
              <span
                key={hour}
                title={`${hour}:00 · ${count}`}
                className={cn("min-h-px flex-1 rounded-t-sm", !count && "bg-border")}
                style={{
                  height: `${(count / maxHour) * 100}%`,
                  background: count ? palette.status.IN_VISIT : undefined
                }}
              />
            );
          })}
        </div>
        <div className="mt-[3px] flex justify-between text-[9.5px] text-muted-foreground">
          <span>7:00</span>
          <span>12:00</span>
          <span>17:00</span>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {tiles.map((tile) => (
          <div key={tile.label} className="min-w-0 rounded-xl bg-secondary px-3 py-2.5">
            <span className="block truncate text-[11.5px] text-foreground/70">{tile.label}</span>
            <div className="whitespace-nowrap text-xl font-semibold tabular-nums tracking-[-0.02em] text-foreground">
              {tile.value}
              {tile.suffix && (
                <small className="ml-0.5 text-xs font-medium text-muted-foreground">
                  {tile.suffix}
                </small>
              )}
            </div>
            <div className="mt-px truncate text-[11px] text-muted-foreground">{tile.detail}</div>
          </div>
        ))}
      </div>

      {/* Barra de la ruta: una por visita, del color de su estado; las agendadas sin color. */}
      <div className="mt-3 flex h-[5px] gap-0.5">
        {visits.route.map((v) => {
          const scheduled = v.status_code === "SCHEDULED";
          return (
            <i
              key={v.visit_id}
              className={cn("flex-1 rounded-sm", scheduled && "bg-border")}
              style={{ background: scheduled ? undefined : palette.visit[v.status_code] }}
            />
          );
        })}
      </div>

      <div className="mb-1.5 mt-[18px] flex items-baseline justify-between whitespace-nowrap">
        <span className="text-[11.5px] font-medium text-muted-foreground">Ruta del día</span>
        <span className="text-[10.5px] text-muted-foreground">{visits.pending} pendientes</span>
      </div>

      <ol className="relative">
        {dayStart != null && (
          <li className={STOP_ROW} onClick={() => onJumpTo(dayStart)}>
            <div className="pt-2 text-right text-[11px] tabular-nums text-foreground/70">
              {startText}
            </div>
            <Rail done>
              <div className={NODE} style={{ borderColor: palette.ink2 }} />
            </Rail>
            <div className="min-w-0 pb-2.5 pt-1.5">
              <div className="text-[12.5px] font-semibold leading-[1.3] text-foreground">
                Inicio de jornada
              </div>
              <div className="mt-0.5 text-[11.5px] text-muted-foreground">Check-in app</div>
            </div>
          </li>
        )}

        {/* El estado de cada visita es el del backend: no cambia con el minuto que se mira. */}
        {visits.route.map((v, i) => {
          const n = i + 1;
          const visitColor = palette.visit[v.status_code];
          const scheduled = v.status_code === "SCHEDULED";
          const inProgress = v.status_code === "IN_PROGRESS";
          const started = v.started_at ? minutesOfDay(v.started_at) : null;

          return (
            <li
              key={v.visit_id}
              className={started != null ? STOP_ROW : STATIC_ROW}
              onClick={started != null ? () => onJumpTo(started) : undefined}
            >
              <div
                className={cn(
                  "pt-2 text-right text-[11px] tabular-nums",
                  scheduled ? "text-muted-foreground" : "text-foreground/70"
                )}
              >
                {fmtClock(started ?? minutesOfDay(v.scheduled_start_at))}
              </div>
              <Rail done={v.finished_at != null}>
                <div
                  className={cn(
                    NODE,
                    scheduled && "border-dashed text-muted-foreground",
                    inProgress &&
                      "border-[#141414] bg-[#cbe71e] shadow-[0_0_0_4px_rgba(203,231,30,0.4)]"
                  )}
                  style={inProgress ? undefined : { borderColor: visitColor }}
                >
                  {scheduled ? n : null}
                </div>
              </Rail>
              <div className="min-w-0 pb-2.5 pt-1.5">
                <div
                  className={cn(
                    "text-[12.5px] leading-[1.3]",
                    scheduled ? "font-medium text-foreground/70" : "font-semibold text-foreground"
                  )}
                >
                  {!scheduled && `${n}. `}
                  {v.client_name}
                </div>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-[3px] text-[11.5px] text-muted-foreground">
                  {scheduled ? (
                    <>
                      <span className="whitespace-nowrap">{v.client_nit}</span>
                      <span className="whitespace-nowrap">
                        ~
                        {fmtDuration(
                          minutesOfDay(v.scheduled_end_at) - minutesOfDay(v.scheduled_start_at)
                        )}
                      </span>
                    </>
                  ) : inProgress ? (
                    <>
                      <span className="whitespace-nowrap rounded bg-[#cbe71e] px-1.5 text-[11px] font-semibold text-[#141414]">
                        {v.status_name}
                      </span>
                      {started != null && (
                        <span className="whitespace-nowrap">desde {fmtClock(started)}</span>
                      )}
                    </>
                  ) : (
                    <>
                      <span
                        className="whitespace-nowrap text-[11px] font-semibold"
                        style={{ color: visitColor }}
                      >
                        {v.status_name}
                      </span>
                      {v.duration_minutes != null && (
                        <span className="whitespace-nowrap">{fmtDuration(v.duration_minutes)}</span>
                      )}
                    </>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
