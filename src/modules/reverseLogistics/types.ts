import { TipoAprobacion } from "@/types/reverseLogistics/IReverseLogistics";

// Devoluciones tab filter — every field is a real query param of
// GET /integration/profit360/visits and the endpoint takes a single value for
// each. `clientId`, `fromDate` and `toDate` are the long-standing filters;
// `estadoId` maps to ?status= and `causalId` maps to ?causal=.
export interface IDevolucionesFilter {
  clientId: string | null;
  estadoId: string | null;
  causalId: string | null;
  fromDate: string | null;
  toDate: string | null;
}

// Aprobaciones tab filter. `clientId` / `status` / `fromDate` / `toDate` are query
// params of GET /integration/profit360/approvals; `tipos` and `ciudades` have no
// backend equivalent and are applied client-side over the list the endpoint returns.
export interface IAprobacionesFilter {
  clientId: string | null;
  // Profit360 estado `codigo` (GUID) — sent as ?status=, single-valued.
  status: string | null;
  fromDate: string | null;
  toDate: string | null;
  tipos: TipoAprobacion[];
  ciudades: string[];
}
