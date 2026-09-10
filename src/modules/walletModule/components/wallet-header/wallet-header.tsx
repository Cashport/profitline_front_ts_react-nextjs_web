"use client";

import UiSearchInput from "@/components/ui/search-input";
import { FECHA_CORTE_PLACEHOLDER } from "../../constants";
import WalletFilterModal from "../wallet-filter-modal/wallet-filter-modal";
import WalletThemeToggle from "../wallet-theme-toggle/wallet-theme-toggle";

interface WalletHeaderProps {
  /** Búsqueda actual. Se comparte con el buscador de la matriz para que los
   *  dos muestren siempre lo mismo y no se contradigan. */
  search?: string;
  onSearchChange: (value: string) => void;
  /** Fin de la última corrida del worker; null mientras no hay foto. */
  lastUpdatedAt?: string | null;
  /** Fecha contra la que se calcularon las edades de esta consulta. */
  cutoffDate?: string;
  projected?: boolean;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  onToggleProjection?: (value: boolean) => void;
}

const formatCorte = (value?: string | null) =>
  value
    ? `Corte ${new Date(value).toLocaleString("es-CO", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })}`
    : FECHA_CORTE_PLACEHOLDER;

/**
 * Barra superior: título, corte, búsqueda global, proyección, filtros y tema.
 *
 * El corte no es decorativo: la pantalla lee una foto que el worker
 * regenera cada 30 minutos, así que sin esa marca el usuario no puede
 * distinguir un dato de hace un minuto de uno de hace media hora.
 */
export default function WalletHeader({
  search,
  onSearchChange,
  lastUpdatedAt,
  cutoffDate,
  projected,
  isRefreshing,
  onRefresh,
  onToggleProjection
}: WalletHeaderProps) {
  return (
    <header className="flex flex-wrap items-center gap-3.5 border-b border-border pb-3">
      <h1 className="text-base font-semibold text-foreground">Cartera por cliente y tramo</h1>

      <span className="flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            isRefreshing ? "animate-pulse bg-amber-500" : "bg-emerald-500"
          }`}
        />
        {formatCorte(lastUpdatedAt)}
      </span>

      {projected && cutoffDate && (
        <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[11.5px] font-medium text-amber-800">
          Proyectado a {new Date(cutoffDate).toLocaleDateString("es-CO")}
        </span>
      )}

      <label className="flex items-center gap-1.5 whitespace-nowrap text-[11.5px] text-muted-foreground">
        <input
          type="checkbox"
          checked={Boolean(projected)}
          onChange={(e) => onToggleProjection?.(e.target.checked)}
        />
        Proyectar a cierre de mes
      </label>

      {isRefreshing ? (
        <span
          className="flex items-center gap-2 whitespace-nowrap rounded-lg border border-border px-3 py-1.5 text-[11.5px] font-semibold text-muted-foreground"
          role="status"
          aria-live="polite"
        >
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-border border-t-foreground" />
          Actualizando…
        </span>
      ) : (
        onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            className="whitespace-nowrap rounded-lg border border-border px-3 py-1.5 text-[11.5px] font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            Actualizar ahora
          </button>
        )
      )}

      {/* UiSearchInput es flex:1, así que el ml-auto va en el grupo, no en él. */}
      <div className="ml-auto flex items-center gap-3">
        {/* <UiSearchInput
          id="wallet-global-search"
          showBorder
          placeholder="Cliente, NIT, factura o ejecutivo…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        /> */}
        <WalletFilterModal />
        <WalletThemeToggle />
      </div>
    </header>
  );
}
