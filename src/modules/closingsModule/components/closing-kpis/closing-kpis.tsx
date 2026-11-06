"use client";

import { cn } from "@/utils/utils";

/* Fila de KPIs del cierre (DESIGN.md §5): una sola fila, etiqueta → valor en millones →
   contraste a la derecha → leyenda de una línea con la variación frente al cierre anterior. */

export type PillTone = "neutral" | "positive" | "risk";

export function Pill({
  tone = "neutral",
  children
}: {
  tone?: PillTone;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[5px] px-1.5 py-px text-[13px] font-semibold leading-[1.35]",
        tone === "neutral" && "bg-cp-muted text-cp-ink-2",
        tone === "positive" && "bg-cp-lime text-[#141414]",
        tone === "risk" && "bg-[#d11a2a] text-white"
      )}
    >
      {children}
    </span>
  );
}

/** "▲ 3,2 % vs sep" en verde o magenta según si subir es bueno o malo. */
export function Delta({
  text,
  direction,
  goodWhenUp
}: {
  text: string;
  direction: "up" | "down" | "flat";
  goodWhenUp: boolean;
}) {
  const good = direction === "flat" ? null : (direction === "up") === goodWhenUp;
  return (
    <span
      className={cn(
        "font-semibold",
        good === true && "text-cp-lime-dark",
        good === false && "text-[#d11a2a] dark:text-[#ff6b6b]",
        good === null && "text-cp-ink-3"
      )}
    >
      {direction === "up" ? "▲" : direction === "down" ? "▼" : "="} {text}
    </span>
  );
}

export interface ClosingKpi {
  key: string;
  label: string;
  value: string;
  unit?: string;
  aside?: { label: string; value: string; pill?: React.ReactNode };
  /** Barra de 5px (0–1) con el color dado. */
  bar?: { value: number; color: string };
  caption?: React.ReactNode;
  /** Mini-KPIs dentro de la misma tarjeta (Saldos / Notas). */
  split?: { label: string; value: string; caption?: React.ReactNode }[];
}

function CompactValue({ value, unit }: { value: string; unit?: string }) {
  return (
    <span className="flex shrink-0 items-baseline font-semibold leading-none text-cp-ink">
      <span className="whitespace-nowrap text-[22px] tracking-[-0.4px]" title={value}>
        {value}
      </span>
      {unit && <span className="ml-[3px] text-[13px] font-medium text-cp-ink-3">{unit}</span>}
    </span>
  );
}

/** Fila de KPIs compacta: dos renglones (etiqueta · valor con su comparación), sin barras. */
export default function ClosingKpis({ items }: { items: ClosingKpi[] }) {
  return (
    <div
      className="grid gap-[var(--card-gap)] max-md:!grid-cols-2"
      style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
    >
      {items.map((kpi) => (
        <section
          key={kpi.key}
          className="cp-card flex min-w-0 flex-col justify-center gap-1.5 px-4 py-2.5"
        >
          {kpi.split ? (
            <div className="flex min-w-0 items-stretch gap-3">
              {kpi.split.map((s, i) => (
                <div
                  key={s.label}
                  className={cn(
                    "flex min-w-0 flex-1 flex-col gap-1.5",
                    i > 0 && "border-l border-cp-line pl-3"
                  )}
                >
                  <span className="truncate text-[13px] text-cp-ink-3">{s.label}</span>
                  <CompactValue value={s.value} unit="M" />
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="flex min-w-0 items-center justify-between gap-2">
                <span className="truncate text-[13px] text-cp-ink-3">{kpi.label}</span>
                {kpi.aside?.pill}
              </div>
              <div className="flex min-w-0 items-baseline justify-between gap-2">
                <CompactValue value={kpi.value} unit={kpi.unit} />
                {kpi.caption && (
                  <span className="min-w-0 truncate text-right text-[13px] text-cp-ink-3">
                    {kpi.caption}
                  </span>
                )}
              </div>
            </>
          )}
        </section>
      ))}
    </div>
  );
}
