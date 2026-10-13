"use client";

import { cn } from "@/utils/utils";

export interface ProgressSegment {
  key: string;
  value: number;
  color: string;
  tip?: string;
}

interface ProgressVsGoalProps {
  /** Tramos apilados en orden (ej. recaudado, acuerdos, incumplidos). */
  segments: ProgressSegment[];
  /** Meta: se marca con una línea vertical. Sin meta no hay marca. */
  goal: number | null;
  /**
   * La escala es `goal × goalScale` (o la suma, si es mayor): con 1,25 la
   * meta queda al 80% y se ve cuánto se pasa el avance.
   */
  goalScale?: number;
  goalTip?: string;
  /** Alto de la barra en px; la marca de la meta sobresale 4px arriba y abajo. */
  height?: number;
  className?: string;
}

/** Avance apilado contra una meta. */
export default function ProgressVsGoal({
  segments,
  goal,
  goalScale = 1.25,
  goalTip,
  height = 6,
  className
}: ProgressVsGoalProps) {
  const visible = segments.filter((s) => s.value > 0);
  const sum = visible.reduce((acc, s) => acc + s.value, 0);
  const scale = Math.max((goal ?? 0) * goalScale, sum);
  const fill = scale ? Math.min(sum / scale, 1) * 100 : 0;
  const goalPct = goal && scale ? (goal / scale) * 100 : null;
  const marker = height + (height >= 6 ? 8 : 6);

  return (
    <div
      className={cn("relative bg-[#f2f2f2]", className)}
      style={{ height, borderRadius: height / 2 }}
    >
      <div
        className="absolute inset-y-0 left-0 flex gap-px overflow-hidden"
        style={{ width: `${fill}%`, borderRadius: height / 2 }}
      >
        {visible.map((s) => (
          <div key={s.key} title={s.tip} style={{ flex: s.value, background: s.color }} />
        ))}
      </div>
      {goalPct !== null && (
        <div
          title={goalTip}
          className="absolute w-0.5 rounded-[1px] bg-[#141414]"
          style={{
            left: `${goalPct}%`,
            top: -(marker - height) / 2,
            height: marker,
            transform: "translateX(-1px)",
            boxShadow: "0 0 0 1.5px #fff"
          }}
        />
      )}
    </div>
  );
}
