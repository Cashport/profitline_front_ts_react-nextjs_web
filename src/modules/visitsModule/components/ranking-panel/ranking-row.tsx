"use client";

import { MapPin } from "lucide-react";

import { cn } from "@/utils/utils";

import { MISSING, PROJECTS } from "../../constants";
import type { ILiveAdvisor, ILiveState, IVisitsPalette } from "../../types";
import { fmtClock, fmtDuration } from "../../utils/visits-format";

interface RankingRowProps {
  advisor: ILiveAdvisor;
  /** Estado en el minuto que se mira. */
  state: ILiveState;
  /** Puesto dentro de la lista visible (1 = primero). */
  position: number;
  t: number;
  palette: IVisitsPalette;
  onSelect: (id: number) => void;
  onHover: (id: number | null) => void;
}

/** Detalle del estado y dónde está, como lo cuenta la fila; "XX" en lo que aún no llega. */
function describe(a: ILiveAdvisor, s: ILiveState, t: number) {
  const since = s.run ? fmtDuration(t - s.run.start) : null;
  const zone = a.zoneName ?? MISSING;
  let detail: string | null = null;
  let where: string;

  switch (s.status) {
    case "visita":
      detail = since;
      where = a.currentClient ?? MISSING;
      break;
    case "transito":
      detail = a.next ? `ETA ${fmtClock(a.next.start)}` : null;
      where = a.next ? `Hacia ${a.next.clientName}` : `Zona ${zone}`;
      break;
    case "pausa":
      detail = since;
      // El día simulado nombraba el último cliente visitado; el API aún no lo envía.
      where = `Cerca de ${MISSING}`;
      break;
    default:
      // Sin iniciar (antes del primer punto) o un estado que aún no se mapea.
      where = !s.run
        ? `No ha abierto jornada · ${a.visits.total} programadas`
        : a.next
          ? `Próxima ${fmtClock(a.next.start)} · ${a.next.clientName}`
          : "Sin visitas pendientes";
  }

  return { detail, where: `${where} · ${zone}` };
}

export default function RankingRow({
  advisor: a,
  state,
  position,
  t,
  palette,
  onSelect,
  onHover
}: RankingRowProps) {
  const color = palette.status[state.status];
  const project = a.project ? PROJECTS[a.project] : null;
  const ratio = a.activitiesOk != null && a.goal ? a.activitiesOk / a.goal : null;
  const low = ratio == null || ratio < 0.35;
  const { detail, where } = describe(a, state, t);
  // Mientras no lleguen las actividades, el podio sale de las visitas efectivas.
  const podium = position <= 3 && a.visits.completed > 0 ? position : 0;

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
            {project?.name ?? MISSING}
          </span>
        </div>
        <div className="truncate text-[11.5px] text-muted-foreground">
          <b className="font-semibold text-foreground">
            <span
              className="mr-[5px] inline-block h-1.5 w-1.5 rounded-full align-[1px]"
              style={{ background: color }}
            />
            {state.label}
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
        title={`Actividades · ${project?.definition ?? MISSING}`}
      >
        {/* Sin abrir el día: su modal sigue con datos simulados. */}
        <span
          className={cn(
            "flex h-[26px] min-w-[50px] items-center justify-center gap-0.5 rounded-lg px-2",
            low ? "bg-secondary text-foreground" : "bg-[#cbe71e] text-[#141414]"
          )}
        >
          <b className="text-[15px] font-bold tracking-[-0.02em]">{a.activitiesOk ?? MISSING}</b>
          <small
            className={cn("text-[11px] font-medium", low ? "text-muted-foreground" : "text-[#3d4a00]")}
          >
            /{a.goal ?? MISSING}
          </small>
        </span>
        <span className="whitespace-nowrap text-[10.5px] text-muted-foreground">
          <b className="font-semibold text-foreground">
            {ratio != null ? Math.round(ratio * 100) : MISSING}%
          </b>
          {" · "}
          {a.visits.done}/{a.visits.total} vis.
        </span>
      </div>
    </li>
  );
}
