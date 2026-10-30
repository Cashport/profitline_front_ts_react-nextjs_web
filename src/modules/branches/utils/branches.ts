import type { FilterSelection } from "@/components/ui/filter-modal";
import type { IBranch, IBranchApiRow, IBranchesFilters } from "@/types/branches/IBranches";

import { FILTER_CATEGORIES, NO_ADDRESS, PRICE_LIST_PALETTE } from "../constants";

/** Sin tildes ni mayúsculas: "bogota" encuentra "BOGOTÁ". */
export const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export const formatPrice = (value: number) => `$ ${value.toLocaleString("es-CO")}`;

/** "Luisa Fernanda Gil" → "LF". */
export const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

export const fmtUpdatedAt = (iso: string) => {
  const date = new Date(iso);
  const time = date.toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
  const isToday = date.toDateString() === new Date().toDateString();
  return isToday
    ? `hoy ${time}`
    : `${date.toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit" })} ${time}`;
};

/** Mismo color para la misma lista en todas las pantallas: sale del nombre, no del orden. */
export const priceListColor = (name: string) => {
  // FNV-1a: reparte mejor que un hash simple, así nombres parecidos no caen en el mismo color.
  let hash = 0x811c9dc5;
  for (const char of normalize(name.trim())) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return PRICE_LIST_PALETTE[hash % PRICE_LIST_PALETTE.length];
};

/** Fila del API → sucursal del módulo. */
export const toBranch = (row: IBranchApiRow): IBranch => ({
  id: row.IdSucursalDevolucion,
  manager_branch_id: row.IdSucursalManager,
  client_name: row.NombreCliente,
  name: row.NombreSucursal,
  city: row.NombreMunicipio ?? "—",
  address: row.Direccion?.trim() || NO_ADDRESS,
  price_list: row.NombreListaPrecios ?? "Sin lista",
  base_price: Number(row.MontoMaximo ?? 0),
  is_active: row.Estado === "Activo"
});

/** Opciones del API → categorías del modal Filtros Avanzados. */
export const toFilterCategories = (filters?: IBranchesFilters) =>
  FILTER_CATEGORIES.map((cat) => ({
    key: cat.key,
    label: cat.label,
    options: (filters?.[cat.key] ?? []).map((o) => ({
      id: o.valor,
      name: o.valor,
      count: o.cantidad
    }))
  }));

/** Selección del modal → parámetros del API ("A,B,C"). */
export const toFilterParams = (filters: FilterSelection) =>
  Object.fromEntries(
    FILTER_CATEGORIES.map((cat) => [
      cat.key,
      filters[cat.key]?.length ? filters[cat.key].map((o) => o.id).join(",") : undefined
    ])
  );
