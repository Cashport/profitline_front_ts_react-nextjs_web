"use client";

import { cn } from "@/utils/utils";
import { ORDEN_EST } from "../../constants";
import { estadoMeta } from "../../utils/estados";
import type { EstadoId } from "../../types";

interface StatusLegendProps {
  /** Estados que muestra, en su orden. Por defecto los conocidos. */
  estados?: EstadoId[];
  /** Estados elegidos: se resaltan y los demás se atenúan. */
  selected?: EstadoId[];
  /** Estados que se pueden elegir; los demás quedan sólo como leyenda. */
  selectable?: EstadoId[];
  /** Sin él la leyenda no filtra. `additive` es el shift+clic. */
  // eslint-disable-next-line no-unused-vars
  onSelect?: (estado: EstadoId, additive: boolean) => void;
}

/**
 * El -mx/-my compensa el padding: cada estado ocupa lo mismo que su texto, así
 * la leyenda no salta cuando llega el catálogo y los chips pasan a botones.
 */
const ITEM = "-mx-1.5 -my-0.5 inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5";

/**
 * Leyenda de los estados que pintan las barras de la matriz. Con `onSelect`,
 * cada estado elegible es además un chip que filtra.
 */
export default function StatusLegend({
  estados = ORDEN_EST,
  selected = [],
  selectable = [],
  onSelect
}: StatusLegendProps) {
  return (
    <div
      role={onSelect ? "group" : undefined}
      aria-label={onSelect ? "Filtrar por estado" : undefined}
      className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[11.5px] text-muted-foreground"
    >
      {estados.map((e) => {
        const activa = selected.includes(e);
        const apagada = selected.length > 0 && !activa;
        const meta = estadoMeta(e);
        const contenido = (
          <>
            <i
              className={cn("inline-block h-2.5 w-2.5 rounded-[3px]", meta.bg)}
              style={{ boxShadow: "inset 0 0 0 1px var(--wallet-seg-edge)" }}
            />
            {meta.nom}
          </>
        );

        if (!onSelect || !selectable.includes(e)) {
          return (
            <span key={e} className={cn(ITEM, "transition-opacity", apagada && "opacity-40")}>
              {contenido}
            </span>
          );
        }

        return (
          <button
            key={e}
            type="button"
            aria-pressed={activa}
            onClick={(ev) => onSelect(e, ev.shiftKey)}
            className={cn(
              ITEM,
              // select-none: sin él, el shift+clic selecciona el texto de la leyenda.
              "select-none transition hover:bg-muted/60",
              // Sin negrita: ensancharía el chip y correría a los de su derecha.
              activa &&
                "bg-wallet-accent-soft text-foreground ring-1 ring-inset ring-wallet-accent hover:bg-wallet-accent-soft",
              apagada && "opacity-40 hover:opacity-70"
            )}
          >
            {contenido}
          </button>
        );
      })}
    </div>
  );
}
