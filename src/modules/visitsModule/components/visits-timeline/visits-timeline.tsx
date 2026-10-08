"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";

import { cn } from "@/utils/utils";

import {
  ACTIVE_STATUSES,
  DAY_END_MIN,
  DAY_START_MIN,
  STATUS_LABELS,
  TIMELINE_BUCKET_MIN
} from "../../constants";
import type { AdvisorStatus, DayMode, IVisitsAdvisor, IVisitsPalette } from "../../types";
import {
  advisorSegments,
  effectiveTime,
  visitsOf,
  type IAdvisorSegment,
  type ITimelineBucket,
  type SegmentKind
} from "../../utils/visits-calc";
import { fmtClock, fmtDuration } from "../../utils/visits-format";

interface VisitsTimelineProps {
  t: number;
  now: number;
  dayMode: DayMode;
  playing: boolean;
  speed: number;
  /** Barras de todo el equipo; se ignoran cuando hay un asesor enfocado. */
  buckets: ITimelineBucket[];
  /** Asesor enfocado: la línea muestra sus tramos en lugar del equipo. */
  advisor: IVisitsAdvisor | null;
  palette: IVisitsPalette;
  onTogglePlay: () => void;
  onToggleSpeed: () => void;
  onSeek: (minute: number) => void;
  onGoLive: () => void;
}

const pct = (m: number) => ((m - DAY_START_MIN) / (DAY_END_MIN - DAY_START_MIN)) * 100;

/** Altura de cada tramo del asesor: la visita manda, el tránsito y la pausa quedan por debajo. */
const SEGMENT_HEIGHT: Record<SegmentKind, number> = {
  visita: 30,
  transito: 18,
  pausa: 14,
  sinsenal: 30
};

interface Tooltip {
  x: number;
  title: string;
  rows: { color: string; label: string; value: string }[];
}

/**
 * Línea de tiempo de la jornada (7:00–18:30): reproducir, arrastrar el cabezal y
 * volver a en vivo. Sin asesor enfocado muestra cuántos asesores estaban activos
 * en cada tramo de 10 min; con uno enfocado, sus tramos y actividades.
 */
