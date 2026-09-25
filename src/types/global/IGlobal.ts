export type CountryCode = "en" | "eur" | "jpn" | "ch" | "kr" | "es" | "co";

export type Pagination = {
  actualPage: number;
  rowsperpage: number;
  totalPages: number;
  totalRows: number;
  rowsPerPage?: number;
};

// Paginación estándar con formato page/limit/total/pages
export type PaginationSimple = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export interface GenericResponsePage<T = any> {
  status: number;
  message: string;
  success?: boolean;
  data: T;
  pagination: Pagination;
}

// Respuesta genérica con paginación simple (page, limit, total, pages)
export interface GenericResponsePaginated<T = any> {
  success: boolean;
  data: T;
  pagination: PaginationSimple;
}

export interface GenericResponse<T = any> {
  status: number;
  message: string;
  success?: boolean;
  data: T;
}
