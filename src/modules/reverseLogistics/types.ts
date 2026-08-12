import { TipoAprobacion } from "@/types/reverseLogistics/IReverseLogistics";

// Devoluciones tab filter — every field is a real query param of
// GET /integration/profit360/visits. `clientId` is single-valued because the
// endpoint takes one. Estado is not a query param there, so it isn't offered.
export interface IDevolucionesFilter {
  clientId: string | null;
  fromDate: string | null;
  toDate: string | null;
}

// Aprobaciones tab filter. `clientId` / `fromDate` / `toDate` are query params of
// GET /integration/profit360/approvals (same set as /visits); `tipos` and
// `ciudades` have no backend equivalent and are applied client-side over the
// list the endpoint returns.
export interface IAprobacionesFilter {
  clientId: string | null;
  fromDate: string | null;
  toDate: string | null;
  tipos: TipoAprobacion[];
  ciudades: string[];
}
