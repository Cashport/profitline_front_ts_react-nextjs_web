"use client";

import { Dropdown } from "antd";
import type { MenuProps } from "antd";
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  CircleCheck,
  List,
  SquareKanban
} from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { cn } from "@/utils/utils";
import { useWalletTheme } from "@/modules/walletModule/contexts/wallet-theme-context";
import type { ITaskConfig, TaskFieldKey } from "@/types/tickets/ITickets";
import { fieldOf } from "../../hooks/useTaskConfig";
import { useTicketsView } from "../../stores/tickets-view-store";
import type { TaskLayout } from "../../types";

const NO_GROUP = "__none__";

const LAYOUTS: { key: TaskLayout; label: string; icon: typeof List }[] = [
  { key: "list", label: "Lista", icon: List },
  { key: "board", label: "Tablero", icon: SquareKanban }
];

const checkLabel = (label: string, on: boolean) => (
  <span className="flex items-center justify-between gap-6 text-[13px]">
    {label}
    <Check className={cn("h-4 w-4 text-[#9bb514]", !on && "invisible")} />
  </span>
);

/**
 * Controles de la vista: mostrar cerradas, Lista/Tablero, "Agrupar por" y
 * "Ordenar por". Solo ofrece los campos que el proyecto tiene activos.
 */
export default function TasksToolbar({ config }: { config: ITaskConfig }) {
  const { resolvedTheme } = useWalletTheme();
  const { view, patchView } = useTicketsView(
    useShallow((s) => ({ view: s.view, patchView: s.patchView }))
  );
  const menuRoot = cn("wallet-scope", resolvedTheme === "dark" && "dark");
  const groupField = fieldOf(config, view.groupBy);
  const sortField = fieldOf(config, view.sortBy);

  const groupItems: MenuProps["items"] = [
    { key: NO_GROUP, label: checkLabel("Sin agrupar", !groupField) },
    ...config.fields
      .filter((f) => f.groupable)
      .map((f) => ({ key: f.key, label: checkLabel(f.label, f.key === groupField?.key) }))
  ];
  const sortItems: MenuProps["items"] = config.fields
    .filter((f) => f.sortable)
    .map((f) => ({ key: f.key, label: checkLabel(f.label, f.key === view.sortBy) }));

  const onGroup: MenuProps["onClick"] = ({ key }) =>
    patchView({ groupBy: key === NO_GROUP ? null : (key as TaskFieldKey) });
  const onSort: MenuProps["onClick"] = ({ key }) => {
    const field = fieldOf(config, key as TaskFieldKey);
    if (!field) return;
    // Volver a elegir el mismo campo invierte la dirección.
    if (key === view.sortBy) patchView({ sortDir: view.sortDir === "asc" ? "desc" : "asc" });
    else patchView({ sortBy: field.key, sortDir: field.default_sort_dir });
  };

  const control =
    "flex h-8 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border border-cp-line-2 bg-cp-surface px-2.5 text-[13px] text-cp-ink-3 hover:border-cp-ink";
  const SortIcon = view.sortDir === "asc" ? ArrowUp : ArrowDown;

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-2">
      <button
        type="button"
        aria-pressed={view.showClosed}
        title={view.showClosed ? "Ocultar cerradas" : "Mostrar cerradas"}
        onClick={() => patchView({ showClosed: !view.showClosed })}
        className={cn(
          "flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border-0 transition-colors",
          view.showClosed
            ? "bg-cp-lime-tint text-[#6f8410]"
            : "bg-transparent text-cp-ink-4 hover:bg-cp-muted"
        )}
      >
        <CircleCheck className="h-[18px] w-[18px]" />
      </button>

      <div className="flex overflow-hidden rounded-lg border border-cp-line-2 bg-cp-surface">
        {LAYOUTS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            aria-pressed={view.layout === key}
            onClick={() => patchView({ layout: key })}
            className={cn(
              "flex h-8 cursor-pointer items-center gap-1.5 border-0 border-r border-solid border-cp-line-2 px-2.5 text-[13px] last:border-r-0",
              view.layout === key
                ? "bg-cp-muted font-semibold text-cp-ink"
                : "bg-transparent text-cp-ink-3 hover:text-cp-ink"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {view.layout === "list" && (
        <Dropdown
          trigger={["click"]}
          rootClassName={menuRoot}
          menu={{ items: groupItems, onClick: onGroup }}
        >
          <button type="button" aria-haspopup="menu" className={control}>
            Agrupar:{" "}
            <b className="font-semibold text-cp-ink">{groupField?.label ?? "Sin agrupar"}</b>
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </Dropdown>
      )}

      <Dropdown
        trigger={["click"]}
        rootClassName={menuRoot}
        menu={{ items: sortItems, onClick: onSort }}
      >
        <button type="button" aria-haspopup="menu" className={control}>
          Ordenar: <b className="font-semibold text-cp-ink">{sortField?.label ?? "—"}</b>
          <SortIcon className="h-3.5 w-3.5" />
        </button>
      </Dropdown>
    </div>
  );
}
