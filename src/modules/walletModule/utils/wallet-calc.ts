import { ORDEN_EST } from "../constants";
import {
  EstadoKey,
  IWalletClientRow,
  IWalletMatrixCell,
  SortState,
  WalletSegments
} from "../types";

const emptySegments = (): WalletSegments => ({
  compensada: 0,
  pagada: 0,
  conciliado: 0,
  novedad: 0,
  sin_conciliar: 0,
  total: 0,
  vencido: 0,
  n: 0
});

/** Suma celdas de la matriz en un único desglose por estado. */
export function sumCells(cells: IWalletMatrixCell[]): WalletSegments {
  const r = emptySegments();
  cells.forEach((c) => {
    ORDEN_EST.forEach((e) => (r[e] += c[e]));
    r.total += c.total;
  });
  return r;
}

/** Todo lo que no está en el tramo 0 (corriente) está vencido. */
export function rowSegments(row: IWalletClientRow): WalletSegments {
  const r = sumCells(row.tramos);
  r.vencido = row.tramos.slice(1).reduce((a, c) => a + c.total, 0);
  return r;
}

/** Desglose global de la vista, sumando todas las filas. */
export function totalSegments(rows: IWalletClientRow[]): WalletSegments {
  const r = emptySegments();
  rows.forEach((row) => {
    const s = rowSegments(row);
    ORDEN_EST.forEach((e) => (r[e] += s[e]));
    r.total += s.total;
    r.vencido += s.vencido;
  });
  return r;
}

/** Total de una columna de tramo, sumando todas las filas. */
export const tramoTotal = (rows: IWalletClientRow[], ti: number): number =>
  rows.reduce((a, row) => a + (row.tramos[ti]?.total ?? 0), 0);

/** Ordena una copia de la lista según el estado de orden y un extractor. */
export function ordenar<T>(lista: T[], orden: SortState, valor: (item: T) => string | number): T[] {
  const dir = orden.dir === "asc" ? 1 : -1;
  return lista.slice().sort((a, b) => {
    const va = valor(a);
    const vb = valor(b);
    return typeof va === "string" && typeof vb === "string"
      ? va.localeCompare(vb) * dir
      : ((va as number) - (vb as number)) * dir;
  });
}

/** Alterna dirección si la columna ya está activa, si no arranca en la por defecto. */
export function nextSort(current: SortState, col: string, textualCols: string[] = []): SortState {
  if (current.col === col) {
    return { col, dir: current.dir === "asc" ? "desc" : "asc" };
  }
  return { col, dir: textualCols.includes(col) ? "asc" : "desc" };
}

/** Porcentaje de cada estado sobre el total, para el ancho de los segmentos. */
export const segmentWidths = (g: Pick<WalletSegments, EstadoKey | "total">) =>
  ORDEN_EST.map((e) => ({
    estado: e,
    value: g[e],
    width: g.total ? (g[e] / g.total) * 100 : 0
  })).filter((s) => s.value > 0);
