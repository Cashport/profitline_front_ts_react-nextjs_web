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
  className?: string;
}

export function KpiValue({ label, value, unit, caption, size = "lg", className }: KpiValueProps) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <span className="truncate text-[13px] text-[#6b6b6b]">{label}</span>
      <div
        className={cn(
          "whitespace-nowrap font-semibold leading-none",
          size === "lg" ? "text-[26px] tracking-[-0.6px]" : "text-[20px] tracking-[-0.4px]"
        )}
      >
        {value}
        {unit && (
          <span
            className={cn(
              "ml-[3px] font-medium text-[#6b6b6b]",
              size === "lg" ? "text-xs" : "text-[11px]"
            )}
          >
            {unit}
          </span>
        )}
      </div>
      {caption && <span className="whitespace-nowrap text-[11.5px] text-[#6b6b6b]">{caption}</span>}
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
