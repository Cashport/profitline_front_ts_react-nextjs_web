"use client";

import { FilterModal } from "@/components/ui/filter-modal";
import type {
  FilterCategoryConfig,
  FilterOptionItem,
  FilterSelection
} from "@/components/ui/filter-modal";
import { useBusinessRulesCatalog } from "@/hooks/useBusinessRules";
import { useClientsGroupsSimplified } from "@/hooks/useClientsGroupsSimplified";
import { useHolding } from "@/hooks/useHolding";
import { useInvoiceIncidentMotives } from "@/hooks/useInvoiceIncidentMotives";
import { useZone } from "@/hooks/useZone";
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

/** Selección de una categoría multi a partir de los ids confirmados. */
const many = (ids: Array<string | number>, options: FilterOptionItem[]): FilterOptionItem[] =>
  ids.map((id) => {
    const key = String(id);
    return { id: key, name: options.find((o) => o.id === key)?.name ?? key };
  });

/** Selección de una categoría "single" a partir del valor confirmado. */
const single = (id: string | null, options: FilterOptionItem[]): FilterOptionItem[] =>
  id ? [{ id, name: options.find((o) => o.id === id)?.name ?? id }] : [];

const toNumbers = (items?: FilterOptionItem[]) => (items ?? []).map((o) => Number(o.id));
const toTexts = (items?: FilterOptionItem[]) => (items ?? []).map((o) => o.id);
const toText = (items?: FilterOptionItem[]) => items?.[0]?.id ?? null;

/**
 * Botón "Filtros" de la matriz. Las listas son multi porque el API las
 * recibe separadas por coma; coordinador y mercado son de un solo valor
 * canónico, el mismo que devuelve /invoice/incident-list/filters.
 */
export default function ModalFilterMatrix({ value, onChange }: ModalFilterMatrixProps) {
  const { filters, isLoading: isLoadingFilters } = useIncidentListFilters();
  const { data: motives, isLoading: isLoadingMotives } = useInvoiceIncidentMotives();
  const { data: zones, isLoading: isLoadingZones } = useZone();
  const { channels, lines, sublines, isLoading: isLoadingBR } = useBusinessRulesCatalog();
  const { data: holdings, isLoading: isLoadingHoldings } = useHolding();
  const { data: groups, loading: isLoadingGroups } = useClientsGroupsSimplified();

  const canonicalOptions = (items?: { canonical: string }[]): FilterOptionItem[] =>
    (items ?? []).map((c) => ({ id: c.canonical, name: c.canonical }));

  const coordinadorOptions = canonicalOptions(filters?.coordinator);
  const mercadoOptions = canonicalOptions(filters?.market);
  const estadoOptions = MATRIX_STATUS_OPTIONS;
  const tipoNovedadOptions = toOptions(motives);
  const zonaOptions = toOptions(zones?.data.map((z) => ({ id: z.ID, name: z.ZONE_DESCRIPTION })));
  const canalOptions = toOptions(channels);
  const lineaOptions = toOptions(lines);
  const sublineaOptions = toOptions(sublines);
  const holdingOptions = toOptions(holdings?.data);
  const grupoOptions = toOptions(groups?.map((g) => ({ id: g.id, name: g.group_name })));

  const selection: FilterSelection = {
    coordinador: single(value.coordinator, coordinadorOptions),
    mercado: single(value.market, mercadoOptions),
    estado: many(value.status, estadoOptions),
    tipoNovedad: many(value.noveltyType, tipoNovedadOptions),
    zona: many(value.zones, zonaOptions),
    canal: many(value.channels, canalOptions),
    linea: many(value.lines, lineaOptions),
    sublinea: many(value.sublines, sublineaOptions),
    holding: many(value.holdings, holdingOptions),
    grupo: many(value.clientGroup, grupoOptions)
  };

  const selectionToDomain = (sel: FilterSelection): IWalletMatrixModalFilters => ({
    coordinator: toText(sel.coordinador),
    market: toText(sel.mercado),
    status: toTexts(sel.estado),
    noveltyType: toNumbers(sel.tipoNovedad),
    zones: toNumbers(sel.zona),
    channels: toNumbers(sel.canal),
    lines: toNumbers(sel.linea),
    sublines: toNumbers(sel.sublinea),
    holdings: toNumbers(sel.holding),
    clientGroup: toNumbers(sel.grupo)
  });

  const status = (loading: boolean): Loading => (loading ? "loading" : undefined);
  const filtersStatus = status(isLoadingFilters);
  const brStatus = status(isLoadingBR);

  const categories: FilterCategoryConfig[] = [
    {
      key: "coordinador",
      label: "Coordinador",
      selectMode: "single",
      options: coordinadorOptions,
      status: filtersStatus
    },
    {
      key: "mercado",
      label: "Mercado",
      selectMode: "single",
      options: mercadoOptions,
      status: filtersStatus
    },
    { key: "estado", label: "Estado", options: estadoOptions },
    {
      key: "tipoNovedad",
      label: "Tipo de novedad",
      options: tipoNovedadOptions,
      status: status(isLoadingMotives)
    },
    { key: "zona", label: "Zona", options: zonaOptions, status: status(isLoadingZones) },
    { key: "canal", label: "Canal", options: canalOptions, status: brStatus },
    { key: "linea", label: "Línea", options: lineaOptions, status: brStatus },
    { key: "sublinea", label: "Sublínea", options: sublineaOptions, status: brStatus },
    {
      key: "holding",
      label: "Holding",
      options: holdingOptions,
      status: status(isLoadingHoldings)
    },
    {
      key: "grupo",
      label: "Grupo de clientes",
      options: grupoOptions,
      status: status(isLoadingGroups)
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
