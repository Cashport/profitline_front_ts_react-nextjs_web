export type EstadoPrecinto = 'BODEGA' | 'ASIGNADO' | 'USADO' | 'ANULADO';

export interface IPrecintoEstadoSummary {
  id: EstadoPrecinto;
  title: string;
  count: number;
  description: string;
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