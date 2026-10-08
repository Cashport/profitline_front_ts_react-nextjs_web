"use client";

import { Modal } from "antd";
import { X } from "lucide-react";

import { cn } from "@/utils/utils";

import { PROJECTS, statusLabel } from "../../constants";
import type { DayMode, IVisitsAdvisor, IVisitsPalette } from "../../types";
import {
  completedVisits,
  dayProjection,
  effectiveTime,
  hourlyActivities,
  positionAt,
  registeredActivities,
  stateAt,
  visitsOf
} from "../../utils/visits-calc";
import { fmtClock, fmtDuration, fmtNumber } from "../../utils/visits-format";
import StatusPill from "../shared/status-pill";

interface AdvisorDayModalProps {
  advisor: IVisitsAdvisor | null;
  t: number;
  dayMode: DayMode;
  /** "Hoy" o la fecha del día que se mira. */
  dayLabel: string;
  rank: number;
  totalAdvisors: number;
  zoneName: string;
  palette: IVisitsPalette;
  isDark: boolean;
  onClose: () => void;
  onShowOnMap: (id: number) => void;
}

/** Cómo va el asesor en el día: meta, proyección al cierre, ritmo y registro de actividades. */
export default function AdvisorDayModal({
  advisor: a,
  t,
  dayMode,
  dayLabel,
  rank,
  totalAdvisors,
  zoneName,
  palette,
  isDark,
  onClose,
  onShowOnMap
}: AdvisorDayModalProps) {
  return (
    <Modal
      open={Boolean(a)}
      onCancel={onClose}
      footer={null}
      closable={false}
      centered
      width={620}
      destroyOnClose
      // El modal vive en un portal fuera de <main class="dark">: se le devuelve el tema.
      rootClassName={isDark ? "dark" : undefined}
      styles={{ content: { padding: 0, overflow: "hidden", borderRadius: 16 } }}
    >
      {a && (
        <DayContent
          advisor={a}
          t={t}
          dayMode={dayMode}
          dayLabel={dayLabel}
          rank={rank}
          totalAdvisors={totalAdvisors}
          zoneName={zoneName}
          palette={palette}
          onClose={onClose}
          onShowOnMap={onShowOnMap}
        />
      )}
    </Modal>
  );
}

