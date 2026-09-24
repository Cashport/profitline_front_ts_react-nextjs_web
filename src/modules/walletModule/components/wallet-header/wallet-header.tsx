"use client";

import { RefreshCw } from "lucide-react";

import { FECHA_CORTE_PLACEHOLDER } from "../../constants";
import ToggleSwitch from "../shared/toggle-switch";
import WalletThemeToggle from "../wallet-theme-toggle/wallet-theme-toggle";

interface WalletHeaderProps {
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
 * Barra superior: título, corte, proyección y tema. Buscador y filtros
 * viven en la tarjeta de abajo (`WalletView`), junto a lo que filtran.
 *
 * El corte no es decorativo: la pantalla lee una foto que el worker
 * regenera cada 30 minutos, así que sin esa marca el usuario no puede
 * distinguir un dato de hace un minuto de uno de hace media hora.
 */
export default function WalletHeader({
  lastUpdatedAt,
  cutoffDate,
  projected,
  isRefreshing,
  onRefresh,
  onToggleProjection
}: WalletHeaderProps) {
  return (
    <header className="flex flex-wrap items-center gap-3.5 border-b border-border pb-3">
      <h1 className="text-base font-semibold text-foreground">Cartera</h1>

      <span className="flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            isRefreshing ? "animate-pulse bg-amber-500" : "bg-emerald-500"
          }`}
        />
        {formatCorte(lastUpdatedAt)}
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            aria-label="Actualizar ahora"
            title="Actualizar ahora"
            className="flex h-[30px] w-[30px] items-center justify-center rounded-md text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
        )}
      </span>

      {projected && cutoffDate && (
        <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[11.5px] font-medium text-amber-800">
          Proyectado a {new Date(cutoffDate).toLocaleDateString("es-CO")}
        </span>
      )}

      <ToggleSwitch
        checked={Boolean(projected)}
        onChange={(v) => onToggleProjection?.(v)}
        label="Proyectar a cierre de mes"
      />

      <div className="ml-auto flex items-center gap-3">
        <WalletThemeToggle />
      </div>
    </header>
  );
}
