"use client";

import { FilterModal } from "@/components/ui/filter-modal";
import type {
  FilterCategoryConfig,
  FilterOptionItem,
  FilterSelection
} from "@/components/ui/filter-modal";
import { useMarketAdminProductLines } from "@/modules/marketAdmin/hooks/useMarketAdminProductLines";
import { useMarketAdminProductCategories } from "@/modules/marketAdmin/hooks/useMarketAdminProductCategories";

export interface IMarketAdminProductsFilter {
  lineId: number | null;
  categoryId: number | null;
  status: 0 | 1 | null;
}

const ESTADO_OPTIONS: FilterOptionItem[] = [
  { id: "1", name: "Activo" },
  { id: "0", name: "Inactivo" }
];

const TRIGGER_CLASS =
  "h-12 flex items-center gap-2 border border-[#E0E0E0] rounded-lg px-4 bg-white text-[#141414] hover:bg-[#F0F0F0] transition-colors";

interface FilterProductsModalProps {
  value: IMarketAdminProductsFilter;
  onChange: (next: IMarketAdminProductsFilter) => void;
}

export default function FilterProductsModal({ value, onChange }: FilterProductsModalProps) {
  const { data: productLines, isLoading: isLoadingLines } = useMarketAdminProductLines();
  const { data: productCategories, isLoading: isLoadingCategories } =
    useMarketAdminProductCategories();

  const lineaOptions: FilterOptionItem[] = productLines.map((l) => ({
    id: String(l.id),
    name: l.description
  }));

  // Línea y Categoría son filtros independientes, así que cada categoría se
  // etiqueta con su línea para que una combinación incoherente se vea antes de
  // aplicar. El fallback importa: ambas listas cargan en paralelo.
  const lineNameById = new Map(productLines.map((l) => [l.id, l.description]));
  const categoriaOptions: FilterOptionItem[] = productCategories.map((c) => {
    const lineName = lineNameById.get(c.line_id);
    return { id: String(c.id), name: lineName ? `${lineName} · ${c.description}` : c.description };
  });

  const lineaId = value.lineId !== null ? String(value.lineId) : null;
  const categoriaId = value.categoryId !== null ? String(value.categoryId) : null;

  const selection: FilterSelection = {
    linea: lineaId
      ? [{ id: lineaId, name: lineaOptions.find((o) => o.id === lineaId)?.name ?? lineaId }]
      : [],
    categoria: categoriaId
      ? [
          {
            id: categoriaId,
            name: categoriaOptions.find((o) => o.id === categoriaId)?.name ?? categoriaId
          }
        ]
      : [],
    estado:
      value.status !== null
        ? [{ id: String(value.status), name: value.status === 1 ? "Activo" : "Inactivo" }]
        : []
  };

  const selectionToDomain = (sel: FilterSelection): IMarketAdminProductsFilter => {
    const estadoId = sel.estado?.[0]?.id;
    return {
      lineId: sel.linea?.[0] ? Number(sel.linea[0].id) : null,
      categoryId: sel.categoria?.[0] ? Number(sel.categoria[0].id) : null,
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
      key: "categoria",
      label: "Categoría",
      selectMode: "single",
      options: categoriaOptions,
      status: isLoadingCategories ? "loading" : undefined
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
      // El tag de Categoría muestra el nombre pelado; con el prefijo de línea
      // queda demasiado largo para la barra de filtros activos.
      formatTagValue={(cat, items) =>
        cat.key === "categoria"
          ? productCategories.find((c) => String(c.id) === items[0]?.id)?.description ??
            items[0]?.name ??
            ""
          : items[0]?.name ?? ""
      }
      onApply={(sel) => onChange(selectionToDomain(sel))}
      onValueChange={(sel) => onChange(selectionToDomain(sel))}
      onClearAll={() => onChange({ lineId: null, categoryId: null, status: null })}
    />
  );
}
