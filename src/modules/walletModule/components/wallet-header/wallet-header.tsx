"use client";

import Header from "@/components/organisms/header";
import HeaderCutoff from "@/components/ui/header-cutoff/header-cutoff";
import { FECHA_CORTE_PLACEHOLDER } from "../../constants";
import ModalFilterMatrix from "../modal-filter-matrix/modal-filter-matrix";
import WalletActionsMenu from "../wallet-actions-menu/wallet-actions-menu";
import type { EstadoId, IWalletMatrixModalFilters } from "../../types";

interface WalletHeaderProps {
  /** Búsqueda actual. Se comparte con el buscador de la matriz para que los
   *  dos muestren siempre lo mismo y no se contradigan. */
  search?: string;
  onSearchChange: (value: string) => void;
  /** Filtros confirmados en el modal. */
  filters: IWalletMatrixModalFilters;
  onFiltersChange: (next: IWalletMatrixModalFilters) => void;
  /** Estados elegibles en la categoría Estado: los mismos que los chips de la matriz. */
  selectableEstados: EstadoId[];
  estadosLoading?: boolean;
  /** Fin de la última corrida del worker; null mientras no hay foto. */
  lastUpdatedAt?: string | null;
  /** Fecha contra la que se calcularon las edades de esta consulta. */
  cutoffDate?: string;
  projected?: boolean;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  onToggleProjection?: (value: boolean) => void;
  /** Descarga en .xlsx la matriz con los filtros y el orden actuales. */
  onDownloadExcel?: () => void;
  downloadingExcel?: boolean;
}

/**
 * Header compartido (docs/DESIGN.md §4): título con el corte y "Proyectar a cierre" al lado;
 * a la derecha filtros, acciones (descarga a Excel), tema y avatar. La búsqueda de este módulo
 * va dentro de la tabla.
 *
 * El corte no es decorativo: la pantalla lee una foto que el worker
 * regenera cada 30 minutos, así que sin esa marca el usuario no puede
 * distinguir un dato de hace un minuto de uno de hace media hora.
 */
export default function WalletHeader({
  search,
  onSearchChange,
  filters,
  onFiltersChange,
  selectableEstados,
  estadosLoading,
  lastUpdatedAt,
  cutoffDate,
  projected,
  isRefreshing,
  onRefresh,
  onToggleProjection,
  onDownloadExcel,
  downloadingExcel
}: WalletHeaderProps) {
  // El API manda la fecha como medianoche UTC ("2026-09-30T00:00:00Z"): leída en hora local
  // (UTC-5) se pintaría el día anterior.
  const projectedTo = cutoffDate
    ? new Date(cutoffDate).toLocaleDateString("es-CO", {
        day: "2-digit",
        month: "2-digit",
        timeZone: "UTC"
      })
    : undefined;

  return (
    <Header
      title="Cartera por cliente y tramo"
      titleExtra={
        <HeaderCutoff
          cutoffAt={lastUpdatedAt}
          placeholder={FECHA_CORTE_PLACEHOLDER}
          busy={isRefreshing}
          busyLabel="Actualizando…"
          onRefresh={onRefresh}
          refreshLabel="Reprocesar"
          projection={{
            checked: Boolean(projected),
            onChange: (value) => onToggleProjection?.(value),
            toLabel: projectedTo
          }}
        />
      }
      actionsExtra={
        <>
          {/* La búsqueda vive dentro de la tabla (excepción de DESIGN.md §4). */}
          <ModalFilterMatrix
            inHeader
            value={filters}
            onChange={onFiltersChange}
            selectableEstados={selectableEstados}
            estadosLoading={estadosLoading}
          />
          {onDownloadExcel && (
            <WalletActionsMenu onDownloadExcel={onDownloadExcel} downloading={downloadingExcel} />
          )}
        </>
      }
    />
  );
}
