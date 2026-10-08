/* Filtros de la torre: cascadas gerencia → coordinador → ejecutivo, clic en
   filas agrupadas y chips de filtros activos. Port de estado.jsx y de los
   handlers del panel de filtros del prototipo. */
import type {
  ICollectionTower,
  ITowerCatalogItem,
  ITowerCatalogs,
  ITowerClient,
  ITowerCoordinator,
  ITowerExecutive
} from "@/types/collectionTower/ICollectionTower";
import type { Grouping, TowerFilters } from "../types";
import { WEEKDAYS, fechaCorta, weekdayOf } from "./format";

export interface CatalogIndex {
  managements: Map<string, ITowerCatalogItem>;
  coordinators: Map<string, ITowerCoordinator>;
  executives: Map<string, ITowerExecutive>;
  channels: Map<string, ITowerCatalogItem>;
  clients: Map<string, ITowerClient>;
}

const byId = <T extends { id: string }>(list: T[]) => new Map(list.map((x) => [x.id, x]));

const cache = new WeakMap<ITowerCatalogs, CatalogIndex>();

/** Catálogos indexados por id; se arman una vez por respuesta. */
export const indexCatalogs = (catalogs: ITowerCatalogs): CatalogIndex => {
  let ix = cache.get(catalogs);
  if (!ix) {
    ix = {
      managements: byId(catalogs.managements),
      coordinators: byId(catalogs.coordinators),
      executives: byId(catalogs.executives),
      channels: byId(catalogs.channels),
      clients: byId(catalogs.clients)
    };
    cache.set(catalogs, ix);
  }
  return ix;
};

export const coordinatorOf = (ix: CatalogIndex, executiveId: string) =>
  ix.executives.get(executiveId)?.coordinatorId ?? "";

export const managementOf = (ix: CatalogIndex, coordinatorId: string) =>
  ix.coordinators.get(coordinatorId)?.managementId ?? "";

/* ---------- cascadas del panel de filtros ---------- */

/** Gerencia: suelta coordinador y ejecutivo si no son de esa gerencia. */
export const managementPatch = (
  f: TowerFilters,
  management: string | null,
  ix: CatalogIndex
): Partial<TowerFilters> => ({
  management,
  coordinator:
    f.coordinator && management && managementOf(ix, f.coordinator) !== management
      ? null
      : f.coordinator,
  executive:
    f.executive && management && managementOf(ix, coordinatorOf(ix, f.executive)) !== management
      ? null
      : f.executive
});

/** Coordinador: fija su gerencia y suelta el ejecutivo si no es suyo. */
export const coordinatorPatch = (
  f: TowerFilters,
  coordinator: string | null,
  ix: CatalogIndex
): Partial<TowerFilters> => ({
  coordinator,
  management: coordinator ? managementOf(ix, coordinator) || null : f.management,
  executive:
    f.executive && coordinator && coordinatorOf(ix, f.executive) !== coordinator
      ? null
      : f.executive
});

/** Ejecutivo: fija su coordinador y su gerencia. */
export const executivePatch = (
  executive: string | null,
  ix: CatalogIndex
): Partial<TowerFilters> => {
  if (!executive) return { executive: null };
  const coordinator = coordinatorOf(ix, executive);
  return {
    executive,
    coordinator: coordinator || null,
    management: managementOf(ix, coordinator) || null
  };
};

/* ---------- clic en filas agrupadas ---------- */

/** Fila de una tabla agrupada: `id` del grupo y `name` (por cliente se filtra por nombre). */
export interface DimensionRow {
  id: string;
  name: string;
}

/** Clic en una fila: filtra todo el tablero por esa dimensión, o quita el filtro si ya estaba. */
export const dimensionPatch = (
  f: TowerFilters,
  by: Grouping,
  row: DimensionRow,
  ix: CatalogIndex
): Partial<TowerFilters> => {
  if (by === "client") return { search: f.search === row.name ? "" : row.name };
  if (by === "executive") return f.executive === row.id ? { executive: null } : executivePatch(row.id, ix);
  if (by === "channel") return { channel: f.channel === row.id ? null : row.id };
  return f.coordinator === row.id ? { coordinator: null } : coordinatorPatch(f, row.id, ix);
};

