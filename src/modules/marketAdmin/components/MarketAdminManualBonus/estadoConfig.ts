import { EstadoAprobacion } from "@/types/marketAdmin/IMarketAdmin";

// labelKey: clave en marketAdmin.manualBonus.status
export const ESTADO_CONFIG: Record<
  EstadoAprobacion,
  { labelKey: EstadoAprobacion; className: string }
> = {
  pendiente: {
    labelKey: "pendiente",
    className: "bg-amber-50 text-amber-600 border border-amber-200"
  },
  aprobado: {
    labelKey: "aprobado",
    className: "bg-green-50 text-green-700 border border-green-200"
  },
  rechazado: {
    labelKey: "rechazado",
    className: "bg-red-50 text-red-600 border border-red-200"
  }
};
