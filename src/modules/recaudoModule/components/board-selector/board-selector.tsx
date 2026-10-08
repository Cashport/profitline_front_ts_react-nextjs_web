"use client";

import { Dropdown, Tooltip } from "antd";
import type { MenuProps } from "antd";
import { Check, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

import { cn } from "@/utils/utils";
import { useWalletTheme } from "@/modules/walletModule/contexts/wallet-theme-context";
import { BOARDS } from "../../constants";
import { useTowerFilters } from "../../contexts/tower-filters-context";

/**
 * Título del encabezado y selector de tableros del módulo ("cambiar tablero").
 * Con un solo tablero listo no hay a dónde cambiar: el selector se ve, pero no
 * abre. Se habilita solo al marcar `enabled` otro tablero en BOARDS.
 */
export default function BoardSelector() {
  const router = useRouter();
  const { resolvedTheme } = useWalletTheme();
  const { filters, patch } = useTowerFilters();
  const active = BOARDS.find((b) => b.id === filters.board) ?? BOARDS[0];
  const selectable = BOARDS.filter((b) => b.enabled).length > 1;

  const items: MenuProps["items"] = [
    {
      type: "group",
      key: "boards",
      label: "Tableros de recaudo",
      children: BOARDS.map((b) => ({
        key: b.id,
        disabled: !b.enabled,
        label: (
          <span className="grid grid-cols-[1fr_16px] items-center gap-x-2.5 py-0.5">
            <b className="text-[12.5px] font-semibold">{b.name}</b>
            <Check
              className={cn("row-span-2 h-4 w-4 text-primary", b.id !== active.id && "invisible")}
            />
            <small className="text-[11px] text-muted-foreground">{b.description}</small>
          </span>
        )
      }))
    }
  ];

  // Un tablero en otra ruta (p. ej. la cartera) navega; uno de este módulo cambia la vista aquí.
  const choose: MenuProps["onClick"] = ({ key }) => {
    const board = BOARDS.find((b) => b.id === key);
    if (!board) return;
    if (board.href) router.push(board.href);
    else patch({ board: board.id });
  };

  const trigger = (
    <button
      type="button"
      disabled={!selectable}
      aria-haspopup="menu"
      className="-ml-1.5 flex items-center gap-2 rounded-md border-0 bg-transparent px-1.5 py-1 text-base font-bold text-foreground enabled:cursor-pointer enabled:hover:bg-muted disabled:cursor-default"
    >
      {active.name}
      <ChevronDown className={cn("h-4 w-4 text-muted-foreground", !selectable && "opacity-40")} />
    </button>
  );

  return (
    <h1 className="m-0">
      {selectable ? (
        <Dropdown
          trigger={["click"]}
          rootClassName={cn("wallet-scope", resolvedTheme === "dark" && "dark")}
          menu={{ items, selectable: true, selectedKeys: [active.id], onClick: choose }}
        >
          {trigger}
        </Dropdown>
      ) : (
        <Tooltip title="Más tableros próximamente">{trigger}</Tooltip>
      )}
    </h1>
  );
}
