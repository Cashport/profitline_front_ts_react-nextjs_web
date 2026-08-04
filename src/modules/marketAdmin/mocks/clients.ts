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

export interface ClienteMock {
  id: string;
  nombre: string;
  nit: string;
  ciudad: string;
  canal: string;
  estado: "Activo" | "Inactivo";
  usuarios: number;
  productos: number;
  lineas: string[];
}

export const CLIENTES_MOCK: ClienteMock[] = [
  {
    id: "c1",
    nombre: "Clínica Dermatológica Piel Sana",
    nit: "900.123.456-1",
    ciudad: "Bogotá",
    canal: "Institucional",
    estado: "Activo",
    usuarios: 3,
    productos: 12,
    lineas: ["Estética", "Institucional"]
  },
  {
    id: "c2",
    nombre: "Centro Médico Estética Avanzada",
    nit: "800.987.321-2",
    ciudad: "Medellín",
    canal: "Retail",
    estado: "Activo",
    usuarios: 2,
    productos: 8,
    lineas: ["Estética", "Alastin"]
  },
  {
    id: "c3",
    nombre: "Dermocentro S.A.S",
    nit: "830.456.789-3",
    ciudad: "Cali",
    canal: "Institucional",
    estado: "Inactivo",
    usuarios: 1,
    productos: 5,
    lineas: ["Institucional"]
  }
];
