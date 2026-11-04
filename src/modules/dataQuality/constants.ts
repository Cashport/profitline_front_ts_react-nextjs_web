import {
  CheckCircle2,
  CircleDashed,
  Clock,
  Loader2,
  LucideIcon,
  Search,
  XCircle
} from "lucide-react";

import { BotStatus } from "./types/automations";

// Los tooltips del módulo se pintan en negro sobre el verde por defecto de TooltipContent.
// El texto secundario usa opacity-70 dentro del contenido, que sobre negro rinde gris.
export const DARK_TOOLTIP_CONTENT = "bg-cashport-black text-white shadow-lg";
export const DARK_TOOLTIP_ARROW = "bg-cashport-black fill-cashport-black";

// Única fuente de verdad del estado de un bot (la etiqueta está en dataQuality.bots.status): la consumen las tarjetas de resumen,
// el badge de la tabla y el drawer de historial. Un valor por cada estado REAL que
// manda backend (BotStatusDTO.estado) -- no se agrupan ni se traducen entre sí
// (PENDIENTE y SIN_EJECUCIONES NO son "En revisión", son estados propios).
export const BOT_STATUS_META: Record<BotStatus, { icon: LucideIcon; color: string; bg: string }> = {
  EXITOSO: { icon: CheckCircle2, color: "#16A34A", bg: "#F0FDF4" },
  FALLIDO: { icon: XCircle, color: "#DC2626", bg: "#FEF2F2" },
  EN_EJECUCION: { icon: Loader2, color: "#6B7280", bg: "#F5F5F4" },
  // Color/icono 1:1 con el token oficial "En revisión" de
  // src/components/organisms/proveedores/utils/documentStatusMap.tsx.
  EN_REVISION: { icon: Search, color: "#2143b0", bg: "#e2ecfe" },
  // Color/icono 1:1 con el token oficial "Pendiente"/"No clasificado" del mismo archivo.
  PENDIENTE: { icon: Clock, color: "#92400e", bg: "#fef2ca" },
  // Sin token oficial equivalente en Cashport para "nunca se ejecutó": gris neutro,
  // decisión de diseño pendiente de validar si no encaja.
  SIN_EJECUCIONES: { icon: CircleDashed, color: "#6B7280", bg: "#F3F4F6" }
};

// Periodicidad que manda backend -> clave del catálogo dataQuality.bots.frequency.
export const BOT_FREQUENCY_KEYS: Record<string, "daily" | "weekly" | "monthly"> = {
  Daily: "daily",
  Weekly: "weekly",
  Monthly: "monthly"
};

export const BOT_MUTED_TEXT_COLOR = "#6B7280";

// Orden de severidad (peor primero) para decidir qué badge mostrar en la fila
// resumen de un cliente agrupado en la tabla, mientras está colapsada.
const BOT_STATUS_SEVERITY: BotStatus[] = [
  "FALLIDO",
  "EN_REVISION",
  "EN_EJECUCION",
  "PENDIENTE",
  "SIN_EJECUCIONES",
  "EXITOSO"
];

export function getWorstBotStatus(bots: { estado: BotStatus }[]): BotStatus {
  for (const status of BOT_STATUS_SEVERITY) {
    if (bots.some((bot) => bot.estado === status)) return status;
  }
  return "SIN_EJECUCIONES";
}
