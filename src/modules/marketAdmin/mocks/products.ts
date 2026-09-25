// Shared mock data + helpers for the Market Admin products list and detail views.

export interface ProductoSku {
  sku: string;
  descripcion: string;
  precio: number;
}

export interface ProductoAdminMock {
  id: string;
  nombre: string;
  nombreVisible: string;
  linea: string;
  canal: string;
  skus: number;
  activo: boolean;
  imagen: string;
  precioBase: number;
  lotes: string[];
  skuList: ProductoSku[];
}

export const formatPrice = (n: number) => "$ " + n.toLocaleString("es-CO");

export const PRODUCTOS_ADMIN_MOCK: ProductoAdminMock[] = [
  {
    id: "pa1",
    nombre: "Restylane Volyme 1ml",
    nombreVisible: "Restylane Volyme 1ml",
    linea: "Rellenos",
    canal: "Institucional",
    skus: 2,
    activo: true,
    imagen: "",
    precioBase: 850000,
    lotes: ["L2024-001", "L2024-002"],
    skuList: [{ sku: "RST-VOL-1ML", descripcion: "Jeringa 1ml", precio: 850000 }]
  },
  {
    id: "pa2",
    nombre: "Sculptra 2 Vials",
    nombreVisible: "Sculptra 2 Vials",
    linea: "Bioestimuladores",
    canal: "Institucional",
    skus: 1,
    activo: true,
    imagen: "",
    precioBase: 1200000,
    lotes: ["L2024-003"],
    skuList: [{ sku: "SCP-2VL", descripcion: "Kit 2 viales 150mg", precio: 1200000 }]
  },
  {
    id: "pa3",
    nombre: "Dysport 300U",
    nombreVisible: "Dysport 300U",
    linea: "Toxina",
    canal: "Institucional",
    skus: 1,
    activo: false,
    imagen: "",
    precioBase: 480000,
    lotes: [],
    skuList: [{ sku: "DYS-300U", descripcion: "Vial 300U", precio: 480000 }]
  },
  {
    id: "pa4",
    nombre: "Cetaphil Crema Hidratante 250ml",
    nombreVisible: "Crema Hidratante Diaria 250ml",
    linea: "Dermocosmética",
    canal: "Retail",
    skus: 1,
    activo: true,
    imagen: "",
    precioBase: 42800,
    lotes: ["L2024-010", "L2024-011"],
    skuList: [{ sku: "CTH-CH-250", descripcion: "Crema 250ml", precio: 42800 }]
  },
  {
    id: "pa5",
    nombre: "Cetaphil Loción Humectante 473ml",
    nombreVisible: "Loción Humectante 473ml",
    linea: "Dermocosmética",
    canal: "Retail",
    skus: 1,
    activo: true,
    imagen: "",
    precioBase: 58500,
    lotes: ["L2024-013"],
    skuList: [{ sku: "CTH-LH-473", descripcion: "Loción 473ml", precio: 58500 }]
  },
  {
    id: "pa6",
    nombre: "Restylane Defyne 1ml",
    nombreVisible: "Restylane Defyne 1ml",
    linea: "Rellenos",
    canal: "Institucional",
    skus: 2,
    activo: true,
    imagen: "",
    precioBase: 780000,
    lotes: ["L2024-020"],
    skuList: [{ sku: "RST-DEF-1ML", descripcion: "Jeringa 1ml", precio: 780000 }]
  },
  {
    id: "pa7",
    nombre: "Azzalure 125U",
    nombreVisible: "Azzalure 125U",
    linea: "Toxina",
    canal: "Institucional",
    skus: 1,
    activo: true,
    imagen: "",
    precioBase: 320000,
    lotes: ["L2024-021"],
    skuList: [{ sku: "AZZ-125U", descripcion: "Vial 125U", precio: 320000 }]
  },
  {
    id: "pa8",
    nombre: "Cetaphil Protector SPF50 100ml",
    nombreVisible: "Protector Solar SPF50 100ml",
    linea: "Dermocosmética",
    canal: "Retail",
    skus: 1,
    activo: true,
    imagen: "",
    precioBase: 72000,
    lotes: ["L2024-015"],
    skuList: [{ sku: "CTH-PS-100", descripcion: "Protector 100ml", precio: 72000 }]
  },
  {
    id: "pa9",
    nombre: "Radiesse 1.5ml",
    nombreVisible: "Radiesse 1.5ml",
    linea: "Bioestimuladores",
    canal: "Institucional",
    skus: 1,
    activo: false,
    imagen: "",
    precioBase: 950000,
    lotes: [],
    skuList: [{ sku: "RAD-1-5ML", descripcion: "Jeringa 1.5ml", precio: 950000 }]
  },
  {
    id: "pa10",
    nombre: "Belotero Balance 1ml",
    nombreVisible: "Belotero Balance 1ml",
    linea: "Rellenos",
    canal: "Institucional",
    skus: 1,
    activo: true,
    imagen: "",
    precioBase: 690000,
    lotes: ["L2024-030"],
    skuList: [{ sku: "BEL-BAL-1ML", descripcion: "Jeringa 1ml", precio: 690000 }]
  },
  {
    id: "pa11",
    nombre: "Cetaphil Limpiador Gel 250ml",
    nombreVisible: "Gel Limpiador 250ml",
    linea: "Dermocosmética",
    canal: "Retail",
    skus: 1,
    activo: true,
    imagen: "",
    precioBase: 38000,
    lotes: ["L2024-016"],
    skuList: [{ sku: "CTH-GL-250", descripcion: "Gel 250ml", precio: 38000 }]
  },
  {
    id: "pa12",
    nombre: "Juvederm Ultra 2",
    nombreVisible: "Juvederm Ultra 2",
    linea: "Rellenos",
    canal: "Institucional",
    skus: 2,
    activo: true,
    imagen: "",
    precioBase: 920000,
    lotes: ["L2024-031", "L2024-032"],
    skuList: [{ sku: "JUV-ULT-2", descripcion: "Jeringa 0.55ml", precio: 920000 }]
  }
];
