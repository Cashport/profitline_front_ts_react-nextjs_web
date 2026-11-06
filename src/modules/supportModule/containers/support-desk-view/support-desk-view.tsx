"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";

import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";
import FilterModal from "@/components/ui/filter-modal/FilterModal";
import type { FilterSelection } from "@/components/ui/filter-modal/FilterModal.types";
import { HeaderSearch } from "@/components/ui/page-header-controls/page-header-controls";
import SupportSkeleton from "../../components/support-skeleton/support-skeleton";
import StatCards from "@/components/ui/stat-cards/stat-cards";
import { getSupportDeskSummary, getSupportTickets } from "@/services/support/support";
import type {
  ISupportListParams,
  SupportCriticality,
  SupportStatus
} from "@/types/support/ISupport";
import { cn } from "@/utils/utils";
import SupportTicketModal from "../../components/support-ticket-modal/support-ticket-modal";
import SupportTicketsTable from "../../components/support-tickets-table/support-tickets-table";
import { useProjectId } from "../../hooks/use-support-access";
import {
  CRITICALITY_META,
  CRITICALITY_ORDER,
  STATUS_ORDER,
  statusLabel
} from "../../utils/support-format";

type Scope = "project" | "assigned";
type SlaFilter = "overdue" | "due_soon" | "on_time";

const SLA_OPTIONS: { id: SlaFilter; name: string }[] = [
  { id: "overdue", name: "Vencidos" },
  { id: "due_soon", name: "Vencen en 2 h" },
  { id: "on_time", name: "En tiempo" }
];

