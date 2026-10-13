"use client";

import { RefObject, useEffect, useState } from "react";

/** Primer ancestro con scroll vertical (el contenedor de la vista). */
const scrollParentOf = (el: HTMLElement | null): HTMLElement | null => {
  let node = el?.parentElement ?? null;
  while (node) {
    const { overflowY } = getComputedStyle(node);
    if (overflowY === "auto" || overflowY === "scroll") return node;
    node = node.parentElement;
  }
  return null;
};

/** ¿El elemento está en una capa fija sobre la vista (ej. el modal de filtros del encabezado)? */
const inOverlay = (el: Element | null, pane: HTMLElement) => {
  for (let node = el; node && node !== pane; node = node.parentElement) {
    if (getComputedStyle(node).position === "fixed") return true;
  }
  return false;
};

/**
 * Esconde un bloque (los KPIs del Home) al bajar en cualquier parte de la
 * vista y lo devuelve al subir: fuera de `rootRef` (encabezado, márgenes)
 * enseguida; dentro, solo con la lista (`listRef`) ya arriba del todo. Con la
 * rueda, el giro que lo esconde no mueve las filas: primero se gana el espacio
 * y luego se recorre la tabla.
 */
export const useHideOnScroll = (
  rootRef: RefObject<HTMLElement>,
  listRef: RefObject<HTMLElement>
) => {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    const pane = scrollParentOf(root);
    if (!root || !pane) return;

    /** `false` si el evento no cuenta (viene de una capa fija sobre la vista). */
    const scroll = (down: boolean, target: EventTarget | null) => {
      const el = target instanceof Element ? target : null;
      const inside = el !== null && root.contains(el);
      if (!inside && inOverlay(el, pane)) return false;
      if (down) setHidden(true);
      else if (!inside || (listRef.current?.scrollTop ?? 0) <= 0) setHidden(false);
      return true;
    };

    const onWheel = (e: WheelEvent) => {
      if (!e.deltaY || e.ctrlKey) return; // horizontal o zoom del trackpad
      const down = e.deltaY > 0;
      if (scroll(down, e.target) && down && !hidden) e.preventDefault();
    };

    let touchY: number | null = null;
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0].clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      const y = e.touches[0].clientY;
      if (touchY === null || Math.abs(touchY - y) < 10) return;
      scroll(touchY > y, e.target); // el dedo sube: el contenido baja
      touchY = y;
    };

    pane.addEventListener("wheel", onWheel, { passive: false });
    pane.addEventListener("touchstart", onTouchStart, { passive: true });
    pane.addEventListener("touchmove", onTouchMove, { passive: true });
    return () => {
      pane.removeEventListener("wheel", onWheel);
      pane.removeEventListener("touchstart", onTouchStart);
      pane.removeEventListener("touchmove", onTouchMove);
    };
  }, [rootRef, listRef, hidden]);

  return hidden;
};
