// Mock data + tipos para la vista de detalle de cliente del Market Admin.

import { EstadoAprobacion } from "@/types/marketAdmin/IMarketAdmin";

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

export type NegLineaItem = {
  productoId: string;
  productoNombre: string;
  linea: string;
  descuento: number;
  selected: boolean;
};
export type NegociacionForm = {
  nombre: string;
  vigencia: string;
  adjunto: File | null;
  descuentoGlobal: string;
  items: NegLineaItem[];
};

export type LineaDescuento = { productoId: string; productoNombre: string; descuento: number };
export type Negociacion = {
  id: string;
  nombre: string;
  estado: "Activo" | "Inactivo" | "En aprobación";
  fechaCreacion: string;
  fechaVencimiento: string;
  adjunto: string | null;
  autorizadoPor: string | null;
  creadoPor: string;
  lineas: LineaDescuento[];
};

export const NEGOCIACIONES_INIT: Record<string, Negociacion[]> = {
  c1: [
    {
      id: "neg1",
      nombre: "Negociación Q1 2025",
      estado: "Activo",
      fechaCreacion: "2025-01-10",
      fechaVencimiento: "2025-12-31",
      adjunto: "contrato_q1.pdf",
      autorizadoPor: "María González",
      creadoPor: "Carlos Pérez",
      lineas: [
        { productoId: "e1", productoNombre: "Restylane Volyme 1ml", descuento: 25 },
        { productoId: "i1", productoNombre: "Dysport 300U", descuento: 15 }
      ]
    },
    {
      id: "neg2",
      nombre: "Promo Semestre 2025",
      estado: "En aprobación",
      fechaCreacion: "2025-06-03",
      fechaVencimiento: "2025-06-30",
      adjunto: null,
      autorizadoPor: null,
      creadoPor: "Ana Rodríguez",
      lineas: [
        { productoId: "e2", productoNombre: "Restylane Defyne 1ml", descuento: 20 },
        { productoId: "i2", productoNombre: "Botox 100U", descuento: 10 },
        { productoId: "a1", productoNombre: "Alastin Regenerating Serum 29.6ml", descuento: 18 }
      ]
    }
  ],
  c2: [
    {
      id: "neg1",
      nombre: "Acuerdo Anual 2025",
      estado: "Activo",
      fechaCreacion: "2025-02-15",
      fechaVencimiento: "2025-12-31",
      adjunto: "acuerdo_2025.pdf",
      autorizadoPor: "Laura Restrepo",
      creadoPor: "Juan Vélez",
      lineas: [
        { productoId: "e1", productoNombre: "Restylane Volyme 1ml", descuento: 22 },
        { productoId: "a1", productoNombre: "Alastin Regenerating Serum 29.6ml", descuento: 12 }
      ]
    }
  ]
};
export const DEFAULT_NEGOCIACIONES: Negociacion[] = [];

export const BLANK_NEG: NegociacionForm = {
  nombre: "",
  vigencia: "",
  adjunto: null,
  descuentoGlobal: "",
  items: []
};

// ── Bonificados manuales ────────────────────────────────────────────────────

export const PRODUCTOS_BONIFICADOS_LIST = [
  "SCULPTRA INJPRO 2 VIAL",
  "RESTYLANE SB VITAL LIDO 1ml",
  "RESTYLANE VOLYME 1ml",
  "RESTYLANE REFYNE 1ml",
  "REST LYFT LIDO 1ml",
  "RESTYLANE LIDOCAINA 1ml",
  "RESTYLANE KYSSE 1ml",
  "RESTYLANE DEFYNE 1ml"
];

export type BonifManual = {
  id: string;
  producto: string;
  unidades: number;
  estado: EstadoAprobacion;
  creadoEn: string;
  nota: string;
};

export const BONIFICADOS_MANUALES_INIT: BonifManual[] = [
  {
    id: "bm1",
    producto: "SCULPTRA INJPRO 2 VIAL",
    unidades: 5,
    estado: "aprobado",
    creadoEn: "2026-04-10",
    nota: "Premio Q1"
  },
  {
    id: "bm2",
    producto: "RESTYLANE KYSSE 1ml",
    unidades: 3,
    estado: "pendiente",
    creadoEn: "2026-06-01",
    nota: ""
  }
];

export const BLANK_BONIF = {
  producto: PRODUCTOS_BONIFICADOS_LIST[0],
  unidades: 1,
  nota: ""
};
