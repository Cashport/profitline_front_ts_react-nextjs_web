import { CheckCircle2, Loader2, LucideIcon, XCircle } from "lucide-react";

import { BotFileType, BotStatus } from "./types/automations";

// Los tooltips del módulo se pintan en negro sobre el verde por defecto de TooltipContent.
// El texto secundario usa opacity-70 dentro del contenido, que sobre negro rinde gris.
export const DARK_TOOLTIP_CONTENT = "bg-cashport-black text-white shadow-lg";
export const DARK_TOOLTIP_ARROW = "bg-cashport-black fill-cashport-black";

// Única fuente de verdad del estado de un bot: la consumen las tarjetas de resumen,
// el badge de la tabla y el drawer de historial.
export const BOT_STATUS_META: Record<
  BotStatus,
  { label: string; icon: LucideIcon; color: string; bg: string }
> = {
  success: { label: "Operativo", icon: CheckCircle2, color: "#16A34A", bg: "#F0FDF4" },
  error: { label: "Con fallas", icon: XCircle, color: "#DC2626", bg: "#FEF2F2" },
  running: { label: "Ejecutando", icon: Loader2, color: "#6B7280", bg: "#F5F5F4" }
};

export const BOT_FILE_TYPE_META: Record<BotFileType, { label: string }> = {
  stock: { label: "Stock" },
  sellout: { label: "Sellout" }
};

export const BOT_MUTED_TEXT_COLOR = "#6B7280";
