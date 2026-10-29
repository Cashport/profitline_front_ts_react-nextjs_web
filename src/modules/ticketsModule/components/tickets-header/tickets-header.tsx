"use client";

import { useState, type ReactNode } from "react";

import Header from "@/components/organisms/header";
import { HeaderSearch } from "@/components/ui/page-header-controls/page-header-controls";
import { FECHA_CORTE_PLACEHOLDER } from "@/modules/walletModule/constants";
import { fmtActualizado } from "@/modules/walletModule/utils/format";

interface TicketsHeaderProps {
  /** Última respuesta exitosa del listado; null mientras no llega la primera. */
  fetchedAt: Date | null;
  onSearchChange: (value: string) => void;
  /** "Filtrar" con sus chips, a la izquierda del buscador. */
  filters?: ReactNode;
}

/**
 * Header compartido (docs/DESIGN.md §4): título y última actualización; a la derecha
 * filtros, buscador, tema y avatar (cerrar sesión).
 */
export default function TicketsHeader({ fetchedAt, onSearchChange, filters }: TicketsHeaderProps) {
  const [search, setSearch] = useState("");

  return (
    <Header
      title="Tickets"
      titleExtra={
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 shrink-0 rounded-full bg-[#9bb514]" />
          {fmtActualizado(fetchedAt, FECHA_CORTE_PLACEHOLDER)}
        </span>
      }
      actionsExtra={
        <>
          {filters}
          <HeaderSearch
            value={search}
            onChange={(value) => {
              setSearch(value);
              onSearchChange(value);
            }}
            placeholder="Código o título…"
          />
        </>
      }
    />
  );
}
