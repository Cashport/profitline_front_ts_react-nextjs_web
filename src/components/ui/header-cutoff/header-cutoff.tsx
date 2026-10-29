"use client";

import { useState, type ReactNode } from "react";

import { cn } from "@/utils/utils";

/* Corte de la foto + reprocesar + "Proyectar a cierre" (diseño "Corte y Proyeccion" 7f,
   docs/DESIGN.md §4). Uno solo para todos los módulos con foto: Clientes, Cartera por edad y
   Torre de recaudo se ven y funcionan igual. Va en `titleExtra` del Header compartido. */

const pad = (n: number) => String(n).padStart(2, "0");
const hhmm = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
const ddmm = (d: Date) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
const isToday = (d: Date) => d.toDateString() === new Date().toDateString();

/** Último día del mes en curso ("31/10"): a donde proyecta "Proyectar a cierre". */
const monthEndLabel = () => {
  const now = new Date();
  return ddmm(new Date(now.getFullYear(), now.getMonth() + 1, 0));
};

/** Tarjeta que aparece al pasar el mouse (no captura el puntero). */
const HoverCard = ({ title, children }: { title: ReactNode; children: ReactNode }) => (
  <div
    role="tooltip"
    className="pointer-events-none invisible absolute left-0 top-10 z-30 flex w-[260px] flex-col gap-1 whitespace-normal rounded-xl bg-white px-3.5 py-3 text-left opacity-0 shadow-[0_12px_32px_rgba(0,0,0,.16)] transition-opacity group-hover:visible group-hover:opacity-100 dark:border dark:border-white/10 dark:bg-[#17303d] dark:shadow-[0_12px_32px_rgba(0,0,0,.5)]"
  >
    <span className="text-[13px] font-semibold text-cp-ink">{title}</span>
    <span className="text-[13px] leading-[1.45] text-cp-ink-2">{children}</span>
  </div>
);

interface HeaderCutoffProps {
  /** Fecha ISO del corte; sin ella se muestra `placeholder`. */
  cutoffAt?: string | null;
  /** Texto mientras no hay corte ("Corte —", "Generando información…"). */
  placeholder?: string;
  /** Se está cargando o regenerando: punto ámbar y el ícono gira. */
  busy?: boolean;
  /** Reemplaza el texto del corte mientras `busy` (p. ej. "Actualizando…"). */
  busyLabel?: string;
  /** Reprocesar / recargar la foto. Sin él no se muestra el botón. */
  onRefresh?: () => void;
  /** Tooltip del botón ("Reprocesar" para administradores, "Recargar" para el resto). */
  refreshLabel?: string;
  /** Cada cuánto se toma la foto (minutos), para la tarjeta del corte. */
  cadenceMinutes?: number;
  /** "Proyectar a cierre". Sin él (módulos que no proyectan) solo va el corte. */
  projection?: {
    checked: boolean;
    onChange: (checked: boolean) => void;
    /** Fecha a la que proyecta ("31/10"); por defecto, el último día del mes en curso. */
    toLabel?: string;
  };
}

export default function HeaderCutoff({
  cutoffAt,
  placeholder = "Corte —",
  busy = false,
  busyLabel,
  onRefresh,
  refreshLabel = "Reprocesar",
  cadenceMinutes = 30,
  projection
}: HeaderCutoffProps) {
  // Cada clic da una vuelta completa al ícono (aunque la respuesta sea inmediata).
  const [turns, setTurns] = useState(0);

  const cutoff = cutoffAt ? new Date(cutoffAt) : null;
  const today = cutoff ? isToday(cutoff) : false;
  const label =
    busy && busyLabel
      ? busyLabel
      : cutoff
        ? `${today ? "Hoy" : ddmm(cutoff)} ${hhmm(cutoff)}`
        : placeholder;
  const next = cutoff ? hhmm(new Date(cutoff.getTime() + cadenceMinutes * 60_000)) : null;
  const projTo = projection?.toLabel ?? monthEndLabel();

  return (
    <div className="flex items-center gap-2.5 whitespace-nowrap">
      {/* Chip del corte: "● Hoy 22:06 | ↻" */}
      <div className="group relative">
        {/* Modo oscuro: chip azul pizarra, texto claro y punto lima (más visible que el verde). */}
        <div className="flex h-8 items-center overflow-hidden rounded-lg bg-white text-[13px] text-cp-ink-2 dark:bg-[#1c3240]">
          <span className="flex h-full cursor-default items-center gap-1.5 px-2.5">
            <span
              className={cn(
                "h-[7px] w-[7px] shrink-0 rounded-full",
                busy ? "animate-pulse bg-[#f5b700]" : "bg-[#9bb514] dark:bg-cp-lime"
              )}
            />
            {label}
          </span>
          {onRefresh && (
            <>
              <span className="h-4 w-px bg-cp-line dark:bg-white/15" />
              <button
                type="button"
                title={refreshLabel}
                aria-label={refreshLabel}
                disabled={busy}
                onClick={() => {
                  setTurns((t) => t + 1);
                  onRefresh();
                }}
                className="flex h-full w-8 cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-cp-ink hover:bg-cp-subtle disabled:cursor-default dark:hover:bg-white/10"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={busy ? "animate-spin" : undefined}
                  style={
                    busy
                      ? undefined
                      : { transform: `rotate(${turns * 360}deg)`, transition: "transform .8s ease" }
                  }
                >
                  <path d="M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5" />
                </svg>
              </button>
            </>
          )}
        </div>
        {cutoff && !busy && (
          <HoverCard
            title={`${today ? "Hoy" : cutoff.toLocaleDateString("es-CO")} a las ${hhmm(cutoff)}`}
          >
            Los datos se toman cada {cadenceMinutes} minutos para que todos vean lo mismo. Próximo:{" "}
            {next}.
          </HoverCard>
        )}
      </div>

      {/* Píldora "Proyectar a cierre": blanca apagada, lima encendida con "×" para volver a hoy. */}
      {projection && (
        <div className="group relative">
          <button
            type="button"
            aria-pressed={projection.checked}
            onClick={() => projection.onChange(!projection.checked)}
            className={cn(
              "flex h-8 cursor-pointer items-center rounded-[15px] border-0 px-3 text-[13px]",
              // Encendida: lima con texto oscuro también en modo oscuro (cp-ink allí es claro).
              projection.checked
                ? "bg-cp-lime font-semibold text-[#141414]"
                : "bg-white font-normal text-cp-ink dark:bg-[#1c3240] dark:text-cp-ink-2"
            )}
          >
            {projection.checked ? (
              <>
                Proyectado a {projTo}
                <span className="ml-2 font-normal" aria-hidden>
                  ×
                </span>
              </>
            ) : (
              "Proyectar a cierre"
            )}
          </button>
          <HoverCard title={projection.checked ? `Proyectado a ${projTo}` : "Proyectar a cierre"}>
            {projection.checked
              ? "Estás viendo cifras estimadas al cierre. Clic para volver a hoy."
              : `Estima cómo cerrará el mes (${projTo}).`}
          </HoverCard>
        </div>
      )}
    </div>
  );
}
