"use client";

import { Modal } from "antd";
import { X } from "lucide-react";
import useSWR from "swr";

import ProfitLoader from "@/components/ui/profit-loader";
import { useWalletTheme } from "@/modules/walletModule/contexts/wallet-theme-context";
import { getSupportTicket } from "@/services/support/support";
import type { ISupportDetail } from "@/types/support/ISupport";
import SupportTicketDetail from "../support-ticket-detail/support-ticket-detail";

export const supportTicketKey = (id: number, desk: boolean) =>
  ["support-ticket", id, desk] as const;

export function useSupportTicket(id: number | null, desk = false) {
  return useSWR<ISupportDetail>(id ? supportTicketKey(id, desk) : null, () =>
    getSupportTicket(id as number, desk)
  );
}

/** Detalle de un ticket de soporte en modal (mismo marco que el detalle de una tarea). */
export default function SupportTicketModal({
  ticketId,
  desk = false,
  onClose,
  onChanged
}: {
  ticketId: number | null;
  desk?: boolean;
  onClose: () => void;
  onChanged?: () => void;
}) {
  const { resolvedTheme } = useWalletTheme();
  const { data, error, isLoading, mutate } = useSupportTicket(ticketId, desk);

  return (
    <Modal
      open={ticketId !== null}
      onCancel={onClose}
      footer={null}
      closeIcon={null}
      centered
      destroyOnClose
      width="min(820px, 95 * var(--vw))"
      rootClassName={resolvedTheme === "dark" ? "dark" : undefined}
      styles={{ body: { padding: 0 }, content: { padding: 0, overflow: "hidden" } }}
    >
      <div className="wallet-scope relative min-h-[220px] bg-cp-surface px-6 pb-6 pt-5 text-cp-ink">
        <button
          type="button"
          aria-label="Cerrar"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-[7px] border-0 bg-cp-muted text-cp-ink-3 hover:text-cp-ink"
        >
          <X className="h-4 w-4" />
        </button>
        {data ? (
          <SupportTicketDetail
            key={data.ticket.id}
            detail={data}
            desk={desk}
            conversationHeight="min(380px, 40 * var(--vh))"
            onChange={(next) => {
              mutate(next, false);
              onChanged?.();
            }}
          />
        ) : (
          <div className="flex min-h-[180px] items-center justify-center">
            {isLoading ? (
              <ProfitLoader size="small" />
            ) : (
              <p className="px-6 text-center text-[13px] text-cp-magenta">
                {(error as Error)?.message || "No se pudo cargar el ticket."}
              </p>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
