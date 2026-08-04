import { ICreateManualBonusBody, NuevaAsignacionData } from "@/types/marketAdmin/IMarketAdmin";

// Modelo del formulario (UI) → body de la API (POST /manager-botification)
export const buildManualBonusPayload = (data: NuevaAsignacionData): ICreateManualBonusBody => ({
  customer_id: data.cliente.nit,
  product_id: data.producto.id,
  assigned_qty: data.unidades,
  start_date: data.fechaInicio,
  end_date: data.fechaFin,
  comments: data.nota
});