/** /support-desk: tickets de todos los proyectos para el equipo de soporte de Profitline. */
export default function SupportDeskView() {
  const router = useRouter();
  const params = useSearchParams();
  const projectId = useProjectId();
  const [scope, setScope] = useState<Scope>("project");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<FilterSelection>({});
  const [page, setPage] = useState(1);
  const openId = Number(params.get("ticket")) || null;

  const ids = (k: string) => (filters[k] ?? []).map((x) => x.id);
  const query: ISupportListParams = {
    scope,
    search,
    project_id: ids("project").map(Number),
    status: ids("status") as SupportStatus[],
    criticality: ids("criticality") as SupportCriticality[],
    assigned_to: ids("assignee").map(Number),
    sla: ids("sla")[0] as SlaFilter | undefined,
    include_closed: ids("status").some((s) => s === "CLOSED" || s === "CANCELLED"),
    page,
    limit: 25
  };

  const summary = useSWR(
    projectId ? ["support-desk-summary", projectId, query.project_id?.join(",")] : null,
    () => getSupportDeskSummary(query.project_id),
    { shouldRetryOnError: false }
  );
  const list = useSWR(
    projectId ? ["support-desk-list", projectId, JSON.stringify(query)] : null,
    () => getSupportTickets(query, true)
  );

  const categories = useMemo(
    () => [
      {
        key: "project",
        label: "Proyecto",
        options: (summary.data?.projects ?? []).map((p) => ({
          id: String(p.id),
          name: p.name,
          count: p.open
        }))
      },
      {
        key: "status",
        label: "Estado",
        options: STATUS_ORDER.map((s) => ({ id: s, name: statusLabel(s, true) }))
      },
      {
        key: "criticality",
        label: "Criticidad",
        options: CRITICALITY_ORDER.map((c) => ({ id: c, name: CRITICALITY_META[c].label }))
      },
      {
        key: "assignee",
        label: "Responsable",
        options: (summary.data?.agents ?? []).map((a) => ({ id: String(a.id), name: a.name }))
      },
      { key: "sla", label: "ANS", selectMode: "single" as const, options: SLA_OPTIONS }
    ],
    [summary.data]
  );

  const openTicket = (id: number | null) => {
    const next = new URLSearchParams(params.toString());
    if (id) next.set("ticket", String(id));
    else next.delete("ticket");
    router.replace(`/support-desk${next.size ? `?${next}` : ""}`, { scroll: false });
  };

  const applyFilters = (next: FilterSelection) => {
    setFilters(next);
    setPage(1);
  };

  const quick = (sla: SlaFilter | null, status?: SupportStatus) =>
    applyFilters({
      ...filters,
      sla: sla ? SLA_OPTIONS.filter((o) => o.id === sla) : [],
      status: status ? [{ id: status, name: statusLabel(status, true) }] : []
    });

  if (summary.error) {
    return (
      <ViewWrapper headerTitle="Support Desk">
        <div className="cp-page">
          <div className="cp-card px-[18px] py-[14px] text-[13px] text-cp-ink-2">
            El Support Desk es solo para el equipo de soporte de Profitline.
          </div>
        </div>
      </ViewWrapper>
    );
  }

  const s = summary.data?.summary;

  return (
    <ViewWrapper
      headerTitle="Support Desk"
      headerActions={
        <>
          <FilterModal
            inHeader
            categories={categories}
            value={filters}
            onApply={applyFilters}
            onValueChange={applyFilters}
          />
          <HeaderSearch
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder="Buscar ticket, título, tarea…"
          />
        </>
      }
    >
      <div className="cp-page min-w-0 pb-6">
        {s ? (
          <StatCards
            cards={[
              {
                id: "new",
                label: "Sin atender",
                value: String(s.new),
                foot: <QuickLink onClick={() => quick(null, "NEW")} />
              },
              {
                id: "progress",
                label: "En progreso",
                value: String(s.in_progress),
                foot: <QuickLink onClick={() => quick(null, "IN_PROGRESS")} />
              },
              {
                id: "waiting",
                label: "Esperando al usuario",
                value: String(s.waiting_client),
                foot: "Reloj en pausa"
              },
              {
                id: "resolved",
                label: "Por confirmar",
                value: String(s.resolved),
                foot: "Resueltos sin confirmar"
              },
              {
                id: "overdue",
                label: <span className="text-cp-red">Vencidos</span>,
                value: String(s.overdue),
                foot: <QuickLink onClick={() => quick("overdue")} />
              },
              {
                id: "soon",
                label: "Vencen en 2 h",
                value: String(s.due_soon),
                foot: <QuickLink onClick={() => quick("due_soon")} />
              }
            ]}
          />
        ) : (
          <div className="cp-card px-[18px] py-[14px]"><SupportSkeleton rows={2} /></div>
        )}

        <div className="cp-card flex min-w-0 flex-col px-[18px] pb-[18px] pt-1">
          <div className="flex min-h-[48px] flex-wrap items-end gap-x-[22px] border-b border-cp-line">
            {(
              [
                ["project", "Todos los tickets"],
                ["assigned", "Asignados a mí"]
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
                  "-mb-px cursor-pointer border-0 border-b-2 bg-transparent px-0 pb-2.5 text-[13.5px]",
                  scope === k
                    ? "border-cp-ink font-semibold text-cp-ink"
                    : "border-transparent font-medium text-cp-ink-4"
                )}
              >
                {l}
              </button>
            ))}
          </div>
          <div className="pt-2">
            {list.data ? (
              list.data.items.length ? (
                <SupportTicketsTable
                  items={list.data.items}
                  onOpen={openTicket}
                  asAgent
                  extra={["project", "assignee"]}
                  total={list.data.total}
                  page={page}
                  limit={25}
                  onPage={setPage}
                />
              ) : (
                <p className="px-1 py-8 text-[13px] text-cp-ink-3">
                  No hay tickets con estos filtros.
                </p>
              )
            ) : list.error ? (
              <p className="text-[13px] text-cp-magenta">{(list.error as Error).message}</p>
            ) : (
              <SupportSkeleton rows={4} />
            )}
          </div>
        </div>
      </div>

      <SupportTicketModal
        ticketId={openId}
        desk
        onClose={() => openTicket(null)}
        onChanged={() => {
          list.mutate();
          summary.mutate();
        }}
      />
    </ViewWrapper>
  );
}

const QuickLink = ({ onClick }: { onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="cursor-pointer border-0 bg-transparent p-0 text-[13px] text-cp-blue"
  >
    Ver tickets
  </button>
);
