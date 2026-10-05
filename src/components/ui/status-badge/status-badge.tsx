"use client";

import { cn } from "@/utils/utils";

interface StatusBadgeProps {
  /** Fondo y texto del pill (cada pantalla define su semáforo). */
  bg: string;
  color: string;
  children: React.ReactNode;
  /** Semáforo: punto de color delante del pill. */
  dot?: string;
  /** Ancho fijo en px (columnas alineadas); por defecto mínimo 44px. */
  width?: number;
  title?: string;
  className?: string;
}

/** Pill de severidad (porcentaje vencido, semáforo de forecast…). */
export default function StatusBadge({
  bg,
  color,
  children,
  dot,
  width,
  title,
  className
}: StatusBadgeProps) {
  const pill = (
    <span
      title={title}
      className={cn(
        "box-border inline-block whitespace-nowrap rounded-md text-center text-[11px] font-semibold tabular-nums",
        width ? "py-0.5" : "min-w-[44px] px-[7px] py-0.5",
        !dot && className
      )}
      style={{ background: bg, color, width }}
    >
      {children}
    </span>
  );
  if (!dot) return pill;
  return (
    <span className={cn("inline-flex items-center gap-2 whitespace-nowrap", className)}>
      <span className="h-[7px] w-[7px] rounded-full" style={{ background: dot }} />
      {pill}
    </span>
  );
}
