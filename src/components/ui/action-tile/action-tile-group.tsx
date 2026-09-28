"use client";

import { cn } from "@/utils/utils";
import { actionToneClasses, type ActionTone } from "./action-tile";

interface ActionTileGroupProps {
  /** Título de la sección: "PAGOS Y CARTERA". */
  title: string;
  /** Color del punto de la cabecera; conviene que coincida con el de sus tiles. */
  tone?: ActionTone;
  className?: string;
  children: React.ReactNode;
}

/** Sección de un modal de acciones: cabecera con punto de color, separador y rejilla de ActionTile. */
export default function ActionTileGroup({
  title,
  tone = "emerald",
  className,
  children
}: ActionTileGroupProps) {
  return (
    <section className={className}>
      <div className="mb-3 flex items-center gap-2">
        <span className={cn("h-1.5 w-1.5 rounded-full", actionToneClasses[tone].dot)} />
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </span>
      </div>
      <div className="mb-3 border-t border-border" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{children}</div>
    </section>
  );
}
