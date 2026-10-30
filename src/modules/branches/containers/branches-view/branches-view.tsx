"use client";

import { useRef } from "react";
import { Alert } from "antd";

import Pagination from "@/components/ui/pagination";
import { cn } from "@/utils/utils";

import BranchesTable from "../../components/branches-table/branches-table";
import { PAGE_SIZE } from "../../constants";
import { useBranchesPage } from "../../hooks/use-branches";
import { useBranchesStore } from "../../stores/branches-store";
import { plural } from "../../utils/branches";

/**
 * Sucursales de devolución (/branches): las sucursales de los clientes con su lista de
 * precios, precio base y estado, de a 20 por página. El ojo de cada fila abre su detalle.
 */
export default function BranchesView() {
  const { branches, total, totalClients, page, error, isLoading, isValidating } = useBranchesPage();
  const hasQuery = useBranchesStore(
    (s) => Boolean(s.search.trim()) || Object.values(s.filters).some((v) => v.length)
  );
  const clearAll = useBranchesStore((s) => s.clearAll);
  const setPage = useBranchesStore((s) => s.setPage);
  const scrollRef = useRef<HTMLDivElement>(null);

  // "4 clientes · 74 sucursales"; con búsqueda o filtros, cuenta solo lo que coincide.
  const counter = isLoading
    ? "Cargando sucursales…"
    : `${plural(totalClients, "cliente", "clientes")} · ${
        hasQuery
          ? plural(total, "sucursal coincide", "sucursales coinciden")
          : plural(total, "sucursal", "sucursales")
      }`;

  // Al cambiar de página, la tabla vuelve arriba.
  const changePage = (next: number) => {
    setPage(next);
    scrollRef.current?.scrollTo({ top: 0 });
  };

  return (
    <div className="cp-page min-h-0 flex-1">
      {error && (
        <Alert
          type="error"
          showIcon
          message="No se pudieron cargar las sucursales"
          description={error.message}
        />
      )}

      <section className="cp-card flex min-h-0 flex-1 flex-col overflow-hidden">
        {/* Sin título: el del header basta. Solo el contador arriba a la derecha. */}
        <div className="flex h-[40px] shrink-0 items-center justify-end gap-3 px-3">
          {hasQuery && (
            <button
              type="button"
              onClick={clearAll}
              className="cursor-pointer border-0 bg-transparent text-[13px] font-semibold text-cp-ink-2 hover:text-cp-ink hover:underline"
            >
              Limpiar filtros
            </button>
          )}
          <span aria-live="polite" className="text-[13px] text-cp-ink-4">
            {counter}
          </span>
        </div>
        <div
          ref={scrollRef}
          className={cn(
            "min-h-0 flex-1 overflow-y-auto transition-opacity",
            isValidating && !isLoading && "opacity-60"
          )}
        >
          {!isLoading && <BranchesTable branches={branches} onClearAll={clearAll} />}
        </div>
        {/* Solo aparece si hay más de una página. */}
        {total > PAGE_SIZE && (
          <div className="shrink-0 border-t border-cp-line px-3 py-2">
            <Pagination
              currentPage={page}
              totalItems={total}
              pageSize={PAGE_SIZE}
              onPageChange={changePage}
              isLoading={isValidating}
            />
          </div>
        )}
      </section>
    </div>
  );
}
