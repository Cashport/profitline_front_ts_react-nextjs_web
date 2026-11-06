import type { FilterSelection } from "@/components/ui/filter-modal";
import type { IBranch, IBranchApiRow, IBranchesFilters } from "@/types/branches/IBranches";

import { BRANCHES_PATH, FILTER_CATEGORIES, NO_ADDRESS, PRICE_LIST_PALETTE } from "../constants";

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
  manager_branch_id: row.IdSucursalManager ?? null,
  url_id: row.IdUrl ?? String(row.IdSucursalManager ?? row.IdSucursalDevolucion),
  client_name: row.NombreCliente,
  name: row.NombreSucursal,
  city: row.NombreMunicipio ?? "—",
  address: row.Direccion?.trim() || NO_ADDRESS,
  base_price: Number(row.MontoMaximo ?? 0),
  price_limits: row.MontosPorLista?.length
    ? row.MontosPorLista.map((m) => ({
        list: m.ListaPrecios ?? "Sin lista",
        amount: Number(m.MontoMaximo ?? 0)
      }))
    : [{ list: "Sin lista", amount: Number(row.MontoMaximo ?? 0) }],
  is_active: row.Estado === "Activo"
});

/** "AUDIFARMA SA" → "audifarma-sa": sin tildes, minúsculas y guiones. */
const slugify = (text: string) =>
  normalize(text)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

/**
 * URL del detalle: cliente, municipio y el número de la sucursal en manager
 * (/branches/audifarma-sa-bogota-5936). Solo el final identifica la sucursal; si no tiene
 * número o se repite en el proyecto, el final es el GUID de uno de sus registros.
 */
export const branchHref = (branch: IBranch) => {
  const slug = [branch.client_name, branch.city === "—" ? "" : branch.city]
    .map(slugify)
    .filter(Boolean)
    .join("-");
  return `${BRANCHES_PATH}/${slug ? `${slug}-` : ""}${branch.url_id}`;
};

/** Id de la sucursal desde el final de la URL (GUID o número); `null` si no trae uno válido. */
export const branchIdFromSlug = (slug: string) => {
  const text = decodeURIComponent(slug ?? "");
  const guid = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.exec(text);
  if (guid) return guid[0];
  const numero = /(?:^|-)(\d+)$/.exec(text);
  return numero && Number(numero[1]) > 0 ? numero[1] : null;
};

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
