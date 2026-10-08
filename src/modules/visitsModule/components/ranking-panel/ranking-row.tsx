"use client";

import { MapPin } from "lucide-react";

import { cn } from "@/utils/utils";

import { PROJECTS } from "../../constants";
import type { DayMode, IAdvisorState, IVisitsAdvisor, IVisitsPalette } from "../../types";
import { completedVisits, okActivities, visitsOf } from "../../utils/visits-calc";
import { fmtClock, fmtDuration } from "../../utils/visits-format";

interface RankingRowProps {
  advisor: IVisitsAdvisor;
  state: IAdvisorState;
  /** Puesto dentro de la lista visible (1 = primero). */
  position: number;
  t: number;
  now: number;
  dayMode: DayMode;
  zoneName: string;
  palette: IVisitsPalette;
  onSelect: (id: number) => void;
  onHover: (id: number | null) => void;
  onOpenDay: (id: number) => void;
}

/** Qué hace el asesor (estado + detalle) y dónde está, como lo cuenta la fila. */
function describe(
  a: IVisitsAdvisor,
  s: IAdvisorState,
  t: number,
  now: number,
  dayMode: DayMode,
  zoneName: string
) {
  const done = completedVisits(a, t);
  const planned = visitsOf(a);
  const last = done[done.length - 1];
  let status: string;
  let detail: string | null = null;
  let where: string;

  switch (s.status) {
    case "visita": {
      const client = s.item?.type === "visita" ? s.item.client.name : "";
      status = a.fixed ? "En punto" : "En visita";
      detail = a.fixed
        ? `desde ${fmtClock(s.item?.start ?? t)}`
        : fmtDuration(t - (s.item?.start ?? t));
      where = client;
      break;
    }
    case "transito":
      status = "En tránsito";
      detail = s.next ? `ETA ${fmtClock(s.next.start)}` : null;
      where = s.next ? `Hacia ${s.next.client.name}` : `Zona ${zoneName}`;
      break;
    case "pausa":
      status = "En pausa";
      detail = fmtDuration(t - (s.item?.start ?? t));
      where = last ? `Cerca de ${last.client.name}` : `Zona ${zoneName}`;
      break;
    case "sinsenal": {
      const lost = s.signalLostAt ?? t;
      const at = s.item?.type === "visita" ? ` en ${s.item.client.name}` : "";
      status = "Sin señal";
      detail = fmtDuration(t - lost);
      where = `Última vez ${fmtClock(lost)}${at}`;
      break;
    }
    case "nostart":
      if (dayMode === "future") {
        status = "Programado";
        detail = `${planned.length} visitas`;
        where = planned[0]
          ? `Primera visita ${fmtClock(planned[0].start)} · ${planned[0].client.name}`
          : "Sin visitas";
      } else {
        status = "Sin iniciar";
        where =
          dayMode === "today" && a.dayStart > now
            ? `No ha abierto jornada · ${planned.length} programadas`
            : `Inicia ${fmtClock(a.dayStart)}`;
      }
      break;
    default:
      status = "Jornada cerrada";
      where = last ? `Última visita ${fmtClock(last.end)} · ${last.client.name}` : "Sin visitas";
  }

  return { status, detail, where: `${where} · ${zoneName}` };
}

export default function RankingRow({
  advisor: a,
  state,
  position,
  t,
  now,
  dayMode,
  zoneName,
  palette,
  onSelect,
  onHover,
  onOpenDay
}: RankingRowProps) {
  const color = palette.status[state.status];
  const ok = okActivities(a, t);
  const ratio = ok / a.goal;
  const low = ratio < 0.35;
  const doneCount = completedVisits(a, t).length;
  const { status, detail, where } = describe(a, state, t, now, dayMode, zoneName);
  // El podio sólo se pinta si ya hay actividades: con todos en cero no hay líder.
  const podium = position <= 3 && ok > 0 ? position : 0;

  return (
    <li
      role="button"
      tabIndex={0}
      onClick={() => onSelect(a.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" && e.target === e.currentTarget) onSelect(a.id);
      }}
      onMouseEnter={() => onHover(a.id)}
      onMouseLeave={() => onHover(null)}
      className="grid cursor-pointer grid-cols-[28px_minmax(0,1fr)_auto] items-start gap-[9px] rounded-[10px] border-b border-border py-[9px] pl-1.5 pr-1 transition-colors hover:bg-secondary"
    >
      <div
        className="relative grid h-7 w-7 place-items-center rounded-full border-2 bg-secondary text-[9.5px] font-semibold text-foreground"
        style={{ borderColor: color }}
      >
        {a.initials}
        <span
          className={cn(
            "absolute -left-1.5 -top-[5px] grid h-[15px] min-w-[15px] place-items-center rounded-full border border-border bg-card px-[3px] text-[9px] font-bold leading-none text-muted-foreground",
            podium === 1 && "border-0 bg-[#141414] text-[#cbe71e]",
            (podium === 2 || podium === 3) && "border-0 bg-[#cbe71e] text-[#141414]"
          )}
        >
          {position}
        </span>
      </div>

      <div className="flex min-w-0 flex-col gap-px">
        <div className="flex min-w-0 items-baseline gap-1.5">
          <span className="min-w-0 truncate text-[13px] font-semibold text-foreground">{a.name}</span>
          <span className="shrink-0 whitespace-nowrap rounded bg-secondary px-[5px] py-px text-[9.5px] font-semibold text-muted-foreground">
            {PROJECTS[a.project].name}
          </span>
        </div>
        <div className="truncate text-[11.5px] text-muted-foreground">
          <b className="font-semibold text-foreground">
            <span
              className="mr-[5px] inline-block h-1.5 w-1.5 rounded-full align-[1px]"
              style={{ background: color }}
            />
            {status}
          </b>
          {detail && ` · ${detail}`}
        </div>
        <div className="flex min-w-0 items-center gap-1 text-[11.5px] text-muted-foreground">
          <MapPin className="h-[11px] w-[11px] shrink-0" />
          <span className="min-w-0 truncate">{where}</span>
        </div>
      </div>

      <div
        className="flex flex-col items-end gap-[3px] pt-px"
        title={`Actividades · ${PROJECTS[a.project].definition}`}
      >
        <button
          type="button"
          title="Ver cómo va en el día"
          onClick={(e) => {
            e.stopPropagation();
            onOpenDay(a.id);
          }}
          className={cn(
            "flex h-[26px] min-w-[50px] items-center justify-center gap-0.5 rounded-lg px-2 transition-colors",
            low
              ? "bg-secondary text-foreground hover:bg-border"
              : "bg-[#cbe71e] text-[#141414] hover:bg-[#b9d417]"
          )}
        >
          <b className="text-[15px] font-bold tracking-[-0.02em]">{ok}</b>
          <small
            className={cn("text-[11px] font-medium", low ? "text-muted-foreground" : "text-[#3d4a00]")}
          >
            /{a.goal}
          </small>
        </button>
        <span className="whitespace-nowrap text-[10.5px] text-muted-foreground">
          <b className="font-semibold text-foreground">{Math.round(ratio * 100)}%</b>
          {" · "}
          {a.fixed ? "fijo" : `${doneCount}/${visitsOf(a).length} vis.`}
        </span>
      </div>
    </li>
  );
}
