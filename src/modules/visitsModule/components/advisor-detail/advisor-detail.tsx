"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/utils/utils";

import { PROJECTS, RESULT_LABELS, statusLabel } from "../../constants";
import type {
  AdvisorItem,
  DayMode,
  IAdvisorState,
  IVisitsAdvisor,
  IVisitsPalette
} from "../../types";
import {
  completedVisits,
  effectiveTime,
  hourlyActivities,
  okActivities,
  positionAt,
  registeredActivities,
  visitPhase,
  visitsOf
} from "../../utils/visits-calc";
import { fmtClock, fmtDuration, fmtNumber } from "../../utils/visits-format";
import StatusPill from "../shared/status-pill";

interface AdvisorDetailProps {
  advisor: IVisitsAdvisor;
  state: IAdvisorState;
  t: number;
  isLive: boolean;
  dayMode: DayMode;
  zoneName: string;
  palette: IVisitsPalette;
  onBack: () => void;
  onOpenDay: (id: number) => void;
  onJumpToItem: (item: AdvisorItem) => void;
}

/** Qué está haciendo ahora, en una línea junto al estado. */
function nowText(a: IVisitsAdvisor, s: IAdvisorState, t: number) {
  if (s.status === "visita" && s.item?.type === "visita") {
    return a.fixed
      ? `en ${s.item.client.name} · desde ${fmtClock(s.item.start)}`
      : `en ${s.item.client.name} · ${fmtDuration(t - s.item.start)}`;
  }
  if (s.status === "transito" && s.next) {
    return `hacia ${s.next.client.name} · ETA ${fmtClock(s.next.start)}`;
  }
  if (s.status === "sinsenal" && s.signalLostAt) {
    return `última posición ${fmtClock(s.signalLostAt)}`;
  }
  if (s.status === "pausa" && s.item) return `desde ${fmtClock(s.item.start)}`;
  return "";
}

const STOP_ROW =
  "grid cursor-pointer grid-cols-[44px_16px_minmax(0,1fr)] gap-2 rounded-[7px] pr-1.5 transition-colors hover:bg-secondary";

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

