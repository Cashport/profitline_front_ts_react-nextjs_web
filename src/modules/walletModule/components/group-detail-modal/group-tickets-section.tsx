"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";

import { HOY, diasEntre } from "../../utils/format";
import { resueltoTarde } from "../../utils/group-detail";
import TicketCard from "./ticket-card";
import type { IWalletTicket } from "../../types";

interface GroupTicketsSectionProps {
  tickets: IWalletTicket[];
  /** Oculta el botón "Nuevo" mientras el formulario está abierto. */
  creando: boolean;
  onNew: () => void;
  onResolve: (id: string) => void;
}

const Count = ({ children }: { children: React.ReactNode }) => (
  <span className="rounded-full bg-muted px-1.5 text-[10.5px] font-bold leading-[17px] tabular-nums text-muted-foreground">
    {children}
  </span>
);

/** Acciones abiertas y cerradas del grupo. */
export default function GroupTicketsSection({
  tickets,
  creando,
  onNew,
  onResolve
}: GroupTicketsSectionProps) {
  const [verCerradas, setVerCerradas] = useState(false);

  const abiertas = tickets
    .filter((t) => t.estado === "abierto")
    .sort((a, b) => a.deadline.getTime() - b.deadline.getTime());
  const cerradas = tickets
    .filter((t) => t.estado === "resuelto")
    .sort(
      (a, b) => (b.resueltoEl ?? b.deadline).getTime() - (a.resueltoEl ?? a.deadline).getTime()
    );

  const vencidas = abiertas.filter((t) => diasEntre(HOY, t.deadline) < 0).length;
  const tarde = cerradas.filter(resueltoTarde).length;

  return (
    <>
      <div className="border-t border-border px-[18px] pb-4 pt-3.5">
        <div className="mb-[11px] flex w-full items-center gap-2">
          <h4 className="text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">
            Acciones abiertas
          </h4>
          <Count>{abiertas.length}</Count>
          {vencidas > 0 && (
            <span className="text-[11px] text-rose-600 dark:text-rose-400">
              {vencidas} vencida{vencidas === 1 ? "" : "s"}
            </span>
          )}
          {!creando && (
            <button
              type="button"
              onClick={onNew}
              className="ml-auto inline-flex items-center gap-1 text-[11.5px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
            >
              <Plus className="h-3.5 w-3.5" />
              Nuevo
            </button>
          )}
        </div>

        {abiertas.length ? (
          <div className="flex flex-col gap-2">
            {abiertas.map((t) => (
              <TicketCard key={t.id} ticket={t} onResolve={onResolve} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border px-[13px] py-3 text-[12.5px] leading-relaxed text-muted-foreground">
            No hay acciones abiertas. Crea un ticket para fijar la próxima.
          </div>
        )}
      </div>

      {cerradas.length > 0 && (
        <div className="border-t border-border px-[18px] pb-4 pt-3.5">
          <button
            type="button"
            aria-expanded={verCerradas}
            onClick={() => setVerCerradas((v) => !v)}
            className="mb-[11px] flex w-full items-center gap-2 text-left"
          >
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">
              Acciones cerradas
            </h4>
            <Count>{cerradas.length}</Count>
            {tarde > 0 && (
              <span className="text-[11px] text-rose-600 dark:text-rose-400">
                {tarde} fuera de fecha
              </span>
            )}
            <span className="ml-auto text-muted-foreground">
              {verCerradas ? (
                <ChevronDown className="h-3.5 w-3.5" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5" />
              )}
            </span>
          </button>

          {verCerradas && (
            <div className="flex flex-col gap-2">
              {cerradas.map((t) => (
                <TicketCard key={t.id} ticket={t} onResolve={onResolve} />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
