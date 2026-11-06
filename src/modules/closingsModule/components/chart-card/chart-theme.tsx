"use client";

/* Estilo común de las gráficas recharts del tablero: ejes de 13px gris (DESIGN.md §1, nada
   por debajo de 13px) y un tooltip blanco con el mismo radio de las tarjetas. */

export const axisTick = { fontSize: 13, fill: "#6b6b6b" };

export const axisProps = {
  tick: axisTick,
  tickLine: false,
  axisLine: false
} as const;

export const gridProps = {
  vertical: false,
  stroke: "#ececec",
  strokeDasharray: "0"
} as const;

interface TooltipRow {
  label: string;
  value: string;
  color?: string;
  shape?: "square" | "line";
  strong?: boolean;
}

/** Contenido del tooltip: título + filas "■ Serie ...... valor". */
export function ChartTooltipBox({ title, rows }: { title: string; rows: TooltipRow[] }) {
  return (
    <div className="min-w-[220px] rounded-xl bg-cp-surface px-3.5 py-3 text-[13px] shadow-[0_12px_32px_rgba(0,0,0,.16)]">
      <p className="mb-2 font-semibold text-cp-ink">{title}</p>
      <div className="flex flex-col gap-1">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between gap-6">
            <span className="flex items-center gap-1.5 text-cp-ink-3">
              {r.color && (
                <span
                  className={
                    r.shape === "line" ? "h-[3px] w-3 rounded-full" : "h-2 w-2 rounded-[2px]"
                  }
                  style={{ background: r.color }}
                />
              )}
              {r.label}
            </span>
            <span className={r.strong ? "font-semibold text-cp-ink" : "font-medium text-cp-ink-2"}>
              {r.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
