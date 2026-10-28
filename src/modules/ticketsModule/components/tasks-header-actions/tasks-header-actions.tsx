"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import {
  FilterChips,
  HeaderSearch,
  type FilterChipItem
} from "@/components/ui/page-header-controls/page-header-controls";
import { useDebounce } from "@/hooks/useDeabouce";
import WalletThemeToggle from "@/modules/walletModule/components/wallet-theme-toggle/wallet-theme-toggle";
import type { ITaskConfig } from "@/types/tickets/ITickets";
import { useTaskConfig } from "../../hooks/useTaskConfig";
import { useTaskOptions } from "../../hooks/useTaskDetail";
import { useTicketsView } from "../../stores/tickets-view-store";
import { createDraftFor } from "../../utils/task-create-draft";
import { formatTaskDate } from "../../utils/task-format";
import TasksFilterModal, {
  emptyLabelOf,
  filterableFields
} from "../tasks-filter-modal/tasks-filter-modal";

/**
 * Encabezado del gestor de tareas (DESIGN.md §4): "+ Nueva tarea", etiquetas
 * de filtros aplicados ("País: Colombia ×"), "Filtrar", buscador y tema.
 */
export default function TasksHeaderActions() {
  const { config } = useTaskConfig();
  if (!config) return null;
  return <HeaderActions config={config} />;
}

function HeaderActions({ config }: { config: ITaskConfig }) {
  const { view, viewKey, setFilter, patchView, setSearch, openCreate } = useTicketsView(
    useShallow((s) => ({
      view: s.view,
      viewKey: s.viewKey,
      setFilter: s.setFilter,
      patchView: s.patchView,
      setSearch: s.setSearch,
      openCreate: s.openCreate
    }))
  );

  const [term, setTerm] = useState("");
  const debounced = useDebounce(term, 300);
  useEffect(() => setSearch(debounced), [debounced, setSearch]);
  // Otra vista (otro proyecto): el buscador arranca vacío.
  useEffect(() => setTerm(""), [viewKey]);

  // Etiquetas de clientes elegidos: el back las resuelve por id.
  const clientIds = (view.filters.client ?? []).filter((v) => v !== "none");
  const dataClientIds = (view.filters.data_client ?? []).filter((v) => v !== "none");
  const clients = useTaskOptions(clientIds.length ? "client" : null, "", clientIds).options;
  const dataClients = useTaskOptions(
    dataClientIds.length ? "data_client" : null,
    "",
    dataClientIds
  ).options;

  const labelOf = (key: string, value: string) => {
    const field = config.fields.find((f) => f.key === key);
    if (!field) return value;
    if (value === "none") return emptyLabelOf(field);
    const remote = key === "client" ? clients : key === "data_client" ? dataClients : null;
    if (remote) return remote.find((o) => o.id === value)?.label ?? value;
    return field.options?.find((o) => o.value === value)?.label ?? value;
  };

  // El proceso no va como etiqueta: ya se ve marcado en la barra de procesos.
  const chips: FilterChipItem[] = filterableFields(config)
    .filter((f) => f.key !== "process" && view.filters[f.key]?.length)
    .map((f) => ({
      key: f.key,
      label: f.label,
      value: (view.filters[f.key] ?? []).map((v) => labelOf(f.key, v)).join(", "),
      onRemove: () => setFilter(f.key, [])
    }));
  if (view.created.from || view.created.to) {
    chips.push({
      key: "created",
      label: "Fecha",
      value: `${formatTaskDate(view.created.from)} – ${formatTaskDate(view.created.to)}`,
      onRemove: () => patchView({ created: { from: null, to: null } })
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => openCreate(createDraftFor(view))}
        className="box-border flex h-[var(--control-h)] shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-[11px] border-0 bg-cp-lime px-4 text-[16px] font-semibold text-[#141414] hover:bg-[#d8f032]"
      >
        <Plus className="h-4 w-4" strokeWidth={2.4} />
        Nueva tarea
      </button>
      <FilterChips chips={chips} />
      <TasksFilterModal config={config} />
      <HeaderSearch value={term} onChange={setTerm} placeholder="Buscar tarea o cliente" />
      <WalletThemeToggle />
    </>
  );
}
