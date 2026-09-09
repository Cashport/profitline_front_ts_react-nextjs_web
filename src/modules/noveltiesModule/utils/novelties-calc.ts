import { HOY, diasEntre } from "@/modules/walletModule/utils/format";
import type { Sev } from "@/modules/walletModule/types";
import { ESTADO_BY_ID, TIPO_BY_ID } from "../constants";
import type { INoveltyRow, NoveltyCardId, NoveltyFilter } from "../types";

/**
 * Semáforo del compromiso, con el mismo texto que muestra la cabecera del modal.
 * `sevDias` de cartera se le parece, pero imprime sólo los días.
 */
export function slaDe(n: INoveltyRow): { sev: Sev; txt: string; d: number } {
  if (n.estado === "cerrada") return { sev: "ok", txt: "Cerrada", d: 0 };

  const d = diasEntre(HOY, n.compromiso);
  if (d < 0) return { sev: "crit", txt: `Vencida ${Math.abs(d)}d`, d };
  if (d === 0) return { sev: "crit", txt: "Vence hoy", d };
  return { sev: d <= 2 ? "warn" : "ok", txt: `En ${d}d`, d };
}

/** Días sin gestión: verde ≤3, ámbar ≤7, rojo por encima. */
export const sevGestion = (d: number): Sev => (d <= 3 ? "ok" : d <= 7 ? "warn" : "crit");

/** Fecha límite: rojo si ya pasó, ámbar en los 5 días previos. Escala propia. */
export const sevLimite = (fecha: Date): Sev => {
  const d = diasEntre(HOY, fecha);
  return d < 0 ? "crit" : d <= 5 ? "warn" : "ok";
};

const abierta = (n: INoveltyRow) => n.estado !== "cerrada";

/**
 * Un predicado por tarjeta, compartido por el conteo y el filtro de filas: así
 * la tarjeta nunca anuncia un número distinto al de las filas que muestra.
 */
export const NOVELTY_PREDICATES: Record<NoveltyCardId, (n: INoveltyRow) => boolean> = {
  abiertas: abierta,
  vencidas: (n) => abierta(n) && slaDe(n).d < 0,
  frias: (n) => abierta(n) && (n.diasSinGestion === null || n.diasSinGestion > 7),
  limite: (n) => abierta(n) && diasEntre(HOY, n.limite) < 0,
  sinresp: (n) => abierta(n) && !n.responsable
};

const esTarjeta = (f: NoveltyFilter): f is NoveltyCardId => f in NOVELTY_PREDICATES;

/** Aplica el filtro activo y la búsqueda de la cabecera. */
export function filtrarNovedades(
  rows: INoveltyRow[],
  filtro: NoveltyFilter,
  query: string
): INoveltyRow[] {
  const porFiltro = esTarjeta(filtro)
    ? rows.filter(NOVELTY_PREDICATES[filtro])
    : filtro === "todas"
      ? rows
      : rows.filter((n) => n.estado === filtro);

  const q = query.trim().toLowerCase();
  if (!q) return porFiltro;

  return porFiltro.filter((n) =>
    `${n.id} ${TIPO_BY_ID[n.tipo].nom} ${n.accion} ${n.cliente.nombre} ${n.cliente.nit}`
      .toLowerCase()
      .includes(q)
  );
}

/** Conteo de una opción del select, sobre el universo sin filtrar. */
export const contarPorFiltro = (rows: INoveltyRow[], filtro: NoveltyFilter): number =>
  filtrarNovedades(rows, filtro, "").length;

/** Extractor de orden de la tabla, compartido con `ordenar` de cartera. */
export const valorDeColumna = (n: INoveltyRow, col: string): string | number => {
  switch (col) {
    case "novedad":
      return n.id;
    case "cliente":
      return n.cliente.nombre;
    case "fact":
      return n.facturas;
    case "resp":
      return n.responsable?.nombre ?? "";
    case "gestion":
      return n.diasSinGestion === null ? 99999 : n.diasSinGestion;
    case "ticket":
      return n.compromiso.getTime();
    case "limite":
      return n.limite.getTime();
    case "estado":
      return ESTADO_BY_ID[n.estado].nom;
    default:
      return n.monto;
  }
};
