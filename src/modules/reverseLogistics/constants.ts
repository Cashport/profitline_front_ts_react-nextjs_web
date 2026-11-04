import {
  CausalDevolucion,
  DevolucionesEstados,
  EstadoDevolucion,
  TipoAprobacion,
  TipoDevolucionCodigo
} from "@/types/reverseLogistics/IReverseLogistics";
import { getTranslator } from "@/i18n/translator";

export const PAGE_SIZE = 25;

// /integration/profit360/approvals requires page/limit but answers with a plain
// array, so we pull one max-size page (the endpoint caps limit at 200) and let
// the table paginate it client-side at PAGE_SIZE.
export const APPROVALS_FETCH_LIMIT = 200;

// Profit360 idEstado for "Pendiente aprobación" — the estado the Aprobaciones tab
// defaults to, sent to the endpoint as `?status=`. It's a plain default, not a
// hard rule: the user can drop it or swap it from the filter modal.
export const ESTADO_PENDIENTE_APROBACION_ID = "607455C8-5788-41F3-A323-BFFE2BDF025A";

// The filter-tag fallback label for the estado above (shown while the picklist is
// still loading so the tag never renders a bare GUID) is `reverseLogistics.filters.pendingApproval`.

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

export const ESTADO_OPTIONS: { value: EstadoDevolucion; label: EstadoDevolucion }[] = (
  Object.keys(estadoConfig) as EstadoDevolucion[]
).map((estado) => ({ value: estado, label: estado }));

export const CAUSAL_OPTIONS: { value: CausalDevolucion; label: CausalDevolucion }[] = [
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

// `value` is the backend tipo (compared against the approvals payload); `labelKey`
// is the short label in `reverseLogistics.approvalTypes`.
export const TIPO_APROBACION_OPTIONS: {
  value: TipoAprobacion;
  labelKey:
    | "outOfPolicyDate"
    | "reasonNeedsApproval"
    | "exceedsMaxAmount"
    | "noPickupAuthorization";
}[] = [
  { value: "Fuera de politicas por fecha (01-vencimiento)", labelKey: "outOfPolicyDate" },
  { value: "Causal con aprobación (04-Calidad)", labelKey: "reasonNeedsApproval" },
  { value: "Supera el monto máximo", labelKey: "exceedsMaxAmount" },
  { value: "Sin autorización de recogida", labelKey: "noPickupAuthorization" }
];

// Catalog keys (`reverseLogistics.phases`) of the short labels for the devolucion
// fase codigos. Used by the stats bar KPI cards and by the Devoluciones tab to
// render the highest fase as the estado.
export const FASE_LABEL_KEYS: Record<
  TipoDevolucionCodigo,
  "logistics" | "transport" | "warehouse" | "creditMemo"
> = {
  F1_LOGISTICA: "logistics",
  F2_SOLISTICA: "transport",
  F3_SUPPLA: "warehouse",
  F4_NOTA_CREDITO: "creditMemo"
};

// Orden de mayor a menor — F4 (Nota Crédito) es la fase más avanzada y siempre
// debe ganar contra F3/F2/F1 cuando la devolución ya pasó por varias.
export const FASE_PRIORITY: TipoDevolucionCodigo[] = [
  TipoDevolucionCodigo.F4_NOTA_CREDITO,
  TipoDevolucionCodigo.F3_SUPPLA,
  TipoDevolucionCodigo.F2_SOLISTICA,
  TipoDevolucionCodigo.F1_LOGISTICA
];

// Devuelve el código de la fase más alta registrada en `fases`. Devuelve
// `undefined` si la lista está vacía o no trae ninguno de los F1..F4.
export const highestFaseCode = (
  fases?: DevolucionesEstados[]
): TipoDevolucionCodigo | undefined => {
  if (!fases || fases.length === 0) return undefined;
  const codes = new Set(fases.map((f) => f.Codigo));
  return FASE_PRIORITY.find((code) => codes.has(code));
};

// Helper de UI: combina las dos anteriores. Devuelve el label legible (ej:
// "Nota Crédito") o `null` si no hay fases válidas.
export const highestFaseLabel = (fases?: DevolucionesEstados[]): string | null => {
  const code = highestFaseCode(fases);
  return code ? getTranslator("reverseLogistics")(`phases.${FASE_LABEL_KEYS[code]}`) : null;
};
