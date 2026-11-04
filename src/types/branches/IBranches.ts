/* Sucursales de devolución. El listado viene del API (front → back → pharma 360,
   GET /integration/profit360/branches); el detalle y sus usuarios aún son datos
   simulados (src/modules/branches/mocked-data.ts). Precios en pesos. */

/** Sucursal de devolución de un cliente. Un cliente tiene muchas sucursales. */
export interface IBranch {
  id: string;
  /** El listado del API no lo trae; solo los datos simulados del detalle. */
  client_id?: string;
  /** Número de la sucursal en manager. */
  manager_branch_id?: number | null;
  /** Lo que va al final de la URL del detalle: el número de manager o, si falta o se repite, un GUID. */
  url_id: string;
  client_name: string;
  /** El listado del API aún no lo trae; solo los datos simulados del detalle. */
  client_nit?: string;
  name: string;
  city: string;
  address: string;
  /** Monto máximo por factura (documento) de devolución: el mayor entre sus listas. */
  base_price: number;
  /** Listas de precios de la sucursal física (A–Z), cada una con su monto máximo por factura. */
  price_limits: { list: string; amount: number }[];
  is_active: boolean;
}

/** Fila tal cual la devuelve GET /integration/profit360/branches. */
export interface IBranchApiRow {
  /** Uno de los registros de la sucursal física; no se muestra en la tabla. */
  IdSucursalDevolucion: string;
  /** Número de la sucursal en manager. */
  IdSucursalManager?: number | null;
  /** Id para la URL del detalle (número de manager o GUID); solo lo trae el listado. */
  IdUrl?: string;
  /** Nombre de la empresa en manager.Clientes. */
  NombreCliente: string;
  NombreSucursal: string;
  NombreMunicipio: string | null;
  Direccion: string | null;
  /** La sucursal física agrupa un registro por lista de precios: aquí van todas. */
  ListasPrecios: string[] | null;
  /** Cada lista guarda su propio monto máximo por factura. */
  MontosPorLista?: { ListaPrecios: string | null; MontoMaximo: number | null }[];
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
  sortField?: "client" | "branch" | "city" | "price" | "status";
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

/** Fila de GET /integration/profit360/branches/AllUsers: usuario que se puede asignar. */
export interface IBranchAssignableUserApi {
  IdUsuario: string;
  NombreUsuario: string;
  CorreoUsuario: string | null;
}

/** Respuesta de POST /integration/profit360/branches/AddUsers. */
export interface IBranchAddUsersResult {
  NombreSucursal: string;
  /** Insertados o reactivados. */
  added: { IdUsuario: string; NombreUsuario: string }[];
  /** Ya estaban activos en la sucursal: no se tocaron. */
  alreadyAssigned: { IdUsuario: string; NombreUsuario: string }[];
  /** Ids que no existen en manager.Usuarios. */
  notFound: string[];
}

/** Respuesta de PUT /integration/profit360/branches/RemoveUsers. */
export interface IBranchRemoveUsersResult {
  NombreSucursal: string;
  /** Desvinculados (quedan inactivos, no se borran). */
  removed: { IdUsuario: string; NombreUsuario: string }[];
  /** No estaban vinculados a la sucursal: no se tocaron. */
  notAssigned: { IdUsuario: string; NombreUsuario: string }[];
  /** Ids que no existen en manager.Usuarios. */
  notFound: string[];
}

/** Respuesta de GET /integration/profit360/branches/registeredUsers?id=<IdSucursalDevolucion>. */
export interface IBranchRegisteredUsersApi {
  branch: IBranchApiRow;
  /** Si en este proyecto se pueden agregar y quitar usuarios. */
  PuedeEditar?: boolean;
  users: { IdUsuario: string; NombreEjecutivo: string; CorreoEjecutivo: string | null }[];
}

/** Detalle de una sucursal: su información y los usuarios asignados. */
export interface IBranchDetail {
  branch: IBranch;
  users: IBranchUser[];
  /** false: el proyecto es de solo lectura, no se muestran agregar ni eliminar. */
  canEdit: boolean;
}
