"use client";

import UiSearchInput from "@/components/ui/search-input";
import { FECHA_CORTE } from "../../constants";
import WalletThemeToggle from "../wallet-theme-toggle/wallet-theme-toggle";

interface WalletHeaderProps {
  onSearchChange: (value: string) => void;
}

/** Barra superior de la cartera: título, fecha de corte, búsqueda global y tema. */
export default function WalletHeader({ onSearchChange }: WalletHeaderProps) {
  return (
    <header className="flex flex-wrap items-center gap-3.5 border-b border-border pb-3">
      <h1 className="text-base font-semibold text-foreground">Cartera</h1>

      <span className="flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        {FECHA_CORTE}
      </span>

      {/* UiSearchInput es flex:1, así que el ml-auto va en el grupo, no en él. */}
      <div className="ml-auto flex items-center gap-3">
        <UiSearchInput
          id="wallet-global-search"
          showBorder
          placeholder="Cliente, factura o novedad…"
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <WalletThemeToggle />
      </div>
    </header>
  );
}
