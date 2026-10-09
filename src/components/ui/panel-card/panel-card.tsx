"use client";

import { cn } from "@/utils/utils";

interface PanelCardProps {
  title: string;
  /** Nota a la derecha del título: "clic en un tramo para filtrar el tablero". */
  hint?: React.ReactNode;
  /** Sin padding en el cuerpo: para que una tabla llegue hasta el borde. */
  flush?: boolean;
  className?: string;
  children: React.ReactNode;
}

/** Tarjeta con cabecera: el marco de un panel de la torre. */
export default function PanelCard({ title, hint, flush, className, children }: PanelCardProps) {
  return (
    <section className={cn("flex flex-col rounded-xl bg-card shadow-sm", className)}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-border px-4 py-3">
        <h3 className="text-[13.5px] font-semibold text-foreground">{title}</h3>
        {hint && (
          <span className="ml-auto text-[11.5px] text-muted-foreground">{hint}</span>
        )}
      </div>

      <div className={cn("flex min-h-0 flex-1 flex-col", !flush && "p-4")}>{children}</div>
    </section>
  );
}
