"use client";

import { FilterModal } from "@/components/ui/filter-modal";
import type {
  FilterCategoryConfig,
  FilterOptionItem,
  FilterSelection
} from "@/components/ui/filter-modal";
import { useInvoiceIncidentMotives } from "@/hooks/useInvoiceIncidentMotives";
import { useIncidentListFilters } from "@/modules/noveltiesModule/hooks/useIncidentListFilters";

import { EMPTY_MATRIX_MODAL_FILTERS, MATRIX_STATUS_OPTIONS } from "../../constants";
import type { IWalletMatrixModalFilters } from "../../types";

/** Misma superficie que el botón de tema para que los dos lean como un par. */
const TRIGGER_CLASS =
  "flex h-12 shrink-0 items-center gap-2 rounded-lg border border-border bg-card px-4 text-foreground transition-colors hover:bg-secondary";

interface ModalFilterMatrixProps {
  value: IWalletMatrixModalFilters;
  onChange: (next: IWalletMatrixModalFilters) => void;
}

type Loading = "loading" | undefined;

/** Opciones de un catálogo `{id, name}`; los ids de FilterModal son strings. */
const toOptions = (items?: { id: number | string; name: string }[]): FilterOptionItem[] =>
  (items ?? []).map((i) => ({ id: String(i.id), name: i.name }));

/** Opciones de un filtro canonicalizado: el canónico es a la vez id y etiqueta. */
const canonicalOptions = (items?: { canonical: string }[]): FilterOptionItem[] =>
  (items ?? []).map((c) => ({ id: c.canonical, name: c.canonical }));

/** Selección de una categoría multi a partir de los ids confirmados. */
const many = (ids: Array<string | number>, options: FilterOptionItem[]): FilterOptionItem[] =>
  ids.map((id) => {
    const key = String(id);
    return { id: key, name: options.find((o) => o.id === key)?.name ?? key };
  });

const toNumbers = (items?: FilterOptionItem[]) => (items ?? []).map((o) => Number(o.id));
const toTexts = (items?: FilterOptionItem[]) => (items ?? []).map((o) => o.id);

/**
 * Botón "Filtros" de la matriz. Todas las categorías son multi: el API recibe
 * cada lista separada por coma. Ejecutivo viaja por correo; coordinador,
 * mercado, KAM y KAM líder, por el valor canónico que devuelve
 * /invoice/incident-list/filters.
 */
export default function ModalFilterMatrix({ value, onChange }: ModalFilterMatrixProps) {
  const { filters, isLoading: isLoadingFilters } = useIncidentListFilters();
  const { data: motives, isLoading: isLoadingMotives } = useInvoiceIncidentMotives();

  const coordinadorOptions = canonicalOptions(filters?.coordinator);
  const mercadoOptions = canonicalOptions(filters?.market);
  const kamOptions = canonicalOptions(filters?.kam);
  const kamLiderOptions = canonicalOptions(filters?.kam_lider);
  // El id es el correo: es lo que el filtro `executive` espera de vuelta.
  const ejecutivoOptions: FilterOptionItem[] = (filters?.executive ?? []).map((e) => ({
    id: e.email,
    name: e.name
  }));
  const estadoOptions = MATRIX_STATUS_OPTIONS;
  const tipoNovedadOptions = toOptions(motives);

  const selection: FilterSelection = {
    coordinador: many(value.coordinator, coordinadorOptions),
    mercado: many(value.market, mercadoOptions),
    kam: many(value.kam, kamOptions),
    kamLider: many(value.kam_lider, kamLiderOptions),
    ejecutivo: many(value.executive, ejecutivoOptions),
    estado: many(value.status, estadoOptions),
    tipoNovedad: many(value.noveltyType, tipoNovedadOptions)
  };

  const selectionToDomain = (sel: FilterSelection): IWalletMatrixModalFilters => ({
    coordinator: toTexts(sel.coordinador),
    market: toTexts(sel.mercado),
    kam: toTexts(sel.kam),
    kam_lider: toTexts(sel.kamLider),
    executive: toTexts(sel.ejecutivo),
    status: toTexts(sel.estado),
    noveltyType: toNumbers(sel.tipoNovedad)
  });

  const status = (loading: boolean): Loading => (loading ? "loading" : undefined);
  const filtersStatus = status(isLoadingFilters);

  const categories: FilterCategoryConfig[] = [
    {
      key: "coordinador",
      label: "Coordinador",
      options: coordinadorOptions,
      status: filtersStatus
    },
    {
      key: "mercado",
      label: "Mercado",
      options: mercadoOptions,
      status: filtersStatus
    },
    {
      key: "kam",
      label: "KAM",
      options: kamOptions,
      status: filtersStatus
    },
    {
      key: "kamLider",
      label: "KAM líder",
      options: kamLiderOptions,
      status: filtersStatus
    },
    {
      key: "ejecutivo",
      label: "Ejecutivo",
      options: ejecutivoOptions,
      status: filtersStatus
    },
    { key: "estado", label: "Estado", options: estadoOptions },
    {
      key: "tipoNovedad",
      label: "Tipo de novedad",
      options: tipoNovedadOptions,
      status: status(isLoadingMotives)
    }
  ];

  return (
    <FilterModal
      categories={categories}
      value={selection}
      trigger={{ className: TRIGGER_CLASS }}
      formatTagValue={(_cat, items) =>
        items.length === 1 ? items[0].name : `${items.length} seleccionados`
      }
      onApply={(sel) => onChange(selectionToDomain(sel))}
      onValueChange={(sel) => onChange(selectionToDomain(sel))}
      onClearAll={() => onChange(EMPTY_MATRIX_MODAL_FILTERS)}
    />
  );
}
