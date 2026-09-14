"use client";

import { FilterModal } from "@/components/ui/filter-modal";
import type {
  FilterCategoryConfig,
  FilterOptionItem,
  FilterSelection
} from "@/components/ui/filter-modal";
import { useMarketAdminLines } from "@/modules/marketAdmin/hooks/useMarketAdminLines";

export interface IMarketAdminClientsFilter {
  linea: string | null; // el listado de clientes filtra por NOMBRE de línea, no por id
  status: 0 | 1 | null;
}

const ESTADO_OPTIONS: FilterOptionItem[] = [
  { id: "1", name: "Activo" },
  { id: "0", name: "Inactivo" }
];

const TRIGGER_CLASS =
  "h-12 flex items-center gap-2 border border-[#E0E0E0] rounded-lg px-4 bg-white text-[#141414] hover:bg-[#F0F0F0] transition-colors";

interface FilterClientsModalProps {
  value: IMarketAdminClientsFilter;
  onChange: (next: IMarketAdminClientsFilter) => void;
}

export default function FilterClientsModal({ value, onChange }: FilterClientsModalProps) {
  const { data: lines, isLoading: isLoadingLines } = useMarketAdminLines();

  // El id de la opción es el propio nombre: es el valor que espera el endpoint,
  // así reconstruir la selección no necesita un lookup inverso.
  const lineaOptions: FilterOptionItem[] = lines.map((l) => ({
    id: l.description_line,
    name: l.description_line
  }));

  const selection: FilterSelection = {
    linea: value.linea ? [{ id: value.linea, name: value.linea }] : [],
    estado:
      value.status !== null
        ? [{ id: String(value.status), name: value.status === 1 ? "Activo" : "Inactivo" }]
        : []
  };

  const selectionToDomain = (sel: FilterSelection): IMarketAdminClientsFilter => {
    const estadoId = sel.estado?.[0]?.id;
    return {
      linea: sel.linea?.[0]?.id ?? null,
      status: estadoId === "1" ? 1 : estadoId === "0" ? 0 : null
    };
  };

  const categories: FilterCategoryConfig[] = [
    {
      key: "linea",
      label: "Línea",
      selectMode: "single",
      options: lineaOptions,
      status: isLoadingLines ? "loading" : undefined
    },
    {
      key: "estado",
      label: "Estado",
      selectMode: "single",
      options: ESTADO_OPTIONS
    }
  ];

  return (
    <FilterModal
      categories={categories}
      value={selection}
      trigger={{ className: TRIGGER_CLASS, showChevron: true }}
      onApply={(sel) => onChange(selectionToDomain(sel))}
      onValueChange={(sel) => onChange(selectionToDomain(sel))}
      onClearAll={() => onChange({ linea: null, status: null })}
    />
  );
}
