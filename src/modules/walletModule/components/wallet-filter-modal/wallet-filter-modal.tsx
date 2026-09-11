"use client";

import { FilterTrigger } from "@/components/ui/filter-modal";

/** Misma superficie que el botón de tema para que los dos lean como un par. */
const TRIGGER_CLASS =
  "flex h-12 shrink-0 items-center gap-2 rounded-lg border border-border bg-card px-4 text-foreground transition-colors hover:bg-secondary";

/**
 * Botón "Filtros" de la barra superior. Sólo maqueta: el API de la matriz
 * todavía no expone filtros, así que no hay nada que abrir.
 * TODO: cuando exista el endpoint, reemplazar por `FilterModal` con las
 * categorías de `WALLET_FILTERS` (constants.ts) al estilo de
 * `FilterDevolucionesTab`, pasando `trigger={{ className: TRIGGER_CLASS }}`
 * para que el botón no cambie de aspecto.
 */
export default function WalletFilterModal() {
  return <FilterTrigger count={0} onClick={() => {}} className={TRIGGER_CLASS} />;
}
