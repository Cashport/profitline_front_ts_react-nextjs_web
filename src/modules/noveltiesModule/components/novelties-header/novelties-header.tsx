"use client";

import { FECHA_CORTE_PLACEHOLDER } from "@/modules/walletModule/constants";
import WalletThemeToggle from "@/modules/walletModule/components/wallet-theme-toggle/wallet-theme-toggle";

interface NoveltiesHeaderProps {
  /** Última respuesta exitosa del listado; null mientras no llega la primera. */
  fetchedAt: Date | null;
}

const formatActualizado = (fecha: Date | null) =>
  fecha
    ? `Actualizado ${fecha.toLocaleString("es-CO", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })}`
    : FECHA_CORTE_PLACEHOLDER;

/** Barra superior de la bandeja: título, última actualización y tema. */
export default function NoveltiesHeader({ fetchedAt }: NoveltiesHeaderProps) {
  return (
    <header className="flex flex-wrap items-center gap-3.5 border-b border-border pb-3">
      <h1 className="text-base font-semibold text-foreground">Novedades</h1>

      <span className="flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        {formatActualizado(fetchedAt)}
      </span>

      <div className="ml-auto flex items-center gap-3">
        <WalletThemeToggle />
      </div>
    </header>
  );
}
