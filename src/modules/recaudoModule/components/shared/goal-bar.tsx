"use client";

import { Fragment } from "react";

import { cn } from "@/utils/utils";
import TowerTooltip, { TipContentProps } from "./tower-tooltip";

export interface GoalBarSegment {
  key: string;
  value: number;
  color: string;
  tip?: TipContentProps;
}

interface GoalBarProps {
  /** Valor que ocupa el 100% del ancho. */
  scale: number;
  /** Tramos apilados desde la izquierda (recaudado, acuerdos, incumplidos…). */
  segments: GoalBarSegment[];
  /** Tramo punteado del forecast, de `from` a `to`. */
  forecast?: { from: number; to: number; color: string; tip?: TipContentProps } | null;
  /** Marca vertical de la meta. */
  goal?: { value: number; tip?: TipContentProps } | null;
  /** Alto en px. */
  height: number;
  /** Cuánto sobresale la marca de la meta arriba y abajo, en px. */
  goalOverhang?: number;
  /** Grosor del borde punteado del forecast, en px. */
  dashWidth?: number;
  className?: string;
}

const withTip = (node: React.ReactElement, tip?: TipContentProps) =>
  tip ? <TowerTooltip {...tip}>{node}</TowerTooltip> : node;

/**
 * Barra de avance contra la meta: tramos apilados sobre el riel, el forecast
 * punteado a continuación de lo recaudado y la marca de la meta. Es la de la
 * tarjeta de recaudo, la columna Avance y la tabla de ejecutivos.
 */
export default function GoalBar({
  scale,
  segments,
  forecast,
  goal,
  height,
  goalOverhang = 4,
  dashWidth = 1.5,
  className
}: GoalBarProps) {
  const total = scale > 0 ? scale : 1;
  const pctOf = (v: number) => `${Math.max(0, Math.min(100, (v / total) * 100))}%`;
  const radius = height / 2;
  let left = 0;

  return (
    <div className={cn("relative bg-muted", className)} style={{ height, borderRadius: radius }}>
      <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: radius }}>
        {segments.map((s) => {
          if (s.value <= 0) return null;
          const node = (
            <i
              className="absolute inset-y-0 block"
              style={{ left: pctOf(left), width: pctOf(s.value), background: s.color }}
            />
          );
          left += s.value;
          return <Fragment key={s.key}>{withTip(node, s.tip)}</Fragment>;
        })}
      </div>

      {forecast &&
        forecast.to > forecast.from &&
        withTip(
          <span
            className="absolute"
            style={{
              left: pctOf(forecast.from),
              width: pctOf(forecast.to - forecast.from),
              top: -dashWidth,
              bottom: -dashWidth,
              border: `${dashWidth}px dashed ${forecast.color}`,
              borderLeft: 0,
              borderRadius: `0 ${radius}px ${radius}px 0`
            }}
          />,
          forecast.tip
        )}

      {goal &&
        withTip(
          <span
            className="absolute w-0.5 rounded-[1px] bg-foreground"
            style={{
              left: pctOf(goal.value),
              top: -goalOverhang,
              bottom: -goalOverhang,
              transform: "translateX(-1px)"
            }}
          />,
          goal.tip
        )}
    </div>
  );
}
