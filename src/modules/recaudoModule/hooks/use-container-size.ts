"use client";

import { useEffect, useRef, useState } from "react";

/** Ancho y alto de un contenedor, al día con sus cambios de tamaño: los gráficos SVG se dibujan a esa medida. */
export function useContainerSize<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setSize({ width: el.clientWidth, height: el.clientHeight });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, size] as const;
}
