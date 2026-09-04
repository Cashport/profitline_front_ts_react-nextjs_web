/* ============================================================
   DATOS SIMULADOS — SE REEMPLAZAN POR EL API
   ------------------------------------------------------------
   Mantienen la forma que debe devolver el backend: al conectar el
   servicio sólo cambia el origen, no los componentes.
   ============================================================ */
import { EST_META, ORDEN_EST } from "./constants";
import { IWalletClientRow, IWalletGroupRow, IWalletMatrixCell, IWalletSummary } from "./types";

const M = 1e6;
const MM = 1e9;

/** Reparto por estado de cada tramo: entre más viejo, más novedad y sin conciliar. */
const PERFIL_TRAMO: Record<string, number>[] = [
  { compensada: 0.03, pagada: 0.04, conciliado: 0.82, novedad: 0.03, sin_conciliar: 0.08 },
  { compensada: 0.06, pagada: 0.1, conciliado: 0.45, novedad: 0.22, sin_conciliar: 0.17 },
  { compensada: 0.08, pagada: 0.09, conciliado: 0.32, novedad: 0.3, sin_conciliar: 0.21 },
  { compensada: 0.09, pagada: 0.08, conciliado: 0.28, novedad: 0.32, sin_conciliar: 0.23 },
  { compensada: 0.1, pagada: 0.07, conciliado: 0.22, novedad: 0.36, sin_conciliar: 0.25 },
  { compensada: 0.12, pagada: 0.06, conciliado: 0.16, novedad: 0.38, sin_conciliar: 0.28 }
];

/** Convierte un total de tramo en su desglose por estado, cuadrando el redondeo. */
function cell(total: number, ti: number): IWalletMatrixCell {
  const perfil = PERFIL_TRAMO[ti];
  const parts = ORDEN_EST.map((e) => Math.round(total * perfil[e]));
  const diff = total - parts.reduce((a, b) => a + b, 0);
  parts[2] += diff; // el sobrante cae en conciliado, el segmento más grande
  return {
    compensada: parts[0],
    pagada: parts[1],
    conciliado: parts[2],
    novedad: parts[3],
    sin_conciliar: parts[4],
    total
  };
}

const row = (
  id: string,
  nombre: string,
  nit: string,
  ejecutivo: string,
  totales: number[]
): IWalletClientRow => ({
  id,
  nombre,
  nit,
  ejecutivo,
  tramos: totales.map((t, i) => cell(t, i))
});

export const WALLET_CLIENT_ROWS: IWalletClientRow[] = [
  row("C001", "OXXO COLOMBIA S.A.S.", "843326788", "Cristina Osorio", [
    7.92 * MM,
    1.32 * MM,
    377 * M,
    49 * M,
    150 * M,
    25 * M
  ]),
  row("C002", "KOBA COLOMBIA S.A.S. (D1)", "894204193", "Cristina Osorio", [
    5.61 * MM,
    1.16 * MM,
    336 * M,
    74 * M,
    135 * M,
    103 * M
  ]),
  row("C003", "ALMACENES ÉXITO S.A.", "846874074", "Mónica Bermúdez", [
    5.33 * MM,
    856 * M,
    371 * M,
    86 * M,
    109 * M,
    135 * M
  ]),
  row("C004", "ARCOS DORADOS COLOMBIA S.A.S.", "810162228", "Germán Torres", [
    3.54 * MM,
    479 * M,
    91 * M,
    0,
    136 * M,
    65 * M
  ])
];

/** Totales de la vista completa (16 clientes), no sólo de las filas mostradas. */
export const WALLET_SUMMARY: IWalletSummary = {
  clientes: 16,
  segments: {
    compensada: 2.12 * MM,
    pagada: 3.04 * MM,
    conciliado: 34.88 * MM,
    novedad: 4.37 * MM,
    sin_conciliar: 6.85 * MM,
    total: 51.26 * MM,
    vencido: 11.4 * MM,
    n: 835
  }
};

export const WALLET_GROUP_ROWS: IWalletGroupRow[] = [
  {
    clave: "NOV-1041",
    tipo: "novedad",
    novedadId: "NOV-1041",
    detalle: "Nota crédito comercial",
    cliente: "OXXO COLOMBIA",
    facturas: 7,
    monto: 412 * M,
    tramos: [0, 168 * M, 121 * M, 49 * M, 74 * M, 0],
    responsable: "Cristina O.",
    diasSinGestion: 2,
    compromiso: "12/09/26",
    limite: "26/09/26",
    estado: { nom: "En gestión", sev: "idle" }
  },
  {
    clave: "NOV-1042",
    tipo: "novedad",
    novedadId: "NOV-1042",
    detalle: "Factura rechazada / sin radicar",
    cliente: "KOBA COLOMBIA",
    facturas: 4,
    monto: 268 * M,
    tramos: [0, 0, 94 * M, 71 * M, 61 * M, 42 * M],
    responsable: "Back Office",
    diasSinGestion: 9,
    compromiso: "28/08/26",
    limite: "05/09/26",
    estado: { nom: "Esperando aprobación", sev: "warn" }
  },
  {
    clave: "C003|sin_conciliar",
    tipo: "sin_conciliar",
    detalle: EST_META.sin_conciliar.corta,
    cliente: "ALMACENES ÉXITO",
    facturas: 12,
    monto: 336 * M,
    tramos: [98 * M, 84 * M, 61 * M, 39 * M, 28 * M, 26 * M],
    responsable: null,
    diasSinGestion: null,
    compromiso: null,
    limite: null,
    estado: { nom: EST_META.sin_conciliar.chipTxt, sev: EST_META.sin_conciliar.chip }
  },
  {
    clave: "C004|conciliado",
    tipo: "conciliado",
    detalle: EST_META.conciliado.corta,
    cliente: "ARCOS DORADOS",
    facturas: 21,
    monto: 1.18 * MM,
    tramos: [742 * M, 216 * M, 94 * M, 0, 78 * M, 50 * M],
    responsable: "Germán T.",
    diasSinGestion: 4,
    compromiso: null,
    limite: null,
    estado: { nom: EST_META.conciliado.chipTxt, sev: EST_META.conciliado.chip }
  }
];
