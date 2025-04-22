import { CheckCircle, Clock, MagnifyingGlass, Sparkle, XCircle } from "phosphor-react";
import { ReactElement, ReactNode } from "react";

export type DocumentStatusId =
  | "a88b6d87-42f2-45f1-b45b-562ef43a3d19"
  | "532d6b7f-03da-4d22-9c28-2ef69590608f"
  | "5081de05-745d-449c-aff5-086e0d8b47a0"
  | "ca007d5c-6102-4de2-87b1-7150fb5d31a7"
  | "cdc3af46-5ba3-416b-bc76-0aa825efb1aa"
  | "c02b3475-f59a-4222-bb28-9dbb51cf02c1"
  | "dcf4e68b-11cb-4352-8ea7-f6356fa98db9";

// 1. Interfaz modificada: 'icon' ahora es una función factoría
export interface StatusDetailsConfig {
  text: string | ReactNode;
  color: string;
  backgroundColor: string;
  // La función recibe 'size' y devuelve el elemento icono
  // eslint-disable-next-line no-unused-vars
  iconFactory: (size: number) => ReactElement;
  // eslint-disable-next-line no-unused-vars
  textWrapper?: (text: string | ReactNode) => ReactNode; // Función opcional para envolver el texto
}

export interface StatusDetails {
  text: string | ReactNode;
  color: string;
  backgroundColor: string;
  icon: ReactElement;
  // eslint-disable-next-line no-unused-vars
  textWrapper?: (text: string | ReactNode) => ReactNode; // Función opcional para envolver el texto
}

export const STATUS_MAP: Record<DocumentStatusId, StatusDetails> = {
  "a88b6d87-42f2-45f1-b45b-562ef43a3d19": {
    text: "No clasificado",
    color: "#92400e",
    icon: <Clock size={16} />,
    backgroundColor: "#fef2ca"
  },
  "532d6b7f-03da-4d22-9c28-2ef69590608f": {
    text: "En revisión",
    color: "#2143b0",
    icon: <MagnifyingGlass size={16} />,
    backgroundColor: "#e2ecfe"
  },
  "5081de05-745d-449c-aff5-086e0d8b47a0": {
    text: "Rechazado",
    color: "#e7092b",
    icon: <XCircle size={16} />,
    backgroundColor: "#fce6e9"
  },
  "ca007d5c-6102-4de2-87b1-7150fb5d31a7": {
    text: <span className="cashportIATextGradient">Aprobado IA</span>,
    color: "#6f25b6",
    icon: <Sparkle size={14} weight="fill" />,
    backgroundColor: "#f0eafb"
  },
  "cdc3af46-5ba3-416b-bc76-0aa825efb1aa": {
    text: "Rechazado IA",
    color: "#1e5d90",
    icon: <Sparkle size={14} weight="fill" />,
    backgroundColor: "#dfe5ea"
  },
  "c02b3475-f59a-4222-bb28-9dbb51cf02c1": {
    text: "Pendiente",
    color: "#92400e",
    icon: <Clock size={16} />,
    backgroundColor: "#fef2ca"
  },
  "dcf4e68b-11cb-4352-8ea7-f6356fa98db9": {
    text: "Aprobado",
    color: "#065f46",
    icon: <CheckCircle size={16} />,
    backgroundColor: "#d9f4e8"
  }
};

export const STATUS_CONFIG_MAP: Record<DocumentStatusId, StatusDetailsConfig> = {
  "a88b6d87-42f2-45f1-b45b-562ef43a3d19": {
    text: "No clasificado",
    color: "#92400e",
    iconFactory: (size) => <Clock size={size} />, // Función que crea el icono
    backgroundColor: "#fef2ca"
  },
  "532d6b7f-03da-4d22-9c28-2ef69590608f": {
    text: "En revisión",
    color: "#2143b0",
    iconFactory: (size) => <MagnifyingGlass size={size} />,
    backgroundColor: "#e2ecfe"
  },
  "5081de05-745d-449c-aff5-086e0d8b47a0": {
    text: "Rechazado",
    color: "#e7092b",
    iconFactory: (size) => <XCircle size={size} />,
    backgroundColor: "#fce6e9"
  },
  "ca007d5c-6102-4de2-87b1-7150fb5d31a7": {
    text: <span className="cashportIATextGradient">Aprobado IA</span>,
    color: "#6f25b6",
    // Mantenemos props fijas como 'weight' dentro de la función
    iconFactory: (size) => <Sparkle size={size - 2} weight="fill" />,
    backgroundColor: "#f0eafb",
    textWrapper: (text) => <span className="cashportIATextGradient">{text}</span> // Función opcional para envolver el texto
  },
  "cdc3af46-5ba3-416b-bc76-0aa825efb1aa": {
    text: "Rechazado IA",
    color: "#1e5d90",
    iconFactory: (size) => <Sparkle size={size - 2} weight="fill" />,
    backgroundColor: "#dfe5ea"
  },
  "c02b3475-f59a-4222-bb28-9dbb51cf02c1": {
    text: "Pendiente",
    color: "#92400e",
    iconFactory: (size) => <Clock size={size} />,
    backgroundColor: "#fef2ca"
  },
  "dcf4e68b-11cb-4352-8ea7-f6356fa98db9": {
    text: "Aprobado",
    color: "#065f46",
    iconFactory: (size) => <CheckCircle size={size} />,
    backgroundColor: "#d9f4e8"
  }
};

// Configuración por defecto para usar en el fallback
const defaultStatusConfig: StatusDetailsConfig = {
  text: "Estado desconocido",
  color: "#000",
  backgroundColor: "#f0f0f0",
  iconFactory: (size) => <Clock size={size} />
};

export const getStatusDetails = (
  id: string,
  options?: {
    // Agrupamos opciones en un objeto para claridad
    iconSize?: number;
    fallbackName?: string;
    fallbackColor?: string;
    fallbackBackgroundColor?: string;
  }
): StatusDetails => {
  const { iconSize = 16, fallbackName, fallbackColor, fallbackBackgroundColor } = options ?? {};

  let baseConfig = STATUS_CONFIG_MAP[id as DocumentStatusId];

  // Si el ID no existe, crea una configuración de fallback sobre la marcha
  if (!baseConfig) {
    console.warn(`Status ID desconocido: ${id}. Usando fallback.`);
    baseConfig = {
      text: fallbackName ?? defaultStatusConfig.text,
      color: fallbackColor ?? defaultStatusConfig.color,
      backgroundColor: fallbackBackgroundColor ?? defaultStatusConfig.backgroundColor,
      iconFactory: defaultStatusConfig.iconFactory
    };
  }

  // Llama a la función iconFactory con el tamaño deseado para generar el icono
  const finalIcon = baseConfig.iconFactory(iconSize);

  return {
    text: baseConfig.text,
    color: baseConfig.color,
    backgroundColor: baseConfig.backgroundColor,
    icon: finalIcon,
    textWrapper: baseConfig.textWrapper
  };
};
