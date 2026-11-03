export type EstadoPrecinto = "BODEGA" | "ASIGNADO" | "USADO" | "ANULADO";

export interface IPrecintoEstadoSummary {
  id: EstadoPrecinto;
  /** Clave de `seals.status` con el título y la descripción del estado. */
  labelKey: "warehouse" | "assigned" | "used" | "voided";
  count: number;
  colorClass: string;
  badgeBg: string;
}

export interface IPrecintoItem {
  id: string;
  codigo: string;
  estado: EstadoPrecinto;
  ejecutivoAsignado?: string;
  fechaActualizacion?: string;
}
