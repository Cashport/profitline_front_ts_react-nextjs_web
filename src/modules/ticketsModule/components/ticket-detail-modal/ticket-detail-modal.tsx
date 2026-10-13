"use client";

import { Modal } from "antd";
import { X } from "lucide-react";

import ProfitLoader from "@/components/ui/profit-loader";
import PersonBadge from "@/modules/walletModule/components/shared/person-badge";
import StatusChip from "@/modules/walletModule/components/shared/status-chip";
import { useWalletTheme } from "@/modules/walletModule/contexts/wallet-theme-context";
import { parseApiDate, toPerson } from "@/modules/walletModule/utils/api-adapter";
import { fmtD, fmtFull } from "@/modules/walletModule/utils/format";
import type { ITicket } from "@/types/tickets/ITickets";
import { TICKET_PRIORITY_LABEL } from "../../constants";
import { useTicketDetail } from "../../hooks/useTicketDetail";
import { estadoDe } from "../../utils/tickets-calc";

interface TicketDetailModalProps {
  /** Sin id el modal está cerrado. */
  ticketId: number | null;
  onClose: () => void;
}

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <div className="mb-0.5 text-[10.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
      {label}
    </div>
    <div className="text-[12.5px] text-foreground">{children}</div>
  </div>
);

const fecha = (iso: string | null): string => {
  const d = parseApiDate(iso);
  return d ? fmtD(d) : "—";
};

function TicketDetailBody({ ticket: t }: { ticket: ITicket }) {
  const e = estadoDe(t);

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-[11.5px] text-muted-foreground">{t.ticket_code}</span>
        <StatusChip sev={e.sev}>{e.estado}</StatusChip>
        {e.tiempo && e.tsev && <StatusChip sev={e.tsev}>{e.tiempo}</StatusChip>}
        <span className="ml-auto text-[11.5px] text-muted-foreground">
          Prioridad · {TICKET_PRIORITY_LABEL[t.priority]}
        </span>
      </div>

      <h3 className="mt-2 text-[15px] font-semibold leading-snug text-foreground">{t.title}</h3>

      <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3.5">
        <Field label="Cliente">
          {t.client_name}
          <div className="font-mono text-[11.5px] text-muted-foreground">{t.client_id}</div>
        </Field>
        <Field label="Monto">
          <span className="font-semibold tabular-nums">{fmtFull(t.amount)}</span>
        </Field>
        <Field label="Categoría">{t.category_name ?? "—"}</Field>
        <Field label="Responsable">
          <PersonBadge person={toPerson(t.assigned_to_name)} />
        </Field>
        <Field label="Fecha límite">{fecha(t.due_at)}</Field>
        <Field label="Creado por">
          <PersonBadge person={toPerson(t.created_by_name)} />
        </Field>
        <Field label="Creado">{fecha(t.created_at)}</Field>
        <Field label="Iniciado">{fecha(t.started_at)}</Field>
        <Field label="Completado">{fecha(t.completed_at)}</Field>
      </div>

      {t.description && (
        <div className="mt-4 border-t border-border pt-3.5">
          <Field label="Descripción">
            <p className="whitespace-pre-line leading-relaxed">{t.description}</p>
          </Field>
        </div>
      )}
    </>
  );
}

/** Detalle de un ticket (GET /tickets/:id), de sólo lectura. */
export default function TicketDetailModal({ ticketId, onClose }: TicketDetailModalProps) {
  const { resolvedTheme } = useWalletTheme();
  const { ticket, isLoading, error } = useTicketDetail(ticketId);

  return (
    <Modal
      open={!!ticketId}
      onCancel={onClose}
      footer={null}
      closeIcon={null}
      centered
      destroyOnClose
      width="min(640px, 95vw)"
      // El modal vive en un portal fuera de .wallet-scope y del contenedor .dark,
      // así que el tema se re-declara aquí (ver GroupDetailModal).
      rootClassName={resolvedTheme === "dark" ? "dark" : undefined}
      styles={{ body: { padding: 0 }, content: { padding: 0, overflow: "hidden" } }}
    >
      <div className="wallet-scope relative min-h-[220px] bg-card px-6 pb-6 pt-5 text-foreground">
        <button
          type="button"
          aria-label="Cerrar"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-[30px] w-[30px] items-center justify-center rounded-[7px] border border-border bg-muted text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        {ticket ? (
          <TicketDetailBody ticket={ticket} />
        ) : (
          <div className="flex min-h-[180px] items-center justify-center">
            {isLoading ? (
              <ProfitLoader size="small" />
            ) : (
              <p className="px-6 text-center text-[12.5px] text-destructive">
                {(error as Error)?.message || "No se pudo cargar el ticket."}
              </p>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
