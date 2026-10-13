import { EstadoAprobacion } from "@/types/marketAdmin/IMarketAdmin";

export const ESTADO_CONFIG: Record<EstadoAprobacion, { label: string; className: string }> = {
  pendiente: {
    label: "Pendiente",
    className: "bg-amber-50 text-amber-600 border border-amber-200"
  },
  aprobado: { label: "Aprobado", className: "bg-green-50 text-green-700 border border-green-200" },
  rechazado: { label: "Rechazado", className: "bg-red-50 text-red-600 border border-red-200" }
};
