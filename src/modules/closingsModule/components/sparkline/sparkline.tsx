"use client";

/** Minigráfica de línea (evolución en los últimos cierres); el último punto va marcado. */
export default function Sparkline({
  values,
  color = "#141414",
  width = 84,
  height = 26,
  reference
}: {
  values: (number | null)[];
  color?: string;
  width?: number;
  height?: number;
  /** Valor de referencia (p. ej. el promedio) dibujado como línea punteada. */
  reference?: number;
}) {
  const points = values
    .map((v, i) => (v === null ? null : { x: i, y: v }))
    .filter((p): p is { x: number; y: number } => p !== null);
  if (points.length < 2) return <span style={{ width, height }} className="inline-block" />;
  const ys = points.map((p) => p.y);
  if (reference !== undefined) ys.push(reference);
  const min = Math.min(...ys);
  const max = Math.max(...ys);
  const span = max - min || 1;
  const sx = (x: number) => 2 + (x / Math.max(1, values.length - 1)) * (width - 4);
  const sy = (y: number) => height - 3 - ((y - min) / span) * (height - 6);
  const d = points.map((p, i) => `${i ? "L" : "M"}${sx(p.x)},${sy(p.y)}`).join(" ");
  const lastPoint = points[points.length - 1];
  return (
    <svg width={width} height={height} className="shrink-0" aria-hidden>
      {reference !== undefined && (
        <line
          x1={2}
          x2={width - 2}
          y1={sy(reference)}
          y2={sy(reference)}
          stroke="#c4c4c4"
          strokeWidth={1}
          strokeDasharray="3 3"
        />
      )}
      <path d={d} fill="none" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      <circle cx={sx(lastPoint.x)} cy={sy(lastPoint.y)} r={2.6} fill={color} />
    </svg>
  );
}
