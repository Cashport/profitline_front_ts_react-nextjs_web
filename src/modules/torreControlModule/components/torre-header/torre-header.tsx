"use client";

import { useState } from "react";

import Header from "@/components/organisms/header";
import {
  FilterButton,
  HeaderSearch
} from "@/components/ui/page-header-controls/page-header-controls";
import { FECHA_CORTE } from "@/modules/walletModule/constants";

interface TorreHeaderProps {
  onSearchChange: (value: string) => void;
}

/**
 * Header compartido (docs/DESIGN.md §4): título y fecha de corte; a la derecha
 * filtrar, buscador, tema y avatar (cerrar sesión).
 */
export default function TorreHeader({ onSearchChange }: TorreHeaderProps) {
  const [search, setSearch] = useState("");

  return (
    <Header
      title="Torre de control"
      titleExtra={
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 shrink-0 rounded-full bg-[#9bb514]" />
          {FECHA_CORTE}
        </span>
      }
      actionsExtra={
        <>
          {/* TODO: abrir el modal Filtros Avanzados con TORRE_FILTERS (coordinador, ejecutivo,
              KAM, tipo de novedad y tramo) cuando exista el endpoint de filtros. */}
          <FilterButton onClick={() => undefined} disabled />
          <HeaderSearch
            value={search}
            onChange={(value) => {
              setSearch(value);
              onSearchChange(value);
            }}
            placeholder="Cliente, factura o novedad…"
          />
        </>
      }
    />
  );
}
