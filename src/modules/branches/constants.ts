import type { BranchesFilterKey } from "@/types/branches/IBranches";

export const BRANCHES_PATH = "/branches";

/** Sucursales por página de la tabla. */
export const PAGE_SIZE = 20;

/** Colores de las listas de precios: series y escala de mora de docs/DESIGN.md §1 (sólidos, nunca pasteles). */
export const PRICE_LIST_PALETTE = [
  "#1677ff",
  "#ff6a13",
  "#9bb514",
  "#7b3fe4",
  "#e0007a",
  "#0e9aa7",
  "#f5b700",
  "#2b4a5f",
  "#e5262b",
  "#a3004f",
  "#0b5bd3",
  "#6b0033"
];

export type BranchesSortKey = "client" | "branch" | "city" | "priceList" | "price" | "status";

/** Texto cuando la sucursal no tiene dirección en la base. */
export const NO_ADDRESS = "Dirección no registrada";
export type SortDir = 1 | -1;

/** Por defecto: cliente A–Z; dentro de cada cliente, municipio A–Z y luego sucursal A–Z. */
export const DEFAULT_SORT: { key: BranchesSortKey; dir: SortDir } = { key: "client", dir: 1 };

export const SORT_LABEL: Record<BranchesSortKey, string> = {
  client: "Cliente",
  branch: "Sucursal",
  city: "Municipio",
  priceList: "Lista de precios",
  price: "Precio base",
  status: "Estado"
};

/** Categorías del modal Filtros Avanzados; la clave es el parámetro que recibe el API. */
export const FILTER_CATEGORIES: { key: BranchesFilterKey; label: string }[] = [
  { key: "clientes", label: "Cliente" },
  { key: "municipios", label: "Municipio" },
  { key: "listas", label: "Lista de precios" },
  { key: "estados", label: "Estado" }
];
