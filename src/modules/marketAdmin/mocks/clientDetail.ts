// Mock data + tipos para la vista de detalle de cliente del Market Admin.

export const LINEAS_CATALOGO: Record<string, { id: string; nombre: string }[]> = {
  Estética: [
    { id: "e1", nombre: "Restylane Volyme 1ml" },
    { id: "e2", nombre: "Restylane Defyne 1ml" },
    { id: "e3", nombre: "Sculptra 2 vials" }
  ],
  Rellenos: [
    { id: "r1", nombre: "Juvéderm Ultra 1ml" },
    { id: "r2", nombre: "Juvéderm Voluma 1ml" },
    { id: "r3", nombre: "Teosyal RHA 1ml" }
  ],
  Institucional: [
    { id: "i1", nombre: "Dysport 300U" },
    { id: "i2", nombre: "Botox 100U" },
    { id: "i3", nombre: "Xeomin 100U" }
  ],
  Alastin: [
    { id: "a1", nombre: "Alastin Regenerating Serum 29.6ml" },
    { id: "a2", nombre: "Alastin Restorative Skin Complex" },
    { id: "a3", nombre: "Alastin HydraTint SPF 36" }
  ],
  Retail: [
    { id: "rt1", nombre: "Cetaphil Crema Hidratante 250ml" },
    { id: "rt2", nombre: "Cetaphil Loción Humectante 473ml" },
    { id: "rt3", nombre: "Cetaphil Limpiador Suave 500ml" }
  ]
};

export type ProductoLinea = { id: string; nombre: string; linea: string; activo: boolean };

export const PRODUCTOS_INIT: Record<string, ProductoLinea[]> = {
  c1: [
    { id: "e1", nombre: "Restylane Volyme 1ml", linea: "Estética", activo: true },
    { id: "e2", nombre: "Restylane Defyne 1ml", linea: "Estética", activo: true },
    { id: "e3", nombre: "Sculptra 2 vials", linea: "Estética", activo: false },
    { id: "i1", nombre: "Dysport 300U", linea: "Institucional", activo: true },
    { id: "i2", nombre: "Botox 100U", linea: "Institucional", activo: true },
    { id: "i3", nombre: "Xeomin 100U", linea: "Institucional", activo: false }
  ],
  c2: [
    { id: "e1", nombre: "Restylane Volyme 1ml", linea: "Estética", activo: true },
    { id: "e2", nombre: "Restylane Defyne 1ml", linea: "Estética", activo: false },
    { id: "a1", nombre: "Alastin Regenerating Serum 29.6ml", linea: "Alastin", activo: true },
    { id: "a2", nombre: "Alastin Restorative Skin Complex", linea: "Alastin", activo: true }
  ]
};
