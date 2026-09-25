// Shared mock data + helpers for the Market Admin clients list and detail views.

// Paleta de colores por línea de negocio
export const LINEA_COLORS: Record<string, { bg: string; text: string }> = {
  Estética: { bg: "#F97316", text: "#fff" },
  Institucional: { bg: "#141414", text: "#fff" },
  Alastin: { bg: "#7C4DFF", text: "#fff" },
  Retail: { bg: "#0067B1", text: "#fff" },
  Rellenos: { bg: "#059669", text: "#fff" }
};

export function lineaAbrev(linea: string) {
  return linea.slice(0, 3).toUpperCase();
}

