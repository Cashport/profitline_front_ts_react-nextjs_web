import { ReactElement } from "react";
import { CheckCircle, Clock, MagnifyingGlass, XCircle } from "phosphor-react";

import { BotHealthStatus, BotRawStatus } from "@/types/bots/IBotHealth";

// Mapea el estado crudo que envía el backend (BotStatusDTO.estado) a las 4
// categorías de negocio que ya existen en la UI. "SIN_EJECUCIONES" y "PENDIENTE"
// comparten "En revisión": ambos significan que el bot aún no tiene un resultado
// exitoso/fallido que mostrar.
export const mapRawStatusToHealthStatus = (estado: BotRawStatus | string): BotHealthStatus => {
  switch (estado) {
    case "EXITOSO":
      return "Operativo";
    case "FALLIDO":
      return "Con fallas";
    case "EN_EJECUCION":
      return "Ejecutando";
    case "PENDIENTE":
    case "SIN_EJECUCIONES":
    default:
      return "En revisión";
  }
};

export interface BotStatusDetails {
  text: string;
  color: string;
  backgroundColor: string;
  icon: ReactElement;
}

// Paleta reutilizada 1:1 de src/components/organisms/proveedores/utils/documentStatusMap.tsx
// (único mapa de estado/color/icono existente en Cashport), para no inventar colores nuevos.
// "En revisión" usa EXACTAMENTE el mismo texto/color/icono que ya existe ahí.
// "Operativo" y "Con fallas" reutilizan los tokens de "Aprobado" y "Rechazado".
// "Ejecutando" no tiene equivalente visual existente en Cashport: se reutiliza el token
// ambar de "Pendiente"/"No clasificado" como placeholder, PENDIENTE de definición de diseño.
export const BOT_STATUS_MAP: Record<BotHealthStatus, BotStatusDetails> = {
  Operativo: {
    text: "Operativo",
    color: "#065f46",
    backgroundColor: "#d9f4e8",
    icon: <CheckCircle size={16} />
  },
  "Con fallas": {
    text: "Con fallas",
    color: "#e7092b",
    backgroundColor: "#fce6e9",
    icon: <XCircle size={16} />
  },
  Ejecutando: {
    text: "Ejecutando",
    color: "#92400e",
    backgroundColor: "#fef2ca",
    icon: <Clock size={16} />
  },
  "En revisión": {
    text: "En revisión",
    color: "#2143b0",
    backgroundColor: "#e2ecfe",
    icon: <MagnifyingGlass size={16} />
  }
};

const FALLBACK_STATUS_DETAILS: BotStatusDetails = {
  text: "Sin estado",
  color: "#595959",
  backgroundColor: "#f5f5f5",
  icon: <Clock size={16} />
};

// Acepta tanto el estado crudo del backend (BotRawStatus) como, por compatibilidad,
// un BotHealthStatus ya traducido.
export const getBotStatusDetails = (
  estado: BotRawStatus | BotHealthStatus | string | null | undefined
): BotStatusDetails => {
  if (!estado) {
    return FALLBACK_STATUS_DETAILS;
  }
  const healthStatus = Object.prototype.hasOwnProperty.call(BOT_STATUS_MAP, estado)
    ? (estado as BotHealthStatus)
    : mapRawStatusToHealthStatus(estado);
  return BOT_STATUS_MAP[healthStatus];
};
