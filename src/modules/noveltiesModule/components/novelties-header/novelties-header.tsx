"use client";

import { FECHA_CORTE_PLACEHOLDER } from "@/modules/walletModule/constants";
import WalletThemeToggle from "@/modules/walletModule/components/wallet-theme-toggle/wallet-theme-toggle";
import { fmtActualizado } from "@/modules/walletModule/utils/format";

interface NoveltiesHeaderProps {
  /** Última respuesta exitosa del listado; null mientras no llega la primera. */
  fetchedAt: Date | null;
}

/** Barra superior de la bandeja: título, última actualización y tema. */
export default function NoveltiesHeader({ fetchedAt }: NoveltiesHeaderProps) {
  return (
    <header className="flex flex-wrap items-center gap-3.5 border-b border-border pb-3">
      <h1 className="text-base font-semibold text-foreground">Novedades</h1>

      <span className="flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        {fmtActualizado(fetchedAt, FECHA_CORTE_PLACEHOLDER)}
      </span>

      <div className="ml-auto flex items-center gap-3">
        <WalletThemeToggle />
      </div>
    </header>
  );
}
