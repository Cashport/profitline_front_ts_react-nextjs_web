/* Estados de la pantalla: los conocidos, con su fila en EST_META, y los que el
   API mande sin que el front los conozca todavía. Estos últimos no se pierden
   ni se agrupan: se pintan aparte, con nombre y color propios. */
import { EST_META, FALLBACK_BG, ORDEN_EST } from "../constants";
import type { EstadoMeta } from "../constants";
import type { EstadoId, EstadoNuevo } from "../types";

const PREFIX = "nuevo:";

export const toEstadoNuevo = (statusKey: string): EstadoNuevo => `${PREFIX}${statusKey}`;

export const isEstadoNuevo = (e: string): e is EstadoNuevo => e.startsWith(PREFIX);

/** statusKey de un estado nuevo, tal como lo manda el API. */
export const statusKeyOf = (e: EstadoNuevo): string => e.slice(PREFIX.length);

/**
 * Orden de pintado de barras, tooltips y leyenda: los conocidos, con los nuevos
 * justo antes de "otros", que siempre cierra. Los nuevos van por statusKey para
 * que el orden no dependa de cómo los mande el API.
 */
export const orderEstados = (nuevos: EstadoNuevo[]): EstadoId[] => {
  const sorted = [...nuevos].sort();
  return ORDEN_EST.flatMap((e): EstadoId[] => (e === "otros" ? [...sorted, e] : [e]));
};

/** Estados de un desglose, en orden de pintado e incluidos los nuevos que traiga. */
export const estadosOf = (montos: object): EstadoId[] =>
  orderEstados(Object.keys(montos).filter(isEstadoNuevo));

/** Hash estable: el color de un estado nuevo lo sigue a él, no a su posición. */
const hashKey = (text: string): number => {
  let h = 7;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
  return h;
};

/** "EN_ACUERDO" → "En acuerdo". */
const humanize = (statusKey: string): string => {
  const text = statusKey.replace(/_/g, " ").trim().toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
};

/**
 * Nombre, color y textos de un estado. Uno nuevo no tiene fila en EST_META: su
 * nombre sale del statusKey y su color, de FALLBACK_BG. Dos nuevos pueden
 * compartir color; el nombre, que siempre va al lado, los distingue.
 */
export const estadoMeta = (e: EstadoId): EstadoMeta => {
  if (!isEstadoNuevo(e)) return EST_META[e];

  const statusKey = statusKeyOf(e);
  const nom = humanize(statusKey);
  return {
    nom,
    bg: FALLBACK_BG[hashKey(statusKey) % FALLBACK_BG.length],
    chip: "idle",
    chipTxt: nom,
    corta: "Estado nuevo del catálogo"
  };
};
