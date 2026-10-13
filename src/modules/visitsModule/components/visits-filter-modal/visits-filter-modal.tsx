"use client";

import type { ReactNode } from "react";

import { FilterModal } from "@/components/ui/filter-modal";
import type {
  FilterCategoryConfig,
  FilterOptionItem,
  FilterSelection
} from "@/components/ui/filter-modal";

import {
  EMPTY_VISITS_FILTERS,
  OPERATION_LABELS,
  OPERATION_ORDER,
  PROJECT_ORDER,
  PROJECTS,
  RESULT_LABELS,
  RESULT_ORDER,
  STATUS_LABELS,
  STATUS_ORDER
} from "../../constants";
import type {
  AdvisorProject,
  AdvisorStatus,
  IVisitsClient,
  IVisitsFilters,
  IVisitsZone,
  OperationType,
  VisitResult
} from "../../types";

/** Misma superficie que el botón de tema y el buscador, a la misma altura. */
const TRIGGER_CLASS =
  "flex h-12 shrink-0 items-center gap-2 rounded-lg border border-border bg-card px-4 text-foreground transition-colors hover:bg-secondary";

interface VisitsFilterModalProps {
  value: IVisitsFilters;
  onChange: (next: IVisitsFilters) => void;
  advisors: { id: number; name: string }[];
  zones: IVisitsZone[];
  /** Clientes con visita programada en el día. */
  clients: IVisitsClient[];
  /** Contenido al final de la barra del botón y sus etiquetas (chips de estado, reloj). */
  barEnd?: ReactNode;
}

/** Selección de una categoría multi a partir de los ids confirmados. */
const many = (ids: Array<string | number>, options: FilterOptionItem[]): FilterOptionItem[] =>
  ids.map((id) => {
    const key = String(id);
    return { id: key, name: options.find((o) => o.id === key)?.name ?? key };
  });

const toTexts = (items?: FilterOptionItem[]) => (items ?? []).map((o) => o.id);
const toNumbers = (items?: FilterOptionItem[]) => (items ?? []).map((o) => Number(o.id));

const byName = (a: FilterOptionItem, b: FilterOptionItem) => a.name.localeCompare(b.name);

/**
 * Botón "Filtrar" de Visitas sobre el FilterModal compartido. Todas las
 * categorías son multi (OR dentro, AND entre). Estado comparte la selección con
 * los chips de estado de la barra, como los chips de la matriz de Cartera. La
 * fecha no es una categoría: la elige el navegador de días del encabezado.
 */
export default function VisitsFilterModal({
  value,
  onChange,
  advisors,
  zones,
  clients,
  barEnd
}: VisitsFilterModalProps) {
  const proyectoOptions: FilterOptionItem[] = PROJECT_ORDER.map((p) => ({
    id: p,
    name: PROJECTS[p].name
  }));
  const operacionOptions: FilterOptionItem[] = OPERATION_ORDER.map((o) => ({
    id: o,
    name: OPERATION_LABELS[o]
  }));
  const zonaOptions: FilterOptionItem[] = zones.map((z) => ({ id: z.id, name: z.name }));
  const ciudadOptions: FilterOptionItem[] = Array.from(new Set(zones.map((z) => z.city))).map(
    (c) => ({ id: c, name: c })
  );
  const asesorOptions: FilterOptionItem[] = advisors
    .map((a) => ({ id: String(a.id), name: a.name }))
    .sort(byName);
  const clienteOptions: FilterOptionItem[] = clients
    .map((c) => ({ id: String(c.id), name: c.name }))
    .sort(byName);
  const estadoOptions: FilterOptionItem[] = STATUS_ORDER.map((s) => ({
    id: s,
    name: STATUS_LABELS[s]
  }));
  const resultadoOptions: FilterOptionItem[] = RESULT_ORDER.map((r) => ({
    id: r,
    name: RESULT_LABELS[r]
  }));

  const selection: FilterSelection = {
    proyecto: many(value.project, proyectoOptions),
    operacion: many(value.operation, operacionOptions),
    zona: many(value.zone, zonaOptions),
    ciudad: many(value.city, ciudadOptions),
    asesor: many(value.advisor, asesorOptions),
    cliente: many(value.client, clienteOptions),
    estado: many(value.status, estadoOptions),
    resultado: many(value.result, resultadoOptions)
  };

  const selectionToDomain = (sel: FilterSelection): IVisitsFilters => ({
    project: toTexts(sel.proyecto) as AdvisorProject[],
    operation: toTexts(sel.operacion) as OperationType[],
    zone: toTexts(sel.zona),
    city: toTexts(sel.ciudad),
    advisor: toNumbers(sel.asesor),
    client: toNumbers(sel.cliente),
    status: toTexts(sel.estado) as AdvisorStatus[],
    result: toTexts(sel.resultado) as VisitResult[]
  });

  const categories: FilterCategoryConfig[] = [
    { key: "proyecto", label: "Proyecto", options: proyectoOptions },
    { key: "operacion", label: "Tipo de operación", options: operacionOptions },
    { key: "zona", label: "Zona", options: zonaOptions },
    { key: "ciudad", label: "Ciudad", options: ciudadOptions },
    { key: "asesor", label: "Asesor", options: asesorOptions },
    { key: "cliente", label: "Cliente", options: clienteOptions },
    { key: "estado", label: "Estado", options: estadoOptions },
    { key: "resultado", label: "Resultado", options: resultadoOptions }
  ];

  return (
    <FilterModal
      categories={categories}
      value={selection}
      trigger={{ label: "Filtrar", className: TRIGGER_CLASS, showChevron: true }}
      formatTagValue={(_cat, items) =>
        items.length === 1 ? items[0].name : `${items.length} seleccionados`
      }
      onApply={(sel) => onChange(selectionToDomain(sel))}
      onValueChange={(sel) => onChange(selectionToDomain(sel))}
      onClearAll={() => onChange(EMPTY_VISITS_FILTERS)}
      barEnd={barEnd}
    />
  );
}
