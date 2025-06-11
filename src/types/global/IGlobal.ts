export type CountryCode = "en" | "eur" | "jpn" | "ch" | "kr" | "es" | "co";

export type Pagination = {
  actualPage: number;
  rowsperpage: number;
  totalPages: number;
  totalRows: number;
  rowsPerPage: number;
};

export interface GenericResponsePage<T = any> {
  status: number;
  message: string;
  success?: boolean;
  data: T;
  pagination: Pagination;
}
export interface GenericResponse<T = any> {
  status: number;
  message: string;
  success?: boolean;
  data: T;
}