/** ¿La fila es el filtro activo? */
export const isDimensionSelected = (f: TowerFilters, by: Grouping, row: DimensionRow) =>
  by === "client"
    ? f.search === row.name
    : by === "executive"
      ? f.executive === row.id
      : by === "channel"
        ? f.channel === row.id
        : f.coordinator === row.id;

/** Clientes al alcance de la gerencia, el coordinador y el ejecutivo elegidos: sugerencias del buscador. */
export const clientsInScope = (catalogs: ITowerCatalogs, f: TowerFilters) => {
  const ix = indexCatalogs(catalogs);
  return catalogs.clients.filter((c) => {
    const coordinator = coordinatorOf(ix, c.executiveId);
    return (
      (!f.executive || c.executiveId === f.executive) &&
      (!f.coordinator || coordinator === f.coordinator) &&
      (!f.management || managementOf(ix, coordinator) === f.management)
    );
  });
};

/** Sugerencias del buscador: el nombre (que es lo que filtra) y el NIT para buscar también por él. */
export const clientOptions = (catalogs: ITowerCatalogs, f: TowerFilters) =>
  clientsInScope(catalogs, f).map((c) => ({ value: c.name, nit: c.nit }));

/** AutoComplete de clientes: la sugerencia sale si el texto está en el nombre o en el NIT. */
export const matchesClient = (input: string, option?: { value?: unknown; nit?: string }) =>
  String(option?.value ?? "")
    .toLowerCase()
    .includes(input.toLowerCase()) || (option?.nit ?? "").includes(input);

/* ---------- chips ---------- */

export const activeFilterCount = (f: TowerFilters) =>
  [f.management, f.coordinator, f.executive, f.channel, f.search].filter(Boolean).length +
  (f.aging !== null ? 1 : 0) +
  (f.segments.length > 0 ? 1 : 0);

export interface FilterChip {
  key: string;
  label: string;
  value: string;
  remove: Partial<TowerFilters>;
}

/** Chips de los filtros activos, con nombres de los catálogos (o el id mientras llegan). */
export const filterChips = (f: TowerFilters, data?: ICollectionTower): FilterChip[] => {
  const ix = data ? indexCatalogs(data.catalogs) : null;
  const name = (map: keyof CatalogIndex, id: string) => ix?.[map].get(id)?.name ?? id;
  const chips: FilterChip[] = [];
  if (f.management) {
    chips.push({
      key: "management",
      label: "Gerencia",
      value: name("managements", f.management),
      remove: { management: null }
    });
  }
  if (f.coordinator) {
    chips.push({
      key: "coordinator",
      label: "Coordinador",
      value: name("coordinators", f.coordinator),
      remove: { coordinator: null }
    });
  }
  if (f.executive) {
    chips.push({
      key: "executive",
      label: "Ejecutivo",
      value: name("executives", f.executive),
      remove: { executive: null }
    });
  }
  if (f.channel) {
    chips.push({
      key: "channel",
      label: "Canal",
      value: name("channels", f.channel),
      remove: { channel: null }
    });
  }
  if (f.search) chips.push({ key: "search", label: "Cliente", value: f.search, remove: { search: "" } });
  if (f.aging !== null) {
    chips.push({
      key: "aging",
      label: "Tramo",
      value: data?.agingBuckets.find((b) => b.key === f.aging)?.label ?? f.aging,
      remove: { aging: null }
    });
  }
  if (f.segments.length) {
    const [s] = f.segments;
    const status = data?.agreementStatuses.find((x) => x.key === s.status)?.label;
    chips.push({
      key: "segments",
      label: "Acuerdos",
      value:
        f.segments.length === 1
          ? `${status ? `${status}s · ` : ""}${WEEKDAYS[weekdayOf(s.date)]} ${fechaCorta(s.date)}`
          : `${f.segments.length} segmentos`,
      remove: { segments: [] }
    });
  }
  return chips;
};
