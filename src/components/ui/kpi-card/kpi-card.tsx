"use client";

import { Skeleton } from "antd";
import { cn } from "@/utils/utils";

/* Tarjeta de KPI y su valor. La tarjeta es solo el contenedor; cada KPI se
   arma con uno o varios KpiValue más lo que necesite debajo (barras,
   leyendas). Los valores entran ya formateados. */

interface KpiCardProps {
  children: React.ReactNode;
  loading?: boolean;
  className?: string;
}

export function KpiCard({ children, loading, className }: KpiCardProps) {
  return (
    <section
      className={cn(
        "box-border flex min-w-0 flex-[1_1_300px] flex-col justify-between gap-2 rounded-[14px] bg-white px-[18px] py-[14px]",
        className
      )}
    >
      {loading ? <Skeleton active paragraph={{ rows: 2 }} title={false} /> : children}
    </section>
  );
}

interface KpiValueProps {
  label: React.ReactNode;
  value: React.ReactNode;
  /** Unidad pequeña junto al valor ("M"). */
  unit?: string;
  /** Línea pequeña debajo ("148 notas"). */
  caption?: React.ReactNode;
  /** "lg" para el valor principal de la tarjeta, "md" para los de una tarjeta compartida. */
  size?: "lg" | "md";
  /** Clases extra para el monto (ej. un tamaño que cambia con el ancho). */
  valueClassName?: string;
  className?: string;
}

/** Si el monto no cabe se corta con elipsis; la unidad queda visible y el title lo muestra. */
export function KpiValue({
  label,
  value,
  unit,
  caption,
  size = "lg",
  valueClassName,
  className
}: KpiValueProps) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <span className="truncate text-[13px] text-[#6b6b6b]">{label}</span>
      <div
        title={typeof value === "string" ? [value, unit].filter(Boolean).join(" ") : undefined}
        className={cn(
          "flex items-baseline font-semibold leading-none",
          size === "lg" ? "text-[26px] tracking-[-0.6px]" : "text-[20px] tracking-[-0.4px]",
          valueClassName
        )}
      >
        <span className="min-w-0 truncate">{value}</span>
        {unit && (
          <span
            className={cn(
              "ml-[3px] shrink-0 font-medium text-[#6b6b6b]",
              size === "lg" ? "text-xs" : "text-[11px]"
            )}
          >
            {unit}
          </span>
        )}
      </div>
      {caption && <span className="truncate text-[11.5px] text-[#6b6b6b]">{caption}</span>}
    </div>
  );
}

interface KpiAsideProps {
  label: React.ReactNode;
  /** Pill (porcentaje) a la izquierda del monto. */
  pill?: React.ReactNode;
  value: React.ReactNode;
}

/** Bloque secundario a la derecha de una tarjeta ("Vencida", "Meta"). */
export function KpiAside({ label, pill, value }: KpiAsideProps) {
  return (
    <div className="ml-auto flex flex-col items-end gap-1.5">
      <span className="text-[13px] text-[#6b6b6b]">{label}</span>
      <div className="flex items-center gap-2 whitespace-nowrap">
        {pill}
        <span className="text-[15px] font-semibold">{value}</span>
      </div>
    </div>
  );
}
