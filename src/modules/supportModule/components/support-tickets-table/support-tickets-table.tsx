"use client";

import type { ISupportTicket } from "@/types/support/ISupport";
import { formatDate, slaBadge } from "../../utils/support-format";
import { CriticalityTag, StatusDot } from "../support-tags/support-tags";

type Column = "project" | "requester" | "assignee";

interface Props {
  items: ISupportTicket[];
  onOpen: (id: number) => void;
  /** Columnas extra (Support Desk y bandeja del responsable). */
  extra?: Column[];
  asAgent?: boolean;
  total?: number;
  page?: number;
  limit?: number;
  onPage?: (page: number) => void;
}

/** Tabla de tickets en grid (sin scroll horizontal): ticket, tema, criticidad, fechas, estado y ANS. */
export default function SupportTicketsTable({
  items,
  onOpen,
  extra = [],
  asAgent = false,
  total,
  page = 1,
  limit = 25,
  onPage
}: Props) {
  const cols = [
    "110px",
    extra.includes("project") ? "minmax(0,1fr)" : null,
    "minmax(0,2.2fr)",
    "92px",
    extra.includes("requester") ? "minmax(0,1fr)" : null,
    extra.includes("assignee") ? "minmax(0,1fr)" : null,
    "96px",
    "minmax(0,1.1fr)",
    "minmax(0,1.1fr)"
  ]
    .filter(Boolean)
    .join(" ");
  const pages = total ? Math.ceil(total / limit) : 1;

  return (
    <div className="flex min-w-0 flex-col">
      <div
        className="sticky top-0 z-[1] grid h-[43px] items-center gap-3 border-b border-cp-line bg-cp-surface px-2.5 text-[13px] font-semibold"
        style={{ gridTemplateColumns: cols }}
      >
        <span>Ticket</span>
        {extra.includes("project") && <span>Proyecto</span>}
        <span>Solicitud</span>
        <span>Criticidad</span>
        {extra.includes("requester") && <span>Solicitante</span>}
        {extra.includes("assignee") && <span>Responsable</span>}
        <span>Creado</span>
        <span>Estado</span>
        <span>ANS</span>
      </div>
      {items.map((t) => {
        const sla = slaBadge(t);
        return (
          <div
            key={t.id}
            role="button"
            tabIndex={0}
            onClick={() => onOpen(t.id)}
            onKeyDown={(e) => e.key === "Enter" && onOpen(t.id)}
            className="grid min-h-[56px] cursor-pointer items-center gap-3 border-b border-cp-muted px-2.5 py-1 text-[13px] hover:bg-cp-bg"
            style={{ gridTemplateColumns: cols }}
          >
            <span className="font-medium text-cp-blue">{t.code}</span>
            {extra.includes("project") && <span className="truncate">{t.project_name ?? "—"}</span>}
            <span className="flex min-w-0 flex-col">
              <span className="truncate font-medium">{t.title}</span>
              <span className="truncate text-cp-ink-3">
                {t.subcategory_name} · {t.category_name}
              </span>
            </span>
            <span>
              <CriticalityTag value={t.criticality} />
            </span>
            {extra.includes("requester") && (
              <span className="truncate">{t.created_by.name ?? "—"}</span>
            )}
            {extra.includes("assignee") && (
              <span className="truncate">{t.assigned_to.name ?? "—"}</span>
            )}
            <span className="whitespace-nowrap">{formatDate(t.created_at)}</span>
            <span className="min-w-0 truncate">
              <StatusDot value={t.status} asAgent={asAgent} />
            </span>
            <span className="truncate font-semibold" style={{ color: sla.color }}>
              {sla.text}
            </span>
          </div>
        );
      })}
      {total !== undefined && (
        <div className="flex items-center justify-end gap-3 pt-3 text-[13px] text-cp-ink-3">
          {pages > 1 && onPage && (
            <>
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => onPage(page - 1)}
                className="cursor-pointer border-0 bg-transparent text-[13px] font-semibold text-cp-ink disabled:cursor-default disabled:text-cp-ink-4"
              >
                ‹ Anterior
              </button>
              <span>
                Página {page} de {pages}
              </span>
              <button
                type="button"
                disabled={page >= pages}
                onClick={() => onPage(page + 1)}
                className="cursor-pointer border-0 bg-transparent text-[13px] font-semibold text-cp-ink disabled:cursor-default disabled:text-cp-ink-4"
              >
                Siguiente ›
              </button>
            </>
          )}
          <span>
            {total} {total === 1 ? "ticket" : "tickets"}
          </span>
        </div>
      )}
    </div>
  );
}
