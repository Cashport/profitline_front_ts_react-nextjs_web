import { estadosOf } from "./estados";
import {
  EstadoId,
  IWalletClientRow,
  IWalletMatrixCell,
  MontosPorEstado,
  SortState,
  WalletSegments
} from "../types";

const emptySegments = (): WalletSegments => ({
  compensada: 0,
  pagada: 0,
  conciliado: 0,
  novedad: 0,
  sin_conciliar: 0,
  saldo: 0,
  saldo_factura: 0,
  glosado: 0,
  devolucion: 0,
  otros: 0,
  total: 0,
  vencido: 0,
  n: 0
});

/** Suma celdas de la matriz en un único desglose por estado, nuevos incluidos. */
export function sumCells(cells: IWalletMatrixCell[]): WalletSegments {
  const r = emptySegments();
  cells.forEach((c) => {
    estadosOf(c).forEach((e) => (r[e] = (r[e] ?? 0) + (c[e] ?? 0)));
    r.total += c.total;
    r.n += c.n ?? 0;
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
    estadosOf(s).forEach((e) => (r[e] = (r[e] ?? 0) + (s[e] ?? 0)));
    r.total += s.total;
    r.vencido += s.vencido;
    r.n += s.n;
  });
  return r;
}

/** Total de una columna de tramo, sumando todas las filas. */
export const tramoTotal = (rows: IWalletClientRow[], ti: number): number =>
  rows.reduce((a, row) => a + (row.tramos[ti]?.total ?? 0), 0);

/**
 * Suma del reparto por tramo de un grupo.
 *
 * Es el denominador de las barras de reparto y el pie de sus tooltips. No se
 * usa el total del grupo porque, al pedirle un `aging` al API, éste recorta el
 * total a ese tramo: la proporción quedaría calculada contra una cifra más
 * chica que la suma y la barra se pasaría del 100%.
 */
export const sumaTramos = (tramos: number[]): number => tramos.reduce((a, v) => a + v, 0);

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

/**
 * Selección de los chips de estado. Clic: sólo ese estado, o ninguno si ya era
 * el único. Shift+clic (`additive`): lo suma o lo quita sin tocar los demás.
 */
export function nextEstadoSelection(
  current: EstadoId[],
  estado: EstadoId,
  additive: boolean
): EstadoId[] {
  if (additive) {
    return current.includes(estado) ? current.filter((e) => e !== estado) : [...current, estado];
  }
  return current.length === 1 && current[0] === estado ? [] : [estado];
}

/** Porcentaje de cada estado sobre el total, para el ancho de los segmentos. */
export const segmentWidths = (g: MontosPorEstado & { total: number }) =>
  estadosOf(g)
    .map((e) => {
      const value = g[e] ?? 0;
      return { estado: e, value, width: g.total ? (value / g.total) * 100 : 0 };
    })
    .filter((s) => s.value > 0);