export default function VisitsTimeline({
  t,
  now,
  dayMode,
  playing,
  speed,
  buckets,
  advisor,
  palette,
  onTogglePlay,
  onToggleSpeed,
  onSeek,
  onGoLive
}: VisitsTimelineProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const [width, setWidth] = useState(0);
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const hours = width < 260 ? [7, 12, 17] : width < 480 ? [7, 10, 13, 16] : [7, 9, 11, 13, 15, 17];
  const segments = advisor ? advisorSegments(advisor, now) : [];
  const isLive = dayMode === "today" && t === now;
  const legend: AdvisorStatus[] = advisor ? [...ACTIVE_STATUSES, "sinsenal"] : ACTIVE_STATUSES;

  const minuteAt = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || !rect.width) return DAY_START_MIN;
    return DAY_START_MIN + ((clientX - rect.left) / rect.width) * (DAY_END_MIN - DAY_START_MIN);
  };

  const describeAt = (m: number): Omit<Tooltip, "x"> | null => {
    if (m < DAY_START_MIN || m > now) return null;
    if (!advisor) {
      const start =
        Math.floor((m - DAY_START_MIN) / TIMELINE_BUCKET_MIN) * TIMELINE_BUCKET_MIN + DAY_START_MIN;
      const bucket = buckets.find((b) => b.start === start);
      if (!bucket) return null;
      const on = ACTIVE_STATUSES.reduce((sum, s) => sum + (bucket.counts[s] ?? 0), 0);
      return {
        title: `${fmtClock(start)}–${fmtClock(start + TIMELINE_BUCKET_MIN)} · ${on} de ${bucket.total} conectados`,
        rows: ACTIVE_STATUSES.filter((s) => bucket.counts[s]).map((s) => ({
          color: palette.status[s],
          label: STATUS_LABELS[s],
          value: String(bucket.counts[s])
        }))
      };
    }
    const current = segments.find((s) => m >= s.start && m < s.end);
    const totals: Partial<Record<SegmentKind, number>> = {};
    segments.forEach((s) => {
      if (s.end <= m) totals[s.kind] = (totals[s.kind] ?? 0) + (s.end - s.start);
      else if (s.start < m) totals[s.kind] = (totals[s.kind] ?? 0) + (m - s.start);
    });
    const kinds: SegmentKind[] = ["visita", "transito", "pausa"];
    return {
      title: `${fmtClock(m)} · ${current ? STATUS_LABELS[current.kind] : "Sin iniciar"}`,
      rows: [
        ...kinds
          .filter((k) => totals[k])
          .map((k) => ({
            color: palette.status[k],
            label: `${STATUS_LABELS[k]} acumulado`,
            value: fmtDuration(totals[k] ?? 0)
          })),
        {
          color: palette.ink,
          label: "Actividades",
          value: String(advisor.activities.filter((g) => g.ok && g.t <= m).length)
        }
      ]
    };
  };

  const updateTooltip = (clientX: number) => {
    const info = describeAt(minuteAt(clientX));
    const wrap = wrapRef.current?.getBoundingClientRect();
    if (!info || !wrap) {
      setTooltip(null);
      return;
    }
    setTooltip({ ...info, x: clientX - wrap.left });
  };

  const segmentStyle = (s: IAdvisorSegment) => {
    const color = palette.status[s.kind];
    return {
      left: `${pct(s.start)}%`,
      width: `calc(${pct(s.end) - pct(s.start)}% - 1px)`,
      height: SEGMENT_HEIGHT[s.kind],
      background:
        s.kind === "sinsenal"
          ? `repeating-linear-gradient(90deg, ${color} 0 2px, transparent 2px 5px)`
          : color,
      opacity: s.start > t ? 0.3 : 1
    };
  };

  return (
    <div className="grid h-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3.5 rounded-2xl border border-border bg-card px-4">
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          aria-label={playing ? "Pausar" : "Reproducir"}
          onClick={onTogglePlay}
          className="grid h-8 w-8 place-items-center rounded-full border border-border bg-secondary text-foreground transition-colors hover:border-[#cbe71e]"
        >
          {playing ? (
            <Pause className="h-3 w-3 fill-current" />
          ) : (
            <Play className="h-3 w-3 fill-current" />
          )}
        </button>
        <button
          type="button"
          aria-label="Velocidad de reproducción"
          onClick={onToggleSpeed}
          className="rounded-[5px] border border-border px-1.5 py-[3px] text-[10.5px] text-muted-foreground transition-colors hover:text-foreground"
        >
          ×{speed}
        </button>
      </div>

      <div ref={wrapRef} className="relative h-[76px]">
        <div
          ref={trackRef}
          className="absolute inset-x-0 top-0.5 h-[38px] cursor-pointer touch-none"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            dragging.current = true;
            onSeek(minuteAt(e.clientX));
          }}
          onPointerMove={(e) => {
            if (dragging.current) onSeek(minuteAt(e.clientX));
            updateTooltip(e.clientX);
          }}
          onPointerUp={() => {
            dragging.current = false;
          }}
          onPointerCancel={() => {
            dragging.current = false;
          }}
          onPointerLeave={() => setTooltip(null)}
        >
          {/* Lo que aún no pasa: rayado y sin cabezal. */}
          <div
            className="absolute bottom-0 right-0 h-[34px] border-l border-dashed"
            style={{
              left: `${pct(now)}%`,
              borderColor: palette.ink3,
              background:
                "repeating-linear-gradient(135deg, transparent 0 4px, rgba(157,176,192,.12) 4px 5px)"
            }}
          />

          <div className="absolute inset-x-0 bottom-[3px] h-[34px]">
            {!advisor &&
              buckets.map((b) => {
                const on = ACTIVE_STATUSES.reduce((sum, s) => sum + (b.counts[s] ?? 0), 0);
                if (!on) return null;
                return (
                  <i
                    key={b.start}
                    className="absolute bottom-0 flex flex-col-reverse overflow-hidden rounded-[2px]"
                    style={{
                      left: `${pct(b.start)}%`,
                      width: `calc(${pct(b.start + TIMELINE_BUCKET_MIN) - pct(b.start)}% - 1.5px)`,
                      height: `${(on / b.total) * 100}%`,
                      // Lo que queda después del cabezal se atenúa mientras se repite el día.
                      opacity: b.start <= t ? 1 : 0.3
                    }}
                  >
                    {ACTIVE_STATUSES.filter((s) => b.counts[s]).map((s) => (
                      <b
                        key={s}
                        className="block w-full"
                        style={{
                          height: `${((b.counts[s] ?? 0) / on) * 100}%`,
                          background: palette.status[s]
                        }}
                      />
                    ))}
                  </i>
                );
              })}

            {advisor && (
              <>
                {advisor.dayStart > DAY_START_MIN && (
                  <span
                    className="absolute bottom-0 left-0 h-1.5 rounded-[2px] opacity-35"
                    style={{
                      width: `${pct(Math.min(advisor.dayStart, now))}%`,
                      background: palette.status.nostart
                    }}
                  />
                )}
                {segments.map((s) => (
                  <span
                    key={`${s.kind}-${s.start}`}
                    className="absolute bottom-0 rounded-[2px]"
                    style={segmentStyle(s)}
                  />
                ))}
                {advisor.activities
                  .filter((g) => g.ok && g.t <= effectiveTime(advisor, now))
                  .map((g) => (
                    <span
                      key={g.t}
                      className="absolute bottom-[31px] h-[3px] w-0.5 rounded-[1px]"
                      style={{
                        left: `${pct(g.t)}%`,
                        background: palette.ink,
                        opacity: g.t > t ? 0.3 : 1
                      }}
                    />
                  ))}
                {visitsOf(advisor)
                  .filter((v) => v.start > effectiveTime(advisor, now))
                  .map((v) => (
                    <span
                      key={v.client.id}
                      className="absolute bottom-0 box-border h-[30px] rounded-[2px] border border-b-0 border-dashed"
                      style={{
                        left: `${pct(v.start)}%`,
                        width: `calc(${pct(Math.min(v.end, DAY_END_MIN)) - pct(v.start)}% - 1px)`,
                        borderColor: palette.ink3
                      }}
                    />
                  ))}
              </>
            )}
          </div>

          <div className="absolute inset-x-0 bottom-0 h-0.5 rounded-[1px] bg-border" />
          <div
            className="absolute bottom-0 left-0 h-[3px] bg-[#cbe71e]"
            style={{ width: `${pct(t)}%` }}
          />
          <div
            className="pointer-events-none absolute -bottom-1.5 -ml-[7px] h-3.5 w-3.5 rounded-full border-2 border-foreground bg-[#cbe71e]"
            style={{ left: `${pct(t)}%` }}
          >
            <span className="absolute bottom-3 left-[4px] h-6 w-0.5 bg-foreground opacity-35" />
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-[46px] h-3 text-[9.5px] text-muted-foreground">
          {hours.map((h) => (
            <span key={h} className="absolute -translate-x-1/2" style={{ left: `${pct(h * 60)}%` }}>
              {h}:00
            </span>
          ))}
        </div>

        <div className="absolute left-0 top-[62px] flex max-w-full flex-nowrap gap-2.5 overflow-hidden text-[10px] text-muted-foreground">
          {legend.map((s) => (
            <span
              key={s}
              className={cn(
                "flex items-center gap-1 whitespace-nowrap",
                s === "sinsenal" && "max-[1300px]:hidden"
              )}
            >
              <i className="h-[7px] w-[7px] rounded-[2px]" style={{ background: palette.status[s] }} />
              {STATUS_LABELS[s]}
            </span>
          ))}
        </div>

        {tooltip && (
          <div
            className="pointer-events-none absolute bottom-[46px] z-20 -translate-x-1/2 whitespace-nowrap rounded-lg border border-border bg-popover px-2.5 py-[7px] text-[11px] text-muted-foreground shadow-[0_8px_22px_rgba(0,0,0,0.14)]"
            style={{ left: tooltip.x }}
          >
            <div className="mb-[3px] font-semibold text-foreground">{tooltip.title}</div>
            {tooltip.rows.map((row) => (
              <div key={row.label} className="flex items-center gap-1.5">
                <i className="h-2 w-2 rounded-[2px]" style={{ background: row.color }} />
                {row.label}
                <b className="ml-auto pl-3 font-semibold text-foreground">{row.value}</b>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        type="button"
        disabled={isLive}
        onClick={onGoLive}
        className="flex items-center gap-1.5 whitespace-nowrap rounded-md border border-border bg-card px-2.5 py-1.5 text-[10.5px] font-semibold tracking-[0.04em] text-muted-foreground transition-colors enabled:hover:border-[color:var(--live)] enabled:hover:text-[color:var(--live)] disabled:cursor-default disabled:opacity-35"
        style={{ "--live": palette.status.visita } as React.CSSProperties}
      >
        <svg width="8" height="8" aria-hidden>
          <circle cx="4" cy="4" r="4" fill="currentColor" />
        </svg>
        {dayMode === "today" ? "EN VIVO" : "IR A HOY"}
      </button>
    </div>
  );
}
