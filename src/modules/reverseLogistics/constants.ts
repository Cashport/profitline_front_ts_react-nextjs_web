import {
  CausalDevolucion,
  EstadoDevolucion,
  TipoAprobacion
} from "@/types/reverseLogistics/IReverseLogistics";

export const PAGE_SIZE = 25;

// /integration/profit360/approvals requires page/limit but answers with a plain
// array, so we pull one max-size page (the endpoint caps limit at 200) and let
// the table paginate it client-side at PAGE_SIZE.
export const APPROVALS_FETCH_LIMIT = 200;

// Profit360 idEstado for "Pendiente aprobación" — the estado the Aprobaciones tab
// defaults to, sent to the endpoint as `?status=`. It's a plain default, not a
// hard rule: the user can drop it or swap it from the filter modal.
export const ESTADO_PENDIENTE_APROBACION_ID = "607455C8-5788-41F3-A323-BFFE2BDF025A";

// Label for the estado above, used as the filter-tag fallback while the picklist
// is still loading so the tag never renders a bare GUID.
export const ESTADO_PENDIENTE_APROBACION_NOMBRE = "Pendiente aprobación";

// Colored pill styling per estado (bg + text), ported from the reference.
export const estadoConfig: Record<EstadoDevolucion, { bg: string; text: string }> = {
  "Visita programada": { bg: "#EFF6FF", text: "#1D4ED8" },
  "Visita en curso": { bg: "#DBEAFE", text: "#1E40AF" },
  "En aprobación": { bg: "#FEF9C3", text: "#854D0E" },
  "Demora de aprobación": { bg: "#FEE2E2", text: "#991B1B" },
  "Aprobado / Rechazado": { bg: "#F3E8FF", text: "#6B21A8" },
  "Red generada": { bg: "#DCFCE7", text: "#166534" },
  Recogido: { bg: "#CFFAFE", text: "#0E7490" },
  Entregado: { bg: "#D1FAE5", text: "#065F46" },
  "Movimiento Odoo": { bg: "#FFF7ED", text: "#9A3412" },
  "Contabilización de NC": { bg: "#F1F5F9", text: "#334155" }
};

export const ESTADO_OPTIONS: { value: EstadoDevolucion; label: string }[] = (
  Object.keys(estadoConfig) as EstadoDevolucion[]
).map((estado) => ({ value: estado, label: estado }));

export const CAUSAL_OPTIONS: { value: CausalDevolucion; label: string }[] = [
  { value: "Vencimiento", label: "Vencimiento" },
  {
    value: "Vencimiento fuera política sin reconocimiento NC",
    label: "Vencimiento fuera política sin reconocimiento NC"
  },
  { value: "Avería", label: "Avería" },
  { value: "Error en pedido", label: "Error en pedido" },
  { value: "Retiro voluntario", label: "Retiro voluntario" },
  { value: "Garantía", label: "Garantía" }
];

export const TIPO_APROBACION_OPTIONS: { value: TipoAprobacion; label: string }[] = [
  { value: "Fuera de politicas por fecha (01-vencimiento)", label: "Fuera de políticas fecha" },
  { value: "Causal con aprobación (04-Calidad)", label: "Causal con aprobación" },
  { value: "Supera el monto máximo", label: "Supera monto máximo" },
  { value: "Sin autorización de recogida", label: "Sin autorización recogida" }
];