/** Vista de un asesor: estado, actividades, KPIs y la ruta del día parada por parada. */
export default function AdvisorDetail({
  advisor: a,
  state,
  t,
  isLive,
  dayMode,
  zoneName,
  palette,
  onBack,
  onOpenDay,
  onJumpToItem
}: AdvisorDetailProps) {
  const te = effectiveTime(a, t);
  const visits = visitsOf(a);
  const done = completedVisits(a, t);
  const color = palette.status[state.status];
  const project = PROJECTS[a.project];
  const started = te >= a.dayStart;
  const { km } = positionAt(a, te);
  const effective = done.filter((v) => v.result === "efectiva").length;
  const doneMinutes = done.reduce((sum, v) => sum + (v.end - v.start), 0);
  const inVisit =
    doneMinutes + (state.status === "visita" && state.item ? t - state.item.start : 0);
  const ok = okActivities(a, t);
  const registered = registeredActivities(a, t);
  const hourly = hourlyActivities(a, t);
  const maxHour = Math.max(1, ...hourly.map((h) => h.count));
  const lost = state.status === "sinsenal";

  const tiles: { label: string; value: string | number; suffix?: string; detail: string }[] =
    a.fixed
      ? [
          {
            label: "En el punto",
            value: fmtDuration(inVisit),
            detail: `desde ${started ? fmtClock(visits[0].start) : "—"}`
          },
          { label: "Registradas", value: registered, detail: "gestiones totales" }
        ]
      : [
          {
            label: "Visitas",
            value: done.length,
            suffix: `/ ${visits.length}`,
            detail: `${visits.length - done.length} por hacer`
          },
          {
            label: "Efectividad",
            value: done.length ? fmtNumber((effective / done.length) * 100) : 0,
            suffix: "%",
            detail: `${effective} efectivas`
          }
        ];
  tiles.push(
    {
      label: "Recorrido",
      value: fmtNumber(km, 1),
      suffix: "km",
      detail: `desde ${started ? fmtClock(a.dayStart) : "—"}`
    },
    {
      label: "En visita",
      value: fmtDuration(inVisit),
      detail: done.length ? `${Math.round(doneMinutes / done.length)} min prom.` : "—"
    }
  );

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
          {a.initials}
        </div>
        <div className="min-w-0">
          <h2 className="truncate text-[17px] font-semibold tracking-[-0.01em] text-foreground">
            {a.name}
          </h2>
          <div className="text-xs text-muted-foreground">
            {a.code} · Zona {zoneName}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
            <StatusPill label={statusLabel(state.status, dayMode === "future")} color={color} />
            <button
              type="button"
              onClick={() => onOpenDay(a.id)}
              className="flex h-6 items-center gap-0.5 rounded-lg bg-[#cbe71e] pl-2 pr-1.5 text-xs font-bold text-[#141414] transition-colors hover:bg-[#b9d417]"
            >
              Ver día
              <ChevronRight className="h-3 w-3" />
            </button>
            <span className="text-[11.5px] text-muted-foreground">{nowText(a, state, t)}</span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-3.5 gap-y-1 text-[10.5px] text-muted-foreground">
        <span className="whitespace-nowrap">
          Batería <b className="font-medium text-foreground/80">{lost ? "—" : `${a.battery}%`}</b>
        </span>
        <span className="whitespace-nowrap">
          GPS <b className="font-medium text-foreground/80">±{a.gpsAccuracy} m</b>
        </span>
        <span className="whitespace-nowrap">
          Últ. señal{" "}
          <b className="font-medium text-foreground/80">
            {lost && state.signalLostAt
              ? fmtClock(state.signalLostAt)
              : isLive
                ? "hace 12 s"
                : fmtClock(t)}
          </b>
        </span>
        <span className="whitespace-nowrap">
          Inicio <b className="font-medium text-foreground/80">{started ? fmtClock(a.dayStart) : "—"}</b>
        </span>
      </div>

      <div className="mt-3 rounded-xl border border-border px-3 py-2.5">
        <div className="flex items-baseline justify-between gap-2 text-xs font-semibold text-foreground">
          <span>Actividades · {project.name}</span>
          <b className="whitespace-nowrap text-xl font-semibold">
            {ok}
            <small className="text-xs font-medium text-muted-foreground">/{a.goal}</small>
          </b>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-[3px] bg-secondary">
          <i
            className="block h-full bg-[#cbe71e]"
            style={{ width: `${Math.min(100, (ok / a.goal) * 100)}%` }}
          />
        </div>
        <div className="mt-1.5 text-[11px] text-muted-foreground">
          {project.definition} · {registered} registradas
          {registered ? ` · ${Math.round((ok / registered) * 100)}% exitosas` : ""}
        </div>
        <div className="mt-2.5 flex h-[38px] items-end gap-[3px]">
          {hourly.map((h) => (
            <span
              key={h.hour}
              title={`${h.hour}:00 · ${h.count} exitosas`}
              className={cn("min-h-px flex-1 rounded-t-sm", !h.count && "bg-border")}
              style={{
                height: `${(h.count / maxHour) * 100}%`,
                background: h.count ? palette.status.visita : undefined
              }}
            />
          ))}
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

      <div className="mt-3 flex h-[5px] gap-0.5">
        {visits.map((v) => {
          const phase = visitPhase(v, te);
          return (
            <i
              key={v.client.id}
              className={cn("flex-1 rounded-sm", phase === "pending" && "bg-border")}
              style={{
                background:
                  phase === "done"
                    ? palette.result[v.result]
                    : phase === "now"
                      ? palette.accent
                      : undefined
              }}
            />
          );
        })}
      </div>

      <div className="mb-1.5 mt-[18px] flex items-baseline justify-between whitespace-nowrap">
        <span className="text-[11.5px] font-medium text-muted-foreground">Ruta del día</span>
        <span className="text-[10.5px] text-muted-foreground">
          {visits.length - done.length} pendientes
        </span>
      </div>

      <ol className="relative">
        {started && (
          <li className={cn(STOP_ROW, "cursor-default hover:bg-transparent")}>
            <div className="pt-2 text-right text-[11px] tabular-nums text-foreground/70">
              {fmtClock(a.dayStart)}
            </div>
            <Rail done>
              <div className={NODE} style={{ borderColor: palette.ink2 }} />
            </Rail>
            <div className="min-w-0 pb-2.5 pt-1.5">
              <div className="text-[12.5px] font-semibold leading-[1.3] text-foreground">
                Inicio de jornada
              </div>
              <div className="mt-0.5 text-[11.5px] text-muted-foreground">
                Check-in app · ±{a.gpsAccuracy} m
              </div>
            </div>
          </li>
        )}

        {a.items.map((item) => {
          if (item.type === "pausa") {
            if (item.start > te) return null;
            const pauseDone = item.end <= te;
            return (
              <li key={`p-${item.start}`} className={STOP_ROW} onClick={() => onJumpToItem(item)}>
                <div className="pt-2 text-right text-[11px] tabular-nums text-foreground/70">
                  {fmtClock(item.start)}
                </div>
                <Rail done={pauseDone}>
                  <div className={NODE} style={{ borderColor: palette.status.pausa }} />
                </Rail>
                <div className="min-w-0 pb-2.5 pt-1.5">
                  <div
                    className="text-[12.5px] font-semibold leading-[1.3]"
                    style={{ color: palette.status.pausa }}
                  >
                    Pausa
                  </div>
                  <div className="mt-0.5 text-[11.5px] text-muted-foreground">
                    {pauseDone
                      ? fmtDuration(item.end - item.start)
                      : `en curso · ${fmtDuration(t - item.start)}`}
                  </div>
                </div>
              </li>
            );
          }

          const n = visits.indexOf(item) + 1;
          const phase = visitPhase(item, te);
          const resultColor = palette.result[item.result];
          return (
            <li key={`v-${item.client.id}`} className={STOP_ROW} onClick={() => onJumpToItem(item)}>
              <div
                className={cn(
                  "pt-2 text-right text-[11px] tabular-nums",
                  phase === "pending" ? "text-muted-foreground" : "text-foreground/70"
                )}
              >
                {fmtClock(item.start)}
              </div>
              <Rail done={phase === "done"}>
                <div
                  className={cn(
                    NODE,
                    phase === "pending" && "border-dashed text-muted-foreground",
                    phase === "now" &&
                      "border-[#141414] bg-[#cbe71e] shadow-[0_0_0_4px_rgba(203,231,30,0.4)]"
                  )}
                  style={
                    phase === "done"
                      ? { borderColor: resultColor }
                      : phase === "pending"
                        ? { borderColor: palette.ink3 }
                        : undefined
                  }
                >
                  {phase === "pending" ? n : null}
                </div>
              </Rail>
              <div className="min-w-0 pb-2.5 pt-1.5">
                <div
                  className={cn(
                    "text-[12.5px] leading-[1.3]",
                    phase === "pending"
                      ? "font-medium text-foreground/70"
                      : "font-semibold text-foreground"
                  )}
                >
                  {phase !== "pending" && `${n}. `}
                  {item.client.name}
                </div>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-[3px] text-[11.5px] text-muted-foreground">
                  {phase === "done" && (
                    <>
                      <span className="whitespace-nowrap text-[11px] font-semibold" style={{ color: resultColor }}>
                        {RESULT_LABELS[item.result]}
                      </span>
                      <span className="whitespace-nowrap">{fmtDuration(item.end - item.start)}</span>
                      {item.outsideGeofence && (
                        <span className="whitespace-nowrap" style={{ color: palette.status.pausa }}>
                          Check-in a {item.offsetMeters} m
                        </span>
                      )}
                    </>
                  )}
                  {phase === "now" && (
                    <>
                      <span className="whitespace-nowrap rounded bg-[#cbe71e] px-1.5 text-[11px] font-semibold text-[#141414]">
                        En curso
                      </span>
                      <span className="whitespace-nowrap">{fmtDuration(t - item.start)}</span>
                    </>
                  )}
                  {phase === "pending" && (
                    <>
                      <span className="whitespace-nowrap">{item.client.code}</span>
                      <span className="whitespace-nowrap">~{fmtDuration(item.end - item.start)}</span>
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
