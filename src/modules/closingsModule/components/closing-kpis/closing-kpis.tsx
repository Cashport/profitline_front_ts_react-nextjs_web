"use client";

import { KpiAside, KpiCard, KpiValue } from "@/components/ui/kpi-card/kpi-card";
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
        tone === "risk" && "bg-cp-magenta text-white"
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
        good === false && "text-cp-magenta",
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

export default function ClosingKpis({ items }: { items: ClosingKpi[] }) {
  return (
    <div
      className="grid gap-[var(--card-gap)] max-md:!grid-cols-2"
      style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
    >
      {items.map((kpi) => (
        <KpiCard key={kpi.key} className="min-h-[var(--kpi-h)]">
          {kpi.split ? (
            <div className="flex min-w-0 items-stretch gap-3">
              {kpi.split.map((s, i) => (
                <div
                  key={s.label}
                  className={cn("min-w-0 flex-1", i > 0 && "border-l border-cp-line pl-3")}
                >
                  <KpiValue
                    label={s.label}
                    value={s.value}
                    unit="M"
                    size="md"
                    caption={s.caption}
                  />
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="flex min-w-0 items-start gap-3">
                <KpiValue label={kpi.label} value={kpi.value} unit={kpi.unit} />
                {kpi.aside && (
                  <KpiAside label={kpi.aside.label} pill={kpi.aside.pill} value={kpi.aside.value} />
                )}
              </div>
              {kpi.bar && (
                <div className="h-[5px] overflow-hidden rounded-full bg-cp-muted">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.max(0, Math.min(1, kpi.bar.value)) * 100}%`,
                      background: kpi.bar.color
                    }}
                  />
                </div>
              )}
              {kpi.caption && (
                <span className="truncate text-[13px] text-cp-ink-3">{kpi.caption}</span>
              )}
            </>
          )}
        </KpiCard>
      ))}
    </div>
  );
}
