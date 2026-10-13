"use client";

import { cn } from "@/utils/utils";

/* Botón de acción en forma de tarjeta: icono en un cuadro tintado + etiqueta.
   Pensado para los modales de "Generar acción"; se agrupa con ui/action-tile-group. */

export type ActionTone = "emerald" | "blue" | "violet" | "orange";

/** Clases de color por tono. `dot` lo usa la cabecera del grupo; el resto, el cuadro del icono. */
export const actionToneClasses: Record<ActionTone, { dot: string; iconBox: string; icon: string }> =
  {
    emerald: {
      dot: "bg-emerald-500",
      iconBox: "bg-emerald-500/10",
      icon: "text-emerald-600 dark:text-emerald-400"
    },
    blue: {
      dot: "bg-blue-500",
      iconBox: "bg-blue-500/10",
      icon: "text-blue-600 dark:text-blue-400"
    },
    violet: {
      dot: "bg-violet-500",
      iconBox: "bg-violet-500/10",
      icon: "text-violet-600 dark:text-violet-400"
    },
    orange: {
      dot: "bg-orange-500",
      iconBox: "bg-orange-500/10",
      icon: "text-orange-600 dark:text-orange-400"
    }
  };

export interface ActionTileProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  /** Cualquier icono (lucide o phosphor): hereda el color y el contenedor fija el tamaño. */
  icon: React.ReactNode;
  label: string;
  tone?: ActionTone;
}

export default function ActionTile({
  icon,
  label,
  tone = "emerald",
  className,
  ...rest
}: ActionTileProps) {
  const colors = actionToneClasses[tone];

  return (
    <button
      type="button"
      className={cn(
        "flex items-center gap-3 rounded-lg border border-border bg-background px-3.5 py-3 text-left transition-colors",
        "hover:border-foreground/20 hover:bg-muted/50",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-border disabled:hover:bg-background",
        className
      )}
      {...rest}
    >
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-md [&_svg]:size-[18px]",
          colors.iconBox,
          colors.icon
        )}
      >
        {icon}
      </span>
      <span className="text-sm font-medium leading-tight text-foreground">{label}</span>
    </button>
  );
}
