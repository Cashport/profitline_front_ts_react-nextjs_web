"use client";

import { Modal } from "antd";
import { X } from "lucide-react";

import type { IAdvisorVisitDetail } from "@/types/visits/IVisits";
import { cn } from "@/utils/utils";

import { ACTIVITY_HOURS } from "../../constants";
import type { IVisitsPalette } from "../../types";
import { fmtClock, fmtNumber, initialsOf, minutesOfDay } from "../../utils/visits-format";
import StatusPill from "../shared/status-pill";

interface AdvisorDayModalProps {
  /** Detalle del día del asesor abierto; null cierra el modal. */
  detail: IAdvisorVisitDetail | null;
  palette: IVisitsPalette;
  isDark: boolean;
  onClose: () => void;
  onShowOnMap: () => void;
}

/** Cómo va el asesor en el día: meta, proyección al cierre, ritmo y registro de actividades. */
export default function AdvisorDayModal({
  detail,
  palette,
  isDark,
  onClose,
  onShowOnMap
}: AdvisorDayModalProps) {
  return (
    <Modal
      open={Boolean(detail)}
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
      {detail && (
        <DayContent
          detail={detail}
          palette={palette}
          onClose={onClose}
          onShowOnMap={onShowOnMap}
        />
      )}
    </Modal>
  );
}

