import { ClaimEstado } from "./types";

export const CLAIM_ESTADOS: ClaimEstado[] = [
  "Lista para pago",
  "En disputa",
  "Con novedad",
  "Contestada",
  "Aceptada"
];

export const ESTADO_CLAIM_META: Record<ClaimEstado, { bg: string; text: string; dot: string }> = {
  "Lista para pago": { bg: "rgba(22,163,74,0.12)", text: "#16a34a", dot: "#16a34a" },
  "En disputa": { bg: "rgba(220,38,38,0.12)", text: "#dc2626", dot: "#dc2626" },
  "Con novedad": { bg: "rgba(217,119,6,0.14)", text: "#d97706", dot: "#d97706" },
  Contestada: { bg: "rgba(37,99,235,0.12)", text: "#2563eb", dot: "#2563eb" },
  Aceptada: { bg: "rgba(22,163,74,0.12)", text: "#16a34a", dot: "#16a34a" }
};

export const CONCEPTOS: { codigo: string; label: string }[] = [
  { codigo: "GL-101", label: "Diferencia en tarifa contratada" },
  { codigo: "GL-102", label: "Falta soporte de autorización" },
  { codigo: "GL-103", label: "Copago / cuota moderadora no aplicada" },
  { codigo: "GL-104", label: "Pertinencia médica del servicio" },
  { codigo: "GL-105", label: "Estancia hospitalaria no justificada" },
  { codigo: "GL-106", label: "Insumo no pactado en contrato" },
  { codigo: "GL-107", label: "Medicamento no incluido en plan" },
  { codigo: "GL-108", label: "Autorización vencida" },
  { codigo: "GL-109", label: "Facturación duplicada" },
  { codigo: "GL-110", label: "Servicio no incluido en el POS" },
  { codigo: "GL-111", label: "Error en liquidación de honorarios" },
  { codigo: "GL-112", label: "Diferencia en cantidad facturada" },
  { codigo: "GL-113", label: "Soporte clínico incompleto" },
  { codigo: "GL-114", label: "Procedimiento no autorizado" },
  { codigo: "GL-115", label: "Glosa administrativa" }
];

export const DATE_FORMAT = "DD/MM/YYYY";
