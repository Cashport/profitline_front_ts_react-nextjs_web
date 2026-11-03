"use client";

import { useShallow } from "zustand/react/shallow";

import { cn } from "@/utils/utils";
import type { ITaskConfig } from "@/types/tickets/ITickets";
import { useTaskFacets } from "../../hooks/useTaskData";
import { useTicketsView } from "../../stores/tickets-view-store";

/**
 * Filtro principal: un botón por proceso (equipo) con su conteo. Clic = solo
 * las tareas de ese equipo; otro clic lo quita. Los conteos respetan los
 * demás filtros pero no el de proceso (faceta), como en el prototipo.
 * Comparte el filtro `process` con el modal de filtros.
 */
export default function ProcessBar({ config }: { config: ITaskConfig }) {
  const { view, search, setFilter } = useTicketsView(
    useShallow((s) => ({ view: s.view, search: s.search, setFilter: s.setFilter }))
  );
  const { facets } = useTaskFacets({
    config,
    filters: view.filters,
    created: view.created,
    showClosed: view.showClosed,
    search,
    facets: ["process"],
    enabled: config.processes.length > 0
  });
  if (!config.processes.length) return null;

  const counts = new Map((facets?.facets.process ?? []).map((f) => [f.value, f.count]));
  const selected = view.filters.process ?? [];
  const items = [
    ...config.processes.map((p) => ({ value: String(p.id), label: p.name, color: p.color })),
    // Acciones de novedad y tareas viejas sin proceso: solo si hay alguna.
    ...(counts.get("none") ? [{ value: "none", label: "Sin proceso", color: undefined }] : [])
  ];

  const toggle = (value: string) =>
    setFilter("process", selected.length === 1 && selected[0] === value ? [] : [value]);

  return (
    <nav aria-label="Procesos" className="flex min-w-0 flex-wrap items-center gap-1">
      {items.map((p) => {
        const on = selected.includes(p.value);
        return (
          <button
            key={p.value}
            type="button"
            aria-pressed={on}
            onClick={() => toggle(p.value)}
            className={cn(
              "flex h-8 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border-0 px-2.5 text-[13px] transition-colors",
              on
                ? "bg-cp-lime-tint font-semibold text-[#141414]"
                : "bg-transparent text-cp-ink-2 hover:bg-cp-muted"
            )}
          >
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ background: p.color ?? "rgb(var(--cp-ink-4))" }}
            />
            {p.label}
            <span className={cn("tabular-nums", on ? "text-[#4a4a4a]" : "text-cp-ink-4")}>
              {counts.get(p.value) ?? 0}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
