"use client";

import { cn } from "@/utils/utils";

import type { DayMode, IVisitsPalette } from "../../types";
import { fmtClock } from "../../utils/visits-format";

interface LiveClockProps {
  dayMode: DayMode;
  /** El cabezal está en el minuto en vivo de hoy. */
  isLive: boolean;
  t: number;
  palette: IVisitsPalette;
}

/** Qué se está viendo (en vivo, repetición, histórico o programación) y a qué hora. */
export default function LiveClock({ dayMode, isLive, t, palette }: LiveClockProps) {
  const tag =
    dayMode === "future"
      ? { label: "Programación", color: palette.status.IN_TRANSIT }
      : dayMode === "past"
        ? { label: "Histórico", color: palette.ink3 }
        : isLive
          ? { label: "En vivo", color: palette.status.IN_VISIT }
          : { label: "Reproducción", color: palette.status.ON_PAUSE };
  const pulse = dayMode === "today" && isLive;

  return (
    <div className="flex shrink-0 items-center gap-3 whitespace-nowrap">
      <span
        className="flex items-center gap-[7px] text-[13px] font-semibold tracking-[0.04em]"
        style={{ color: tag.color }}
      >
        <span className="relative flex h-[7px] w-[7px]">
          {pulse && (
            <span
              className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
              style={{ background: tag.color }}
            />
          )}
          <span
            className="relative inline-flex h-[7px] w-[7px] rounded-full"
            style={{ background: tag.color }}
          />
        </span>
        {tag.label}
      </span>
      <b
        className={cn(
          "text-[15px] font-semibold tabular-nums",
          dayMode === "future" ? "text-muted-foreground" : "text-foreground"
        )}
      >
        {fmtClock(t)}
      </b>
    </div>
  );
}
