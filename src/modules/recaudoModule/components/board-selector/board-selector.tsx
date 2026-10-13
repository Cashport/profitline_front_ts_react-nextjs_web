"use client";

import { Dropdown } from "antd";
import type { MenuProps } from "antd";
import { Check, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

import { cn } from "@/utils/utils";
import { useWalletTheme } from "@/modules/walletModule/contexts/wallet-theme-context";
import { BOARDS } from "../../constants";
import { useTowerFilters } from "../../contexts/tower-filters-context";

/**
 * Título del encabezado y selector de tableros del módulo ("cambiar tablero").
 * Lista todos los tableros de BOARDS: los que no tienen vista se pueden
 * elegir y muestran "en diseño" (PendingBoard). El menú de antd se cierra al
 * elegir, al hacer clic por fuera o con Esc, y se usa con teclado.
 */
export default function BoardSelector() {
  const router = useRouter();
  const { resolvedTheme } = useWalletTheme();
  const { filters, patch } = useTowerFilters();
  const active = BOARDS.find((b) => b.id === filters.board) ?? BOARDS[0];

  const items: MenuProps["items"] = [
    {
      type: "group",
      key: "boards",
      label: "Tableros de recaudo",
      children: BOARDS.map((b) => ({
        key: b.id,
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

  return (
    <h1 className="m-0">
      <Dropdown
        trigger={["click"]}
        rootClassName={cn("wallet-scope", resolvedTheme === "dark" && "dark")}
        menu={{ items, selectable: true, selectedKeys: [active.id], onClick: choose }}
      >
        <button
          type="button"
          aria-haspopup="menu"
          className="-ml-1.5 flex cursor-pointer items-center gap-2 rounded-md border-0 bg-transparent px-1.5 py-1 text-base font-bold text-foreground hover:bg-muted"
        >
          {active.name}
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>
      </Dropdown>
    </h1>
  );
}
