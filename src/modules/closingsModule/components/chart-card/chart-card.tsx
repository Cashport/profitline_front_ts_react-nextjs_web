"use client";

import { Tooltip } from "antd";
import { Info } from "phosphor-react";

import { cn } from "@/utils/utils";

export interface LegendItem {
  label: string;
  color: string;
  /** "line" pinta una raya en vez del cuadro (series de línea). */
  shape?: "square" | "line";
}

interface ChartCardProps {
  title: string;
  /** Ayuda del título (DESIGN.md §7: las explicaciones van en tooltip, no en una línea extra). */
  help?: string;
  legend?: LegendItem[];
  /** Controles a la derecha del título (selector de dimensión…). */
  actions?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}

export function Legend({ items }: { items: LegendItem[] }) {
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-x-3.5 gap-y-1">
      {items.map((item) => (
        <span
          key={item.label}
          className="inline-flex items-center gap-1.5 whitespace-nowrap text-[13px] text-cp-ink-3"
        >
          <span
            className={item.shape === "line" ? "h-[3px] w-3 rounded-full" : "h-2 w-2 rounded-[2px]"}
            style={{ background: item.color }}
          />
          {item.label}
        </span>
      ))}
    </div>
  );
}

/** Tarjeta de gráfica del tablero: título 18px + ayuda + leyenda en una línea + acciones. */
export default function ChartCard({
  title,
  help,
  legend,
  actions,
  className,
  bodyClassName,
  children
}: ChartCardProps) {
  return (
    <section className={cn("cp-card flex min-w-0 flex-col px-[18px] py-[14px]", className)}>
      <div className="mb-3 flex min-h-[36px] flex-wrap items-center gap-x-4 gap-y-2">
        <h3 className="flex items-center gap-1.5 text-[18px] font-semibold text-cp-ink">
          {title}
          {help && (
            <Tooltip title={help}>
              <Info size={16} className="cursor-help text-cp-ink-4" />
            </Tooltip>
          )}
        </h3>
        {legend && <Legend items={legend} />}
        {actions && <div className="ml-auto flex items-center gap-2">{actions}</div>}
      </div>
      <div className={cn("flex min-h-0 flex-1 flex-col", bodyClassName)}>{children}</div>
    </section>
  );
}

interface SegmentedProps<T extends string> {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}

/** Selector segmentado de 36px con relleno gris (va dentro de tarjetas blancas). */
export function Segmented<T extends string>({ value, options, onChange }: SegmentedProps<T>) {
  return (
    <div className="cp-control-fill flex h-[var(--control-h)] items-center gap-0.5 rounded-lg p-[3px]">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "h-full whitespace-nowrap rounded-md px-3 text-[13px] font-medium transition-colors",
            value === o.value
              ? "bg-cp-surface font-semibold text-cp-ink shadow-[0_1px_2px_rgba(0,0,0,.08)]"
              : "text-cp-ink-4 hover:text-cp-ink"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
