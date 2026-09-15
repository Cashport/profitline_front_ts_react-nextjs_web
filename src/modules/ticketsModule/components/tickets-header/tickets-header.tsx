"use client";

import UiSearchInput from "@/components/ui/search-input";
import { FECHA_CORTE_PLACEHOLDER } from "@/modules/walletModule/constants";
import WalletThemeToggle from "@/modules/walletModule/components/wallet-theme-toggle/wallet-theme-toggle";
import { fmtActualizado } from "@/modules/walletModule/utils/format";

interface TicketsHeaderProps {
  /** Última respuesta exitosa del listado; null mientras no llega la primera. */
  fetchedAt: Date | null;
  onSearchChange: (value: string) => void;
}

/** Barra superior de la bandeja: título, última actualización, búsqueda y tema. */
export default function TicketsHeader({ fetchedAt, onSearchChange }: TicketsHeaderProps) {
  return (
    <header className="flex flex-wrap items-center gap-3.5 border-b border-border pb-3">
      <h1 className="text-base font-semibold text-foreground">Tickets</h1>

      <span className="flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        {fmtActualizado(fetchedAt, FECHA_CORTE_PLACEHOLDER)}
      </span>

      {/* UiSearchInput es flex:1, así que el ml-auto va en el grupo, no en él. */}
      <div className="ml-auto flex items-center gap-3">
        <UiSearchInput
          id="tickets-global-search"
          showBorder
          placeholder="Código o título…"
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <WalletThemeToggle />
      </div>
    </header>
  );
}
