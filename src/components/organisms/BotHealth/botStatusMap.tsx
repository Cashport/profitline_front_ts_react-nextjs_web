import { ReactElement } from "react";
import { CheckCircle, Circle, Clock, MagnifyingGlass, XCircle } from "phosphor-react";

import { BotHealthStatus, BotRawStatus } from "@/types/bots/IBotHealth";

// Mapea el estado crudo que envía el backend (BotStatusDTO.estado) a las 6 categorías
// de negocio de la UI. Alineado con src/modules/dataQuality/constants.ts (BOT_STATUS_META)
// y src/types/dataQuality/IDataQuality.ts (comentario sobre IBotStatusItem, verificado
// contra cashport-backend/src/model/data/data.dto.ts): "EN_REVISION" es un estado real
// y propio que calcula el backend (última ejecución exitosa con la inmediatamente
// anterior fallida) -- NO es sinónimo de "PENDIENTE" ni de "SIN_EJECUCIONES". Cada uno
// de los 6 valores se muestra con su propia etiqueta.
export const mapRawStatusToHealthStatus = (estado: BotRawStatus | string): BotHealthStatus => {
  switch (estado) {
    case "EXITOSO":
      return "Operativo";
    case "FALLIDO":
      return "Con fallas";
    case "EN_EJECUCION":
      return "Ejecutando";
    case "EN_REVISION":
      return "En revisión";
    case "PENDIENTE":
      return "Pendiente";
    case "SIN_EJECUCIONES":
      return "Sin ejecuciones";
    default:
      // Estado no reconocido: no se descarta en silencio, se cuenta como "En revisión"
      // (mismo fallback que ya existía antes de distinguir PENDIENTE/SIN_EJECUCIONES).
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
// para "Operativo"/"Con fallas"/"En revisión" (único mapa de estado/color/icono existente
// en Cashport), y de src/modules/dataQuality/constants.ts (BOT_STATUS_META) para
// "Ejecutando"/"Pendiente"/"Sin ejecuciones", para que ambos módulos de bots representen
// el mismo estado con el mismo color. "Ejecutando" deja de usar el ámbar que antes era
// placeholder (chocaba con "Pendiente") y pasa a gris, igual que en BOT_STATUS_META.
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
    color: "#6B7280",
    backgroundColor: "#F5F5F4",
    icon: <Clock size={16} />
  },
  "En revisión": {
    text: "En revisión",
    color: "#2143b0",
    backgroundColor: "#e2ecfe",
    icon: <MagnifyingGlass size={16} />
  },
  Pendiente: {
    text: "Pendiente",
    color: "#92400e",
    backgroundColor: "#fef2ca",
    icon: <Clock size={16} />
  },
  "Sin ejecuciones": {
    text: "Sin ejecuciones",
    color: "#6B7280",
    backgroundColor: "#F3F4F6",
    icon: <Circle size={16} />
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
