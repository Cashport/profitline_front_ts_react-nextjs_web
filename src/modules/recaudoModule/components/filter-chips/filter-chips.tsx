"use client";

import { Button, Tag } from "antd";

import type { ICollectionTower } from "@/types/collectionTower/ICollectionTower";
import { useTowerFilters } from "../../contexts/tower-filters-context";
import { filterChips } from "../../utils/filters";

/** Filtros activos como chips que se pueden quitar, más "Limpiar filtros" cuando hay varios. */
export default function FilterChips({ data }: { data?: ICollectionTower }) {
  const { filters, patch, clear } = useTowerFilters();
  const chips = filterChips(filters, data);
  if (!chips.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {chips.map((c) => (
        <Tag
          key={c.key}
          closable
          className="m-0 text-[11px]"
          // preventDefault: el chip sale del estado, no lo esconde AntD por su cuenta.
          onClose={(e) => {
            e.preventDefault();
            patch(c.remove);
          }}
        >
          {c.label}: <b className="font-semibold">{c.value}</b>
        </Tag>
      ))}
      {chips.length > 1 && (
        <Button size="small" onClick={clear}>
          Limpiar filtros
        </Button>
      )}
    </div>
  );
}
