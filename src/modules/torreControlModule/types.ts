import type { NoveltyTipoKey } from "@/modules/noveltiesModule/types";
import type { IWalletPerson, TramoIndex, WalletSegments } from "@/modules/walletModule/types";

/** Una novedad abierta vista desde la torre: sólo lo que agregan los paneles. */
export interface ITorreNovedad {
  id: string;
  tipo: NoveltyTipoKey;
  clienteId: string;
  /** Tramos de los que cuelga su saldo: por aquí la alcanza el filtro de tramo. */
  tramos: TramoIndex[];
  ejecutivo: IWalletPerson;
  monto: number;
  compromiso: Date;
  /** Días sin gestión; null = nunca se ha registrado nada. */
  diasSinGestion: number | null;
}

/** Los cinco ejes de filtrado. Hoy sólo `tramos` se mueve. */
export interface ITorreFiltros {
  coordinadores: string[];
  ejecutivos: string[];
  kam: string[];
  tipos: NoveltyTipoKey[];
  tramos: TramoIndex[];
}

/** Cifras de cabecera de un conjunto de clientes. */
export interface ITorreResumen {
  /** Todo el saldo desglosado por estado. */
  segments: WalletSegments;
  /** El mismo desglose, pero sólo de lo vencido: es lo que se cubre o no. */
  vencidos: WalletSegments;
  /** Saldo por tramo, en el orden de TRAMOS. */
  tramos: number[];
  clientes: number;
  /** Derivado del saldo: no hay datos a nivel de factura. */
  facturas: number;
  /** Vencido con alguna gestión encima: vencido − sin conciliar. */
  cubierto: number;
}

/** Fila de "Composición de la cartera por ejecutivo". */
export interface ITorreEjecutivo {
  persona: IWalletPerson;
  /** Toda su cartera por estado: es lo que reparte la barra. */
  segments: WalletSegments;
  /** Vencido sin conciliar: la cifra de la derecha y el criterio de orden. */
  sinConciliar: number;
}

/** Fila de "Novedades abiertas por tipo". */
export interface ITorreTipo {
  id: NoveltyTipoKey;
  nom: string;
  n: number;
  monto: number;
  /** Monto de las que ya se pasaron del compromiso. */
  mVenc: number;
  mDia: number;
  venc: number;
}

/** Fila de "Clientes con más saldo sin conciliar". */
export interface ITorreCliente {
  id: string;
  nombre: string;
  ejecutivo: IWalletPerson | null;
  vencido: number;
  sinConciliar: number;
  cubierto: number;
}
