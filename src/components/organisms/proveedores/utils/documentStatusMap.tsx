import { CheckCircle, Clock, MagnifyingGlass, Sparkle, XCircle } from "phosphor-react";
import { ReactElement } from "react";

export type DocumentStatusId =
  | "a88b6d87-42f2-45f1-b45b-562ef43a3d19"
  | "532d6b7f-03da-4d22-9c28-2ef69590608f"
  | "5081de05-745d-449c-aff5-086e0d8b47a0"
  | "ca007d5c-6102-4de2-87b1-7150fb5d31a7"
  | "cdc3af46-5ba3-416b-bc76-0aa825efb1aa"
  | "c02b3475-f59a-4222-bb28-9dbb51cf02c1"
  | "dcf4e68b-11cb-4352-8ea7-f6356fa98db9";

export interface StatusDetails {
  text: string;
  color: string;
  backgroundColor: string;
  icon: ReactElement;
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
    text: "Aprobado IA",
    color: "#6f25b6",
    icon: <Sparkle size={16} />,
    backgroundColor: "#f0eafb"
  },
  "cdc3af46-5ba3-416b-bc76-0aa825efb1aa": {
    text: "Rechazado IA",
    color: "#1e5d90",
    icon: <Sparkle size={16} />,
    backgroundColor: "#dfe5ea"
  },
  "c02b3475-f59a-4222-bb28-9dbb51cf02c1": {
    text: "Pendiente",
    color: "#92400e",
    icon: <Clock size={16} />,
    backgroundColor: "#fef2ca"
  },
  "dcf4e68b-11cb-4352-8ea7-f6356fa98db9": {
    text: "Vigente",
    color: "#065f46",
    icon: <CheckCircle size={16} />,
    backgroundColor: "#d9f4e8"
  }
};

// Fallback si el ID no es válido
export const getStatusDetails = (
  id: string,
  fallbackName?: string,
  fallbackColor?: string,
  fallbackBackgroundColor?: string
): StatusDetails => {
  return (
    STATUS_MAP[id as DocumentStatusId] ?? {
      text: fallbackName ?? "Estado desconocido",
      color: fallbackColor ?? "#000",
      backgroundColor: fallbackBackgroundColor ?? "#f0f0f0",
      icon: <Clock size={16} />
    }
  );
};
