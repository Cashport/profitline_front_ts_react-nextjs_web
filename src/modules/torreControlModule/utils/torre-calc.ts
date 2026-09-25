/* Todas las cifras de la torre son reducciones sobre el portafolio. Nada de esto
   toca el DOM ni guarda estado: el contenedor las llama y reparte el resultado. */
import { NOVELTY_TIPOS } from "@/modules/noveltiesModule/constants";
import { TRAMOS } from "@/modules/walletModule/constants";
import { EJECUTIVO_POR_CLIENTE, WALLET_SUMMARY } from "@/modules/walletModule/mocked-data";
import { HOY, diasEntre } from "@/modules/walletModule/utils/format";
import { rowSegments, sumCells, totalSegments } from "@/modules/walletModule/utils/wallet-calc";
import type {
  IWalletClientRow,
  IWalletMatrixCell,
  TramoIndex,
  WalletSegments
} from "@/modules/walletModule/types";
import type {
  ITorreCliente,
  ITorreEjecutivo,
  ITorreNovedad,
  ITorreResumen,
  ITorreTipo
} from "../types";

const CELDA_VACIA: IWalletMatrixCell = {
  compensada: 0,
  pagada: 0,
  conciliado: 0,
  novedad: 0,
  sin_conciliar: 0,
  saldo: 0,
  glosado: 0,
  devolucion: 0,
  otros: 0,
  total: 0,
  n: 0
};

/**
 * Acota los clientes a los tramos elegidos vaciando las demás celdas. Conserva
 * las seis posiciones, así que todo lo que viene después —rowSegments,
 * totalSegments, tramoTotal— sigue funcionando sin enterarse del filtro.
 */
export function aplicarTramos(
  rows: IWalletClientRow[],
  tramos: TramoIndex[]
): IWalletClientRow[] {
  if (tramos.length === 0) return rows;

  const activos = new Set<number>(tramos);
  return rows.map((row) => ({
    ...row,
    tramos: row.tramos.map((celda, i) => (activos.has(i) ? celda : CELDA_VACIA))
  }));
}

/** Valor medio de factura del portafolio: 16 clientes, 835 facturas. */
const FACTURA_PROMEDIO = WALLET_SUMMARY.segments.total / WALLET_SUMMARY.segments.n;

/** No hay datos a nivel de factura: el conteo se estima desde el saldo. */
export const facturasDe = (monto: number): number => Math.round(monto / FACTURA_PROMEDIO);

/**
 * Desglose por estado de sólo lo vencido, que es el tramo 1 en adelante. Lo
 * corriente no se "cubre" ni se "concilia": todavía no debe nada, así que
 * mezclarlo diluye la cobertura. Es la misma distinción que hace la referencia.
 */
export const segmentosVencidos = (rows: IWalletClientRow[]): WalletSegments =>
  sumCells(rows.flatMap((r) => r.tramos.slice(1)));

export function resumen(rows: IWalletClientRow[]): ITorreResumen {
  const segments = totalSegments(rows);
  const vencidos = segmentosVencidos(rows);

  return {
    segments,
    vencidos,
    tramos: TRAMOS.map((t) => rows.reduce((a, r) => a + (r.tramos[t.i]?.total ?? 0), 0)),
    clientes: rows.filter((r) => rowSegments(r).total > 0).length,
    facturas: facturasDe(segments.total),
    cubierto: vencidos.total - vencidos.sin_conciliar
  };
}

/** Desglose por estado de cada uno de los seis tramos. */
export const porTramo = (rows: IWalletClientRow[]): WalletSegments[] =>
  TRAMOS.map((t) => sumCells(rows.map((r) => r.tramos[t.i])));

/** Cartera de cada ejecutivo, del que más saldo sin conciliar tiene al que menos. */
export function porEjecutivo(rows: IWalletClientRow[]): ITorreEjecutivo[] {
  const grupos = new Map<string, IWalletClientRow[]>();

  rows.forEach((row) => {
    const persona = EJECUTIVO_POR_CLIENTE[row.id];
    if (!persona) return;
    grupos.set(persona.id, [...(grupos.get(persona.id) ?? []), row]);
  });

  return [...grupos.values()]
    .map((suyas) => ({
      persona: EJECUTIVO_POR_CLIENTE[suyas[0].id],
      segments: totalSegments(suyas),
      sinConciliar: segmentosVencidos(suyas).sin_conciliar
    }))
    .filter((e) => e.segments.total > 0)
    .sort((a, b) => b.sinConciliar - a.sinConciliar);
}

/** Una novedad está vencida cuando su compromiso ya pasó. Todas están abiertas. */
export const vencida = (n: ITorreNovedad): boolean => diasEntre(HOY, n.compromiso) < 0;

/** Sin gestión hace más de una semana, o sin gestión nunca. */
export const fria = (n: ITorreNovedad): boolean =>
  n.diasSinGestion === null || n.diasSinGestion > 7;

/**
 * Novedades que siguen en vista tras el filtro de tramo: las que tocan alguno
 * de los tramos elegidos. Se conservan enteras, como en la referencia — el
 * panel cuenta novedades, no la parte de su monto que cae dentro del tramo.
 */
export const novedadesEnVista = (
  novedades: ITorreNovedad[],
  tramos: TramoIndex[]
): ITorreNovedad[] =>
  tramos.length === 0
    ? novedades
    : novedades.filter((n) => n.tramos.some((t) => tramos.includes(t)));

/** Novedades abiertas agrupadas por tipo, de mayor a menor monto. */
export const porTipo = (novedades: ITorreNovedad[]): ITorreTipo[] =>
  NOVELTY_TIPOS.map((t) => {
    const suyas = novedades.filter((n) => n.tipo === t.id);
    const vencidas = suyas.filter(vencida);
    const monto = suyas.reduce((a, n) => a + n.monto, 0);
    const mVenc = vencidas.reduce((a, n) => a + n.monto, 0);

    return {
      id: t.id,
      nom: t.nom,
      n: suyas.length,
      monto,
      mVenc,
      mDia: monto - mVenc,
      venc: vencidas.length
    };
  })
    .filter((t) => t.n > 0)
    .sort((a, b) => b.monto - a.monto);

/** Los ocho clientes con más vencido sin conciliar. */
export const topClientes = (rows: IWalletClientRow[]): ITorreCliente[] =>
  rows
    .map((row) => {
      const g = segmentosVencidos([row]);
      return {
        id: row.id,
        nombre: row.nombre,
        ejecutivo: EJECUTIVO_POR_CLIENTE[row.id] ?? null,
        vencido: g.total,
        sinConciliar: g.sin_conciliar,
        cubierto: g.total - g.sin_conciliar
      };
    })
    .filter((c) => c.vencido > 0)
    .sort((a, b) => b.sinConciliar - a.sinConciliar)
    .slice(0, 8);
