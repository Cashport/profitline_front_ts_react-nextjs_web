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

export type Direccion = { id: string; direccion: string; ciudad: string; bodega: string };

export const DIRECCIONES_CLIENTE: Record<string, Direccion[]> = {
  c1: [
    { id: "dir1", direccion: "Calle 127 # 20-45", ciudad: "Bogotá", bodega: "Bodega Norte" },
    { id: "dir2", direccion: "Carrera 7 # 32-18 Of 301", ciudad: "Bogotá", bodega: "Bodega Sur" },
    { id: "dir3", direccion: "Av. El Dorado # 68A-51", ciudad: "Bogotá", bodega: "Bodega Centro" }
  ],
  c2: [
    { id: "dir1", direccion: "Calle 10 # 40-20", ciudad: "Medellín", bodega: "Bodega Poblado" },
    { id: "dir2", direccion: "Carrera 43A # 1-50", ciudad: "Medellín", bodega: "Bodega Centro" }
  ]
};
export const DEFAULT_DIRECCIONES: Direccion[] = [];

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

export type UsuarioCliente = { id: string; nombre: string; email: string; rol: string };

export const USUARIOS_CLIENTE: Record<string, UsuarioCliente[]> = {
  c1: [
    { id: "u1", nombre: "Andrea Torres", email: "andrea@pielsana.com", rol: "Comprador" },
    { id: "u2", nombre: "Jorge Martínez", email: "jorge@pielsana.com", rol: "Admin" },
    { id: "u3", nombre: "Laura Gómez", email: "laura@pielsana.com", rol: "Comprador" }
  ],
  c2: [
    { id: "u1", nombre: "Camila Ríos", email: "camila@esteticavanzada.com", rol: "Admin" },
    { id: "u2", nombre: "Sebastián Ruiz", email: "sebastian@esteticavanzada.com", rol: "Comprador" }
  ]
};
export const DEFAULT_USUARIOS: UsuarioCliente[] = [
  { id: "u1", nombre: "Usuario Demo", email: "demo@cliente.com", rol: "Comprador" }
];

export const BLANK_DIR: Omit<Direccion, "id"> = { direccion: "", ciudad: "", bodega: "" };
export const BLANK_NEG: NegociacionForm = {
  nombre: "",
  vigencia: "",
  adjunto: null,
  descuentoGlobal: "",
  items: []
};
