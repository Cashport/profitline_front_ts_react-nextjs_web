import type { Sev } from "@/modules/walletModule/types";
import type { TicketCardId, TicketLaneId } from "./types";

interface CardMeta {
  id: TicketCardId;
  label: string;
  /** Explica qué mide la tarjeta; va tras el conteo. */
  pie: string;
  sev?: Extract<Sev, "warn" | "crit">;
}

/** Las cinco tarjetas de la bandeja, en el orden en que se muestran. */
export const TICKET_KPI_CARDS: CardMeta[] = [
  { id: "abiertos", label: "Por resolver", pie: "saldo esperando una acción concreta" },
  { id: "vencidos", label: "Vencidos", pie: "la fecha de resolución ya pasó", sev: "crit" },
  {
    id: "proximos",
    label: "Vencen en 3 días o menos",
    pie: "hay que cerrarlos esta semana",
    sev: "warn"
  },
  {
    id: "tarde",
    label: "Resueltos fuera de fecha",
    pie: "se cerraron después del compromiso",
    sev: "warn"
  },
  { id: "atiempo", label: "Resueltos a tiempo", pie: "cumplieron la fecha pactada" }
];

/** Columnas del tablero: por cercanía de la fecha de resolución. */
export const TICKET_LANES: { id: TicketLaneId; nom: string }[] = [
  { id: "vencidos", nom: "Vencidos" },
  { id: "hoy", nom: "Vencen hoy" },
  { id: "semana", nom: "Próximos 7 días" },
  { id: "despues", nom: "Más adelante" },
  { id: "ok", nom: "Resueltos" }
];

/** Filtros de la barra superior. Sin opciones todavía: la data llega con el API. */
export const TICKET_FILTERS = [
  { key: "coordinadores", label: "Todos los coordinadores" },
  { key: "responsables", label: "Todos los responsables" },
  { key: "categorias", label: "Todas las categorías" }
];