function DayContent({
  detail: d,
  palette,
  onClose,
  onShowOnMap
}: Omit<AdvisorDayModalProps, "detail" | "isDark"> & { detail: IAdvisorVisitDetail }) {
  const { activities, visits, tracking, ranking } = d;
  const color = palette.status[d.state];
  // Minuto en que se armó el detalle: las horas que vienen después van punteadas.
  const cutoff = minutesOfDay(d.generated_at);
  const maxHour = Math.max(1, ...activities.by_hour.map((h) => h.count));

  const miniKpis: { label: string; value: string | number; suffix?: string }[] = [
    { label: "Visitas", value: visits.completed + visits.failed, suffix: `/ ${visits.total}` },
    {
      label: "Tasa de éxito",
      value: visits.success_rate_pct != null ? fmtNumber(visits.success_rate_pct) : "—",
      suffix: visits.success_rate_pct != null ? "%" : undefined
    },
    {
      label: "Efectividad visita",
      value: visits.effectivity_pct != null ? fmtNumber(visits.effectivity_pct) : "—",
      suffix: visits.effectivity_pct != null ? "%" : undefined
    },
    { label: "Recorrido", value: fmtNumber(tracking.distance_km, 1), suffix: "km" }
  ];

  return (
    <div className="wallet-scope flex max-h-[calc(100vh-40px)] flex-col bg-card text-foreground">
      <div className="flex items-center gap-3 border-b border-border px-5 py-4">
        <div
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 bg-secondary text-xs font-semibold"
          style={{ borderColor: color }}
        >
          {initialsOf(d.user.userName)}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[17px] font-semibold">{d.user.userName}</h3>
          <p className="mt-px flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            {d.zones.length > 0 && (
              <span className="whitespace-nowrap">Zona {d.zones.join(", ")}</span>
            )}
            <StatusPill label={d.state_name} color={color} />
            <span className="whitespace-nowrap">Hoy · corte {fmtClock(cutoff)}</span>
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
            <div className="text-xs text-[#bdbdbd]">Actividades efectivas</div>
            <div className="text-[52px] font-bold leading-[0.95] tracking-[-0.04em] text-[#cbe71e] max-[520px]:text-[42px]">
              {activities.effective}
              <small className="ml-1 text-lg font-medium tracking-normal text-[#bdbdbd]">
                / {activities.goal}
              </small>
            </div>
          </div>
          <div className="text-right">
            <b className="block text-[28px] font-bold leading-none">
              {ranking.position != null ? `#${ranking.position}` : "—"}
            </b>
            <span className="text-[11.5px] text-[#bdbdbd]">de {ranking.total} en el ranking</span>
          </div>
          <div className="relative col-span-2 mt-2.5 h-2.5 rounded-[5px] bg-[#333]">
            {activities.projection_pct != null && (
              <em
                className="absolute inset-y-0 left-0 rounded-[5px] border-[1.5px] border-l-0 border-dashed border-[#cbe71e]"
                style={{ width: `${Math.min(100, activities.projection_pct)}%` }}
              />
            )}
            <i
              className="absolute inset-y-0 left-0 rounded-[5px] bg-[#cbe71e]"
              style={{ width: `${Math.min(100, activities.goal_pct)}%` }}
            />
            <u className="absolute -top-1 left-[calc(100%-2px)] h-[18px] w-0.5 bg-white" />
          </div>
          <div className="col-span-2 flex flex-wrap justify-between gap-2 text-[11.5px] text-[#bdbdbd]">
            <span className="whitespace-nowrap">
              <b className="font-semibold text-white">{fmtNumber(activities.goal_pct)}%</b> de la
              meta
            </span>
            <span className="whitespace-nowrap">
              Proyección al cierre{" "}
              <b className="font-semibold text-white">{activities.projection ?? "—"}</b>
              {activities.projection_pct != null && ` (${fmtNumber(activities.projection_pct)}%)`}
            </span>
            <span className="whitespace-nowrap">
              Ritmo{" "}
              <b className="font-semibold text-white">{fmtNumber(activities.pace_per_hour, 1)}</b>
              /hora
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
              {activities.best_hour
                ? `Mejor hora ${activities.best_hour.hour}:00 · ${activities.best_hour.count}`
                : "Sin actividades aún"}
            </span>
          </h4>
          <div className="flex h-[84px] items-end gap-1">
            {ACTIVITY_HOURS.map((hour) => {
              const count = activities.by_hour.find((h) => h.hour === hour)?.count ?? 0;
              const future = hour * 60 > cutoff;
              return (
                <div
                  key={hour}
                  title={`${hour}:00 · ${count}`}
                  className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-[3px]"
                >
                  <b className="text-[10px] font-semibold">{count || ""}</b>
                  <i
                    className={cn(
                      "block w-full min-h-[2px] rounded-t-[3px]",
                      future
                        ? "border-[1.5px] border-b-0 border-dashed border-border"
                        : count
                          ? "bg-[#cbe71e]"
                          : "bg-border"
                    )}
                    style={{ height: future ? 18 : (count / maxHour) * 62 }}
                  />
                  <em className="text-[9.5px] not-italic text-muted-foreground">{hour}</em>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h4 className="mb-2 flex justify-between gap-2 text-[12.5px] font-semibold">
            Registro del día
            <span className="text-[11.5px] font-normal text-muted-foreground">
              {activities.registered} registradas · {activities.effective} efectivas
            </span>
          </h4>
          <ol className="flex flex-col">
            {d.register.length ? (
              d.register.map((r) => (
                <li
                  key={r.response_id}
                  className="grid grid-cols-[42px_10px_minmax(0,1fr)_auto] items-center gap-2 border-b border-border px-0.5 py-[7px] text-[12.5px] last:border-b-0 max-[520px]:grid-cols-[38px_10px_minmax(0,1fr)]"
                >
                  <span className="text-[11.5px] text-muted-foreground">
                    {fmtClock(minutesOfDay(r.at))}
                  </span>
                  <i
                    className={cn("h-2 w-2 rounded-full", r.effective ? "bg-[#9bb514]" : "bg-border")}
                  />
                  <span className="truncate">{r.client_name}</span>
                  <span className="whitespace-nowrap text-[11px] text-muted-foreground max-[520px]:hidden">
                    {r.effective ? "Efectiva" : "No efectiva"}
                  </span>
                </li>
              ))
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
          onClick={onShowOnMap}
          className="h-10 rounded-[10px] bg-[#cbe71e] px-[30px] text-[13.5px] font-semibold text-[#141414] transition-colors hover:bg-[#bfd916]"
        >
          Ver en mapa
        </button>
      </div>
    </div>
  );
}
