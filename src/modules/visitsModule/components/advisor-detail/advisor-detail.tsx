"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/utils/utils";

import { MISSING, PROJECTS } from "../../constants";
import type { ILiveAdvisor, ILiveRun, ILiveState, IVisitsPalette, LngLat } from "../../types";
import { fmtClock, fmtDuration, fmtNumber } from "../../utils/visits-format";
import { livePositionAt, liveSignalAt, liveVisitRuns, runPhase } from "../../utils/visits-live";
import StatusPill from "../shared/status-pill";

interface AdvisorDetailProps {
  advisor: ILiveAdvisor;
  /** Estado en el minuto que se mira. */
  state: ILiveState;
  t: number;
  isLive: boolean;
  palette: IVisitsPalette;
  onBack: () => void;
  onJumpToRun: (run: ILiveRun) => void;
  onFlyTo: (center: LngLat) => void;
}

/** Qué está haciendo en `t`, en una línea junto al estado. */
function nowText(a: ILiveAdvisor, s: ILiveState, t: number) {
  if (s.status === "visita" && s.run) {
    return `en ${a.currentClient ?? MISSING} · ${fmtDuration(t - s.run.start)}`;
  }
  if (s.status === "transito" && a.next) {
    return `hacia ${a.next.clientName} · ETA ${fmtClock(a.next.start)}`;
  }
  if (s.status === "pausa" && s.run) return `desde ${fmtClock(s.run.start)}`;
  return "";
}

/** Antigüedad de la última posición: "ahora" dentro del primer minuto. */
const signalAge = (minutes: number) => (minutes < 1 ? "ahora" : `hace ${fmtDuration(minutes)}`);

const STOP_ROW =
  "grid cursor-pointer grid-cols-[44px_16px_minmax(0,1fr)] gap-2 rounded-[7px] pr-1.5 transition-colors hover:bg-secondary";
/** Fila sin un lugar al que llevar el mapa. */
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

