/* Escalas y trazos de los gráficos SVG de la torre. */

/** Paso "redondo" para ejes: 1, 2, 2,5, 5 × 10^n. */
export function nice(x: number): number {
  if (x <= 0) return 1;
  const p = Math.pow(10, Math.floor(Math.log10(x)));
  const f = x / p;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p;
}

/** Paso más fino (1, 1,2, 1,5, 2, 2,5, 3, 4, 5, 6, 8, 10 × 10^n): el eje del recaudo diario. */
export function niceFine(x: number): number {
  if (x <= 0) return 1;
  const p = Math.pow(10, Math.floor(Math.log10(x)));
  const f = x / p;
  return ([1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].find((k) => k >= f - 1e-9) ?? 10) * p;
}

/** Trazo SVG que une los puntos. */
export const linePath = (pts: [number, number][]) =>
  "M" + pts.map((p) => p[0].toFixed(1) + "," + p[1].toFixed(1)).join("L");

/** [1, 2, …, n] */
export const range = (n: number) => Array.from({ length: n }, (_, i) => i + 1);

/**
 * Color del API con transparencia: "#FF5500" + 0,16 → "#FF550029". Si no es un
 * hex de 3 o 6 dígitos, va tal cual (sin transparencia).
 */
export const withAlpha = (color: string, alpha: number) => {
  const c = color.trim();
  const hex = /^#[0-9a-f]{3}$/i.test(c)
    ? "#" + c.slice(1).replace(/./g, (ch) => ch + ch)
    : c;
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return color;
  return hex + Math.round(alpha * 255).toString(16).padStart(2, "0");
};
