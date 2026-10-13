"use client";

import { cn } from "@/utils/utils";

export type BoardCardSeverity = "ok" | "warn" | "crit" | "idle";

interface BoardCardProps {
  /** Semáforo del caso: pinta el borde izquierdo. */
  sev: BoardCardSeverity;
  onClick: () => void;
  children: React.ReactNode;
}

const BORDER: Record<BoardCardSeverity, string> = {
  ok: "border-l-emerald-500",
  warn: "border-l-amber-500",
  crit: "border-l-rose-500",
  idle: "border-l-border"
};

/** Sólo el marco de una tarjeta del tablero; el contenido lo pone quien la usa. */
export default function BoardCard({ sev, onClick, children }: BoardCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-md border border-l-[3px] border-border bg-card p-2.5 text-left transition-shadow hover:shadow-sm",
        BORDER[sev]
      )}
    >
      {children}
    </button>
  );
}
