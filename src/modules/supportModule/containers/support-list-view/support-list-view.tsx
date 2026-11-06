"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";

import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";
import { HeaderSearch, MiniSwitch } from "@/components/ui/page-header-controls/page-header-controls";
import { getSupportTickets } from "@/services/support/support";
import { cn } from "@/utils/utils";
import SupportSkeleton from "../../components/support-skeleton/support-skeleton";
import SupportTicketModal from "../../components/support-ticket-modal/support-ticket-modal";
import SupportTicketsTable from "../../components/support-tickets-table/support-tickets-table";
import { useProjectId, useSupportFlags } from "../../hooks/use-support-access";

type Scope = "mine" | "assigned" | "project";

const LIMIT = 25;

/**
 * Listas de tickets: /support/mine (lo que yo pedí) y /support/queue (bandeja de los
 * solucionadores: asignados a mí y todos los del proyecto).
 */
export default function SupportListView({ mode }: { mode: "mine" | "queue" }) {
  const router = useRouter();
  const params = useSearchParams();
  const projectId = useProjectId();
  const flags = useSupportFlags();
  const [scope, setScope] = useState<Scope>(mode === "mine" ? "mine" : "assigned");
  const [search, setSearch] = useState("");
  const [showClosed, setShowClosed] = useState(false);
  const [page, setPage] = useState(1);
  const openId = Number(params.get("ticket")) || null;
  const base = mode === "mine" ? "/support/mine" : "/support/queue";

  const list = useSWR(
    projectId ? ["support-list", projectId, scope, search, showClosed, page] : null,
    () => getSupportTickets({ scope, search, include_closed: showClosed, page, limit: LIMIT })
  );

  const openTicket = (id: number | null) =>
    router.replace(id ? `${base}?ticket=${id}` : base, { scroll: false });

  const queueDenied = mode === "queue" && flags.loaded && !flags.canAttend;

  return (
    <ViewWrapper
      headerTitle={mode === "mine" ? "Mis tickets" : "Bandeja de soporte"}
      headerBack="/support"
      headerActions={
        <HeaderSearch
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Buscar ticket, título…"
        />
      }
    >
      <div className="cp-page min-w-0 pb-6">
        <section className="cp-card flex min-w-0 flex-col px-[18px] pb-[18px] pt-1">
          <div className="flex min-h-[48px] flex-wrap items-end gap-x-[22px] border-b border-cp-line">
            {mode === "queue" &&
              (
                [
                  ["assigned", "Asignados a mí"],
                  ["project", "Todos los del proyecto"]
                ] as [Scope, string][]
              ).map(([k, l]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => {
                    setScope(k);
                    setPage(1);
                  }}
                  className={cn(
                    "-mb-px cursor-pointer border-0 border-b-2 border-solid bg-transparent px-0 pb-3 text-[13.5px]",
                    scope === k
                      ? "border-cp-ink font-semibold text-cp-ink"
                      : "border-transparent font-medium text-cp-ink-4"
                  )}
                >
                  {l}
                </button>
              ))}
            {mode === "mine" && (
              <span className="pb-3 text-[18px] font-semibold">Solicitudes que has creado</span>
            )}
            <div className="flex-1" />
            <div className="pb-3">
              <MiniSwitch
                checked={showClosed}
                onChange={(v) => {
                  setShowClosed(v);
                  setPage(1);
                }}
                label={<span className="text-[13px] text-cp-ink-2">Ver cerrados</span>}
              />
            </div>
          </div>

          <div className="pt-4">
            {queueDenied ? (
              <p className="py-6 text-[13px] text-cp-ink-3">
                La bandeja es solo para los solucionadores de tickets del proyecto.
              </p>
            ) : list.data ? (
              list.data.items.length ? (
                <SupportTicketsTable
                  items={list.data.items}
                  onOpen={openTicket}
                  asAgent={mode === "queue"}
                  extra={mode === "queue" ? ["requester", ...(scope === "project" ? (["assignee"] as const) : [])] : []}
                  total={list.data.total}
                  page={page}
                  limit={LIMIT}
                  onPage={setPage}
                />
              ) : (
                <div className="flex flex-col items-start gap-2 py-6">
                  <span className="text-[14px] font-semibold">
                    {mode === "mine" ? "Aún no tienes solicitudes" : "No hay tickets pendientes"}
                  </span>
                  <span className="text-[13px] text-cp-ink-3">
                    {mode === "mine"
                      ? "Cuando contactes a soporte, aquí verás el estado de cada ticket."
                      : showClosed
                        ? "No hay tickets con estos criterios."
                        : "Todo al día. Activa «Ver cerrados» para ver el histórico."}
                  </span>
                </div>
              )
            ) : list.error ? (
              <p className="text-[13px] text-cp-magenta">
                {(list.error as Error).message || "No se pudieron cargar los tickets."}
              </p>
            ) : (
              <SupportSkeleton rows={4} />
            )}
          </div>
        </section>
      </div>

      <SupportTicketModal ticketId={openId} onClose={() => openTicket(null)} onChanged={() => list.mutate()} />
    </ViewWrapper>
  );
}
