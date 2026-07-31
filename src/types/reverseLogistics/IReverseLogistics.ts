// Domain types for the reverse-logistics (devoluciones) module.
// Field names are kept in Spanish to match the source data shape 1:1.

export type CausalDevolucion =
  | "Vencimiento"
  | "Vencimiento fuera política sin reconocimiento NC"
  | "Avería"
  | "Error en pedido"
  | "Retiro voluntario"
  | "Garantía";

export type EstadoDevolucion =
  | "Visita programada"
  | "Visita en curso"
  | "En aprobación"
  | "Demora de aprobación"
  | "Aprobado / Rechazado"
  | "Red generada"
  | "Recogido"
  | "Entregado"
  | "Movimiento Odoo"
  | "Contabilización de NC";

export interface IReturn {
  id: number;
  idBoleto: string;
  fecha: string;
  cliente: string;
  direccionCliente: string;
  canal: string;
  lineaNegocio?: string;
  unidades: number;
  causal: CausalDevolucion;
  embalaje: string;
  precintos: number;
  monto: number;
  usuario: string;
  estado: EstadoDevolucion;
  pdfUrl?: string;
}

export type TipoAprobacion =
  | "Fuera de politicas por fecha (01-vencimiento)"
  | "Causal con aprobación (04-Calidad)"
  | "Supera el monto máximo"
  | "Sin autorización de recogida";

export interface IApproval {
  id: number;
  cliente: string;
  codigoCliente: string;
  canal: string;
  linea: string;
  ciudad: string;
  fecha: string;
  tiposAprobacion: TipoAprobacion[];
  lotesParaAprobar: number;
  unidades: number;
  monto: number;
}

export interface IApprovalProduct {
  id: number;
  nombre: string;
  ean: string;
  sku: string;
  imageUrl?: string;
  politica: string;
  politicaColor: "green" | "orange" | "red";
  lote: string;
  fechaVencimiento: string;
  unidades: number;
  valor: number;
  documento: string;
  estado: string;
}