function DayContent({
  advisor: a,
  t,
  dayMode,
  dayLabel,
  rank,
  totalAdvisors,
  zoneName,
  palette,
  onClose,
  onShowOnMap
}: Omit<AdvisorDayModalProps, "advisor" | "isDark"> & { advisor: IVisitsAdvisor }) {
  const state = stateAt(a, t);
  const te = effectiveTime(a, t);
  const project = PROJECTS[a.project];
  const visits = visitsOf(a);
  const done = completedVisits(a, t);
  const registered = registeredActivities(a, t);
  const projection = dayProjection(a, t, state.status, dayMode);
  const { ok } = projection;
  const effective = done.filter((v) => v.result === "efectiva").length;
  const { km } = positionAt(a, te);
  const hourly = hourlyActivities(a, t);
  const maxHour = Math.max(1, ...hourly.map((h) => h.count));
  const best = hourly.reduce((x, y) => (y.count > x.count ? y : x), hourly[0]);
  const log = a.activities
    .filter((g) => g.t <= te)
    .slice()
    .reverse();
  const visitAt = (minute: number) =>
    visits.find((v) => minute >= v.start - 1 && minute <= v.end + 1);
  const color = palette.status[state.status];

  const miniKpis: { label: string; value: string | number; suffix?: string }[] = [
    a.fixed
      ? { label: "Registradas", value: registered }
      : { label: "Visitas", value: done.length, suffix: `/ ${visits.length}` },
    {
      label: "Tasa de éxito",
      value: registered ? Math.round((ok / registered) * 100) : 0,
      suffix: "%"
    },
    a.fixed
      ? { label: "En el punto", value: fmtDuration(Math.max(0, te - visits[0].start)) }
      : {
          label: "Efectividad visita",
          value: done.length ? Math.round((effective / done.length) * 100) : 0,
          suffix: "%"
        },
    { label: "Recorrido", value: fmtNumber(km, 1), suffix: "km" }
  ];

  return (
    <div className="wallet-scope flex max-h-[calc(100vh-40px)] flex-col bg-card text-foreground">
      <div className="flex items-center gap-3 border-b border-border px-5 py-4">
        <div
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 bg-secondary text-xs font-semibold"
          style={{ borderColor: color }}
        >
          {a.initials}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[17px] font-semibold">{a.name}</h3>
          <p className="mt-px flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <span className="whitespace-nowrap">
              {project.name} · Zona {zoneName}
            </span>
            <StatusPill label={statusLabel(state.status, dayMode === "future")} color={color} />
            <span className="whitespace-nowrap">
              {dayLabel} · corte {fmtClock(t)}
            </span>
          </p>
        </div>
        <button
          type="button"
          aria-label="Cerrar"
          onClick={onClose}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-col gap-3 overflow-y-auto px-5 pb-[18px] pt-4">
        {/* Mismo negro con verde de marca en ambos temas. */}
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-x-4 gap-y-1.5 rounded-[14px] bg-[#141414] px-[18px] py-4 text-white">
          <div>
            <div className="text-xs text-[#bdbdbd]">Actividades efectivas · {project.unit}</div>
            <div className="text-[52px] font-bold leading-[0.95] tracking-[-0.04em] text-[#cbe71e] max-[520px]:text-[42px]">
              {ok}
              <small className="ml-1 text-lg font-medium tracking-normal text-[#bdbdbd]">
                / {a.goal}
              </small>
            </div>
          </div>
          <div className="text-right">
            <b className="block text-[28px] font-bold leading-none">#{rank}</b>
            <span className="text-[11.5px] text-[#bdbdbd]">de {totalAdvisors} en el ranking</span>
          </div>
          <div className="relative col-span-2 mt-2.5 h-2.5 rounded-[5px] bg-[#333]">
            <em
              className="absolute inset-y-0 left-0 rounded-[5px] border-[1.5px] border-l-0 border-dashed border-[#cbe71e]"
              style={{ width: `${projection.pctProjectedBar}%` }}
            />
            <i
              className="absolute inset-y-0 left-0 rounded-[5px] bg-[#cbe71e]"
              style={{ width: `${Math.min(100, projection.pctGoal)}%` }}
            />
            <u className="absolute -top-1 left-[calc(100%-2px)] h-[18px] w-0.5 bg-white" />
          </div>
          <div className="col-span-2 flex flex-wrap justify-between gap-2 text-[11.5px] text-[#bdbdbd]">
            <span className="whitespace-nowrap">
              <b className="font-semibold text-white">{projection.pctGoal}%</b> de la meta
            </span>
            <span className="whitespace-nowrap">
              Proyección al cierre <b className="font-semibold text-white">{projection.projected}</b> (
              {Math.round((projection.projected / a.goal) * 100)}%)
            </span>
            <span className="whitespace-nowrap">
              Ritmo <b className="font-semibold text-white">{fmtNumber(projection.rate, 1)}</b>/hora
            </span>
          </div>
        </div>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-2">
          {miniKpis.map((k) => (
            <div key={k.label} className="rounded-[10px] bg-secondary px-[11px] py-[9px]">
              <span className="block text-[11px] text-muted-foreground">{k.label}</span>
              <b className="text-lg font-semibold">
                {k.value}
                {k.suffix && (
                  <small className="ml-0.5 text-[11px] font-medium text-muted-foreground">
                    {k.suffix}
                  </small>
                )}
              </b>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-border px-3.5 py-3">
          <h4 className="mb-2 flex justify-between gap-2 text-[12.5px] font-semibold">
            Actividades por hora
            <span className="text-[11.5px] font-normal text-muted-foreground">
              {best.count ? `Mejor hora ${best.hour}:00 · ${best.count}` : "Sin actividades aún"}
            </span>
          </h4>
          <div className="flex h-[84px] items-end gap-1">
            {hourly.map((h) => (
              <div
                key={h.hour}
                title={`${h.hour}:00 · ${h.count}`}
                className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-[3px]"
              >
                <b className="text-[10px] font-semibold">{h.count || ""}</b>
                <i
                  className={cn(
                    "block w-full min-h-[2px] rounded-t-[3px]",
                    h.future
                      ? "border-[1.5px] border-b-0 border-dashed border-border"
                      : h.count
                        ? "bg-[#cbe71e]"
                        : "bg-border"
                  )}
                  style={{ height: h.future ? 18 : (h.count / maxHour) * 62 }}
                />
                <em className="text-[9.5px] not-italic text-muted-foreground">{h.hour}</em>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="mb-2 flex justify-between gap-2 text-[12.5px] font-semibold">
            Registro del día
            <span className="text-[11.5px] font-normal text-muted-foreground">
              {registered} registradas · {ok} efectivas
            </span>
          </h4>
          <ol className="flex flex-col">
            {log.length ? (
              log.slice(0, 12).map((g) => {
                const visit = visitAt(g.t);
                return (
                  <li
                    key={g.t}
                    className="grid grid-cols-[42px_10px_minmax(0,1fr)_auto] items-center gap-2 border-b border-border px-0.5 py-[7px] text-[12.5px] last:border-b-0 max-[520px]:grid-cols-[38px_10px_minmax(0,1fr)]"
                  >
                    <span className="text-[11.5px] text-muted-foreground">{fmtClock(g.t)}</span>
                    <i
                      className={cn("h-2 w-2 rounded-full", g.ok ? "bg-[#9bb514]" : "bg-border")}
                    />
                    <span className="truncate">{visit ? visit.client.name : "Punto de atención"}</span>
                    <span className="whitespace-nowrap text-[11px] text-muted-foreground max-[520px]:hidden">
                      {g.ok ? "Efectiva" : "No efectiva"}
                    </span>
                  </li>
                );
              })
            ) : (
              <li className="py-[7px] text-[12.5px] text-muted-foreground">
                Aún no hay actividades registradas.
              </li>
            )}
          </ol>
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t border-border px-5 py-3">
        <button
          type="button"
          onClick={onClose}
          className="h-10 rounded-[10px] px-3.5 text-[13.5px] font-semibold text-foreground transition-colors hover:bg-secondary"
        >
          Cerrar
        </button>
        <button
          type="button"
          onClick={() => onShowOnMap(a.id)}
          className="h-10 rounded-[10px] bg-[#cbe71e] px-[30px] text-[13.5px] font-semibold text-[#141414] transition-colors hover:bg-[#bfd916]"
        >
          Ver en mapa
        </button>
      </div>
    </div>
  );
}