/** Vista de un asesor: estado, actividades, KPIs y ruta del día; "XX" en lo que aún no llega. */
export default function AdvisorDetail({
  advisor: a,
  state,
  t,
  isLive,
  palette,
  onBack,
  onJumpToRun,
  onFlyTo
}: AdvisorDetailProps) {
  const color = palette.status[state.status];
  const project = a.project ? PROJECTS[a.project] : null;
  const { total, completed, failed, pending, done } = a.visits;
  // Inicio de jornada, si en `t` ya había empezado.
  const startedAt = a.dayStart != null && t >= a.dayStart ? a.dayStart : null;
  const startText = startedAt != null ? fmtClock(startedAt) : "—";
  const km = livePositionAt(a, t)?.km ?? 0;
  const signalAt = liveSignalAt(a, t);
  const gps = a.gpsAccuracy != null ? `±${a.gpsAccuracy} m` : MISSING;
  const ok = a.activitiesOk;
  const progress = ok != null && a.goal ? Math.min(100, (ok / a.goal) * 100) : 0;
  // Los tramos cuentan hasta `t`: lo que viene después aún no pasa en el minuto que se mira.
  const runMinutes = (r: ILiveRun) => Math.min(r.end ?? t, t) - r.start;
  const visitRuns = liveVisitRuns(a);
  const visitsSoFar = visitRuns.filter((r) => r.start <= t);
  const closedVisits = visitsSoFar.filter((r) => runPhase(r, t) === "done");
  const inVisit = visitsSoFar.reduce((sum, r) => sum + runMinutes(r), 0);
  const closedMinutes = closedVisits.reduce((sum, r) => sum + runMinutes(r), 0);
  const nextAt = a.next?.position ?? null;
  // Los totales de visitas son los del día: van con el estado actual, no con el de `t`.
  const inProgress = a.status === "visita";
  const restOfRoute = Math.max(0, pending - (inProgress ? 1 : 0) - (a.next ? 1 : 0));

  const tiles: { label: string; value: string | number; suffix?: string; detail: string }[] = [
    { label: "Visitas", value: done, suffix: `/ ${total}`, detail: `${pending} por hacer` },
    {
      label: "Efectividad",
      value: done ? fmtNumber((completed / done) * 100) : 0,
      suffix: "%",
      detail: `${completed} efectivas`
    },
    { label: "Recorrido", value: fmtNumber(km, 1), suffix: "km", detail: `desde ${startText}` },
    {
      label: "En visita",
      value: fmtDuration(inVisit),
      detail: closedVisits.length
        ? `${Math.round(closedMinutes / closedVisits.length)} min prom.`
        : "—"
    }
  ];

  // Barra de visitas: efectivas, fallidas, la que está en curso y las pendientes (sin color).
  const strip: (string | null)[] = [
    ...Array<string>(completed).fill(palette.result.efectiva),
    ...Array<string>(failed).fill(palette.result.sincontacto),
    ...(inProgress ? [palette.accent] : []),
    ...Array<null>(Math.max(0, pending - (inProgress ? 1 : 0))).fill(null)
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
          {a.initials}
        </div>
        <div className="min-w-0">
          <h2 className="truncate text-[17px] font-semibold tracking-[-0.01em] text-foreground">
            {a.name}
          </h2>
          <div className="text-xs text-muted-foreground">
            {a.code ?? MISSING} · Zona {a.zoneName ?? MISSING}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
            <StatusPill label={state.label} color={color} />
            {/* El modal del día sigue con datos simulados: se habilita cuando se conecte. */}
            <button
              type="button"
              disabled
              title="Aún no conectado"
              className="flex h-6 items-center gap-0.5 rounded-lg bg-[#cbe71e] pl-2 pr-1.5 text-xs font-bold text-[#141414] transition-colors enabled:hover:bg-[#b9d417] disabled:cursor-not-allowed disabled:opacity-40"
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
          Batería{" "}
          <b className="font-medium text-foreground/80">
            {a.battery != null ? `${a.battery}%` : MISSING}
          </b>
        </span>
        <span className="whitespace-nowrap">
          GPS <b className="font-medium text-foreground/80">{gps}</b>
        </span>
        <span className="whitespace-nowrap">
          Últ. señal{" "}
          <b className="font-medium text-foreground/80">
            {signalAt == null ? "—" : isLive ? signalAge(t - signalAt) : fmtClock(signalAt)}
          </b>
        </span>
        <span className="whitespace-nowrap">
          Inicio <b className="font-medium text-foreground/80">{startText}</b>
        </span>
      </div>

      <div className="mt-3 rounded-xl border border-border px-3 py-2.5">
        <div className="flex items-baseline justify-between gap-2 text-xs font-semibold text-foreground">
          <span>Actividades · {project?.name ?? MISSING}</span>
          <b className="whitespace-nowrap text-xl font-semibold">
            {ok ?? MISSING}
            <small className="text-xs font-medium text-muted-foreground">
              /{a.goal ?? MISSING}
            </small>
          </b>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-[3px] bg-secondary">
          <i className="block h-full bg-[#cbe71e]" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-1.5 text-[11px] text-muted-foreground">
          {project?.definition ?? MISSING} · {MISSING} registradas
        </div>
        {/* Las actividades por hora salen del registro de actividades, que aún no llega. */}
        <div className="mt-2.5 grid h-[38px] place-items-center rounded-sm bg-secondary text-[11px] font-semibold text-muted-foreground">
          {MISSING}
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
        {strip.map((background, i) => (
          <i
            key={i}
            className={cn("flex-1 rounded-sm", !background && "bg-border")}
            style={{ background: background ?? undefined }}
          />
        ))}
      </div>

      <div className="mb-1.5 mt-[18px] flex items-baseline justify-between whitespace-nowrap">
        <span className="text-[11.5px] font-medium text-muted-foreground">Ruta del día</span>
        <span className="text-[10.5px] text-muted-foreground">{pending} pendientes</span>
      </div>

      <ol className="relative">
        {startedAt != null && (
          <li className={STATIC_ROW}>
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
              <div className="mt-0.5 text-[11.5px] text-muted-foreground">Check-in app · {gps}</div>
            </div>
          </li>
        )}

        {/* Pausas y visitas reportadas hasta `t`; el tránsito queda entre paradas. */}
        {a.runs.map((run) => {
          if (run.start > t) return null;
          const closed = runPhase(run, t) === "done";
          if (run.status === "pausa") {
            return (
              <li key={`p-${run.start}`} className={STOP_ROW} onClick={() => onJumpToRun(run)}>
                <div className="pt-2 text-right text-[11px] tabular-nums text-foreground/70">
                  {fmtClock(run.start)}
                </div>
                <Rail done={closed}>
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
                    {closed
                      ? fmtDuration(runMinutes(run))
                      : `en curso · ${fmtDuration(runMinutes(run))}`}
                  </div>
                </div>
              </li>
            );
          }
          if (run.status !== "visita") return null;
          // De las visitas cerradas no llega el cliente; de la que está en curso, tampoco aún.
          const client = closed ? null : a.currentClient;

          return (
            <li key={`v-${run.start}`} className={STOP_ROW} onClick={() => onJumpToRun(run)}>
              <div className="pt-2 text-right text-[11px] tabular-nums text-foreground/70">
                {fmtClock(run.start)}
              </div>
              <Rail done={closed}>
                <div
                  className={cn(
                    NODE,
                    !closed &&
                      "border-[#141414] bg-[#cbe71e] shadow-[0_0_0_4px_rgba(203,231,30,0.4)]"
                  )}
                  style={closed ? { borderColor: palette.ink2 } : undefined}
                />
              </Rail>
              <div className="min-w-0 pb-2.5 pt-1.5">
                <div className="text-[12.5px] font-semibold leading-[1.3] text-foreground">
                  {visitRuns.indexOf(run) + 1}. {client ?? MISSING}
                </div>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-[3px] text-[11.5px] text-muted-foreground">
                  {closed ? (
                    // El resultado de la visita aún no llega.
                    <span className="whitespace-nowrap text-[11px] font-semibold">{MISSING}</span>
                  ) : (
                    <span className="whitespace-nowrap rounded bg-[#cbe71e] px-1.5 text-[11px] font-semibold text-[#141414]">
                      En curso
                    </span>
                  )}
                  <span className="whitespace-nowrap">{fmtDuration(runMinutes(run))}</span>
                </div>
              </div>
            </li>
          );
        })}

        {a.next && (
          <li
            className={nextAt ? STOP_ROW : STATIC_ROW}
            onClick={nextAt ? () => onFlyTo(nextAt) : undefined}
          >
            <div className="pt-2 text-right text-[11px] tabular-nums text-muted-foreground">
              {fmtClock(a.next.start)}
            </div>
            <Rail done={false}>
              <div
                className={cn(NODE, "border-dashed text-muted-foreground")}
                style={{ borderColor: palette.ink3 }}
              >
                {visitRuns.length + 1}
              </div>
            </Rail>
            <div className="min-w-0 pb-2.5 pt-1.5">
              <div className="text-[12.5px] font-medium leading-[1.3] text-foreground/70">
                {a.next.clientName}
              </div>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-[3px] text-[11.5px] text-muted-foreground">
                <span className="whitespace-nowrap">{a.next.nit}</span>
                <span className="whitespace-nowrap">~{fmtDuration(a.next.end - a.next.start)}</span>
              </div>
            </div>
          </li>
        )}

        {restOfRoute > 0 && (
          <li className={STATIC_ROW}>
            <div className="pt-2 text-right text-[11px] tabular-nums text-muted-foreground">
              {MISSING}
            </div>
            <Rail done={false}>
              <div className={cn(NODE, "border-dashed")} style={{ borderColor: palette.ink3 }} />
            </Rail>
            <div className="min-w-0 pb-2.5 pt-1.5">
              <div className="text-[12.5px] font-medium leading-[1.3] text-foreground/70">
                {restOfRoute === 1 ? "1 visita más" : `${restOfRoute} visitas más`}
              </div>
              <div className="mt-0.5 text-[11.5px] text-muted-foreground">
                Clientes y horarios: {MISSING}
              </div>
            </div>
          </li>
        )}
      </ol>
    </div>
  );
}
