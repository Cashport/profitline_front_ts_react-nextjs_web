"use client";

import { RefObject, useEffect, useRef, useState } from "react";

/** Filas que se pintan de entrada y las que se suman en cada tanda. */
const STEP = 60;
/** Cuántos px antes del final del scroll se pide la siguiente tanda. */
const PRELOAD_PX = 480;

/**
 * Pinta una tabla larga por tandas: las primeras STEP filas y otras STEP cada
 * vez que la fila centinela (al final de las pintadas) se acerca al borde
 * visible del contenedor con scroll. Con ~3.000 clientes, pintar todas las
 * filas de una (cada una con sus tooltips) congelaba la página varios segundos.
 *
 * Sólo cambia lo que se pinta: totales, conteos y Excel van sobre `rows`.
 * La tanda no vuelve a empezar al ordenar (el scroll se queda donde estaba);
 * al cambiar un filtro la tabla se remonta y arranca de cero.
 */
export function useProgressiveRows<T>(rows: T[], scrollRef: RefObject<HTMLElement>) {
  const [limit, setLimit] = useState(STEP);
  const sentinelRef = useRef<HTMLTableRowElement>(null);
  const hasMore = rows.length > limit;

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setLimit((l) => l + STEP);
      },
      { root: scrollRef.current, rootMargin: `0px 0px ${PRELOAD_PX}px 0px` }
    );
    observer.observe(el);
    return () => observer.disconnect();
    // `limit` va en las dependencias: si tras una tanda la centinela sigue a la
    // vista, el observador nuevo la reporta de una y sigue llenando.
  }, [hasMore, limit, scrollRef]);

  return { visible: hasMore ? rows.slice(0, limit) : rows, hasMore, sentinelRef };
}
