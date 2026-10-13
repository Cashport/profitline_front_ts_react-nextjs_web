import type { ICollectionTowerQuery } from "@/types/collectionTower/ICollectionTower";

/** Tableros del módulo de recaudo (BOARDS). Sólo la torre tiene vista; los demás, "en diseño". */
export type BoardId = "torre" | "tramo" | "apl" | "nov";

export interface Board {
  id: BoardId;
  name: string;
  description: string;
  /** Sin vista lista: al elegirlo sale PendingBoard ("en diseño"). */
  enabled: boolean;
  /** Tablero que vive en otra ruta (p. ej. la cartera en /wallet): elegirlo navega allá. */
  href?: string;
}

/** Filtros de la página: los del API más el tablero activo. */
export interface TowerFilters extends ICollectionTowerQuery {
  board: BoardId;
}

/** Agrupación de las tablas "frente a su meta". */
export type Grouping = "client" | "executive" | "channel" | "coordinator";

/** Vista del detalle de acuerdos. */
export type AgreementView = "all" | "broken" | "dueSoon" | "fulfilled";

/** Filtro de antigüedad de los PNA. */
export type PnaAge = "all" | "over3" | "over7";

/** Referencia histórica de "Recaudo por día". */
export type CurveReference = "median" | "previous" | "both";

/** Semáforo de chips y cifras. */
export type Tone = "ok" | "warn" | "crit";
