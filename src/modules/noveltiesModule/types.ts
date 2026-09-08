import type { IWalletPerson } from "@/modules/walletModule/types";

/** Estado de una novedad dentro de la bandeja. */
export type NoveltyEstadoKey =
  | "sin_asignar"
  | "en_gestion"
  | "esperando_aprob"
  | "aprobada"
  | "cerrada";

/** Tipo de novedad, del catálogo de negocio. */
export type NoveltyTipoKey =
  | "nc_comercial"
  | "nc_precio"
  | "refact"
  | "rechazo"
  | "cruce"
  | "acuerdo"
  | "pago_ni"
  | "faltante";

/** Fila de la bandeja de novedades. */
export interface INoveltyRow {
  id: string;
  tipo: NoveltyTipoKey;
  estado: NoveltyEstadoKey;
  cliente: { nombre: string; nit: string };
  ejecutivo: IWalletPerson;
  /** null = nadie la ha tomado. */
  responsable: IWalletPerson | null;
  /** Título del ticket abierto; el subtítulo de la fila es `tipo · accion`. */
  accion: string;
  facturas: number;
  monto: number;
  creada: Date;
  /** Fecha del próximo ticket: la mueve el ticket abierto más cercano. */
  compromiso: Date;
  /** Fecha en la que el caso debió estar cerrado. Se fija al crear la novedad. */
  limite: Date;
  /** Días sin gestión; null = nunca se ha registrado nada. */
  diasSinGestion: number | null;
}

/** Tarjetas KPI: cada una es también un valor del filtro. */
export type NoveltyCardId = "abiertas" | "vencidas" | "frias" | "limite" | "sinresp";

/** Filtro activo. Una sola pieza de estado para las tarjetas y el select. */
export type NoveltyFilter = NoveltyCardId | "todas" | NoveltyEstadoKey;

export type NoveltyView = "lista" | "tablero";
