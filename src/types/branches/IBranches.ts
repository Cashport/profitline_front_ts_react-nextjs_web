/* Sucursales de devolución. El listado viene del API (front → back → pharma 360,
   GET /integration/profit360/branches); el detalle y sus usuarios aún son datos
   simulados (src/modules/branches/mocked-data.ts). Precios en pesos. */

/** Sucursal de devolución de un cliente. Un cliente tiene muchas sucursales. */
export interface IBranch {
  id: string;
  /** El listado del API no lo trae; solo los datos simulados del detalle. */
  client_id?: string;
  /** Id de la sucursal en manager; no se muestra en la tabla. */
  manager_branch_id?: string | null;
  client_name: string;
  /** El listado del API aún no lo trae; solo los datos simulados del detalle. */
  client_nit?: string;
  name: string;
  city: string;
  address: string;
  /** Nombre de la lista de precios (tabla logistica.ListasDePrecios). */
  price_list: string;
  base_price: number;
  is_active: boolean;
}

/** Fila tal cual la devuelve GET /integration/profit360/branches. */
export interface IBranchApiRow {
  /** Se usa para abrir el detalle (ojito); no se muestra en la tabla. */
  IdSucursalDevolucion: string;
  /** Sucursal en manager; tampoco se muestra en la tabla. */
  IdSucursalManager?: string | null;
  /** Nombre de la empresa en manager.Clientes. */
  NombreCliente: string;
  NombreSucursal: string;
  NombreMunicipio: string | null;
  Direccion: string | null;
  NombreListaPrecios: string | null;
  MontoMaximo: number | null;
  Estado: "Activo" | "Inactivo";
}

/** Respuesta paginada de GET /integration/profit360/branches. */
export interface IBranchesApiResponse {
  status: number;
  message: string;
  data: IBranchApiRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  /** Clientes distintos entre las sucursales que cumplen la búsqueda y los filtros. */
  totalClients?: number;
}

/** Parámetros de GET /integration/profit360/branches. Las listas van separadas por coma. */
export interface IBranchesQuery {
  page: number;
  limit: number;
  search?: string;
  clientes?: string;
  municipios?: string;
  listas?: string;
  estados?: string;
  sortField?: "client" | "branch" | "city" | "priceList" | "price" | "status";
  sortOrder?: "ASC" | "DESC";
}

/** Opciones del cuadro de filtros (GET /integration/profit360/branches/filters). */
export type BranchesFilterKey = "clientes" | "municipios" | "listas" | "estados";
export type IBranchesFilters = Record<BranchesFilterKey, { valor: string; cantidad: number }[]>;

/** Usuario registrado que se puede asignar a una sucursal. */
export interface IBranchUser {
  id: string;
  name: string;
  email: string;
  /** Cargo; los ejecutivos del API aún no lo traen. */
  role?: string;
}

/** Respuesta de GET /integration/profit360/branches/registeredUsers?id=<IdSucursalDevolucion>. */
export interface IBranchRegisteredUsersApi {
  branch: IBranchApiRow;
  users: { IdUsuario: string; NombreEjecutivo: string; CorreoEjecutivo: string | null }[];
}

/** Detalle de una sucursal: su información y los usuarios asignados. */
export interface IBranchDetail {
  branch: IBranch;
  users: IBranchUser[];
}
