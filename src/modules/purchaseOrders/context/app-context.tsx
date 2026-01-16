"use client";

import type React from "react";

import { createContext, useContext, useReducer, type ReactNode } from "react";
import { useRouter } from "next/navigation";

interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  actor?: string;
  timestamp: string;
  type: "status_change" | "approval" | "rejection" | "comment" | "system";
  metadata?: Record<string, any>;
}

interface InvoiceData {
  autoId: number;
  id: string;
  fechaFactura: string;
  fechaEntrega?: string;
  direccion?: string;
  ciudad?: string;
  observacion?: string;
  comprador: string;
  vendedor: string;
  estado:
    | "Novedad"
    | "En validación"
    | "En aprobaciones"
    | "En facturación"
    | "Facturado"
    | "En despacho"
    | "Entregado"
    | "Back order";
  factura?: string[];
  cantidad: number;
  monto: number;
  numeroFactura: string;
  fechaVencimiento?: string;
  productos: Array<{
    idProducto: string;
    nombreProducto: string;
    cantidad: number;
    precioUnitario: number;
    iva: number;
    precioTotal: number;
  }>;
  alertas: string[];
  fechaProcesamiento: string;
  archivoOriginal: string;
  pdfUrl?: string;
  tipoNovedad?:
    | "No tiene cupo"
    | "No tiene stock"
    | "No cumple especificaciones de entrega"
    | "Cantidad fuera de promedio"
    | "Nuevo punto de entrega"
    | "No es posible cumplir con la entrega"
    | "No coincide la lista de precios y/o productos";
  timeline?: TimelineEvent[];
}

interface AppState {
  invoices: InvoiceData[];
  currentView: "dashboard" | "detail";
  selectedInvoice: InvoiceData | null;
  filterState: string | null;
  filterComprador: string | null;
  filterVendedor: string | null;
  filterDateRange: { start: string | null; end: string | null };
  selectedInvoiceIds: string[];
}

type AppAction =
  | { type: "ADD_INVOICE"; payload: InvoiceData }
  | { type: "UPDATE_INVOICE"; payload: InvoiceData }
  | { type: "SET_CURRENT_VIEW"; payload: "dashboard" | "detail" }
  | { type: "SET_SELECTED_INVOICE"; payload: InvoiceData | null }
  | { type: "SET_FILTER_STATE"; payload: string | null }
  | { type: "SET_FILTER_COMPRADOR"; payload: string | null }
  | { type: "SET_FILTER_VENDEDOR"; payload: string | null }
  | { type: "SET_FILTER_DATE_RANGE"; payload: { start: string | null; end: string | null } }
  | { type: "DELETE_INVOICE"; payload: string }
  | { type: "TOGGLE_INVOICE_SELECTION"; payload: string }
  | { type: "SELECT_ALL_INVOICES"; payload: string[] }
  | { type: "CLEAR_SELECTION" };

const initialState: AppState = {
  invoices: [
    {
      autoId: 1,
      id: "4501972451",
      numeroFactura: "F-2024-001",
      fechaFactura: "2024-01-15",
      fechaEntrega: "2024-01-20 14:30",
      direccion: "Calle 123 #45-67",
      ciudad: "Bogotá",
      observacion: "Entrega en horario de oficina",
      comprador: "Comercializadora del Norte S.A.S",
      vendedor: "Distribuidora Central Ltda",
      fechaVencimiento: "2024-02-15",
      cantidad: 150,
      monto: 2850000,
      factura: ["VT-227638", "VT-227947", "VT-227948"],
      productos: [
        {
          idProducto: "PROD-001",
          nombreProducto: "Laptop Dell Inspiron 15",
          cantidad: 10,
          precioUnitario: 180000,
          iva: 34200,
          precioTotal: 1800000
        },
        {
          idProducto: "PROD-002",
          nombreProducto: "Mouse inalámbrico Logitech",
          cantidad: 25,
          precioUnitario: 42000,
          iva: 7980,
          precioTotal: 1050000
        },
        {
          idProducto: "PROMO-001",
          nombreProducto: "Mousepad promocional",
          cantidad: 15,
          precioUnitario: 0,
          iva: 0,
          precioTotal: 0
        }
      ],
      alertas: [],
      estado: "Entregado",
      fechaProcesamiento: "2024-01-15",
      archivoOriginal: "factura-001.pdf",
      pdfUrl: "http://example.com/pdf/4501972451.pdf",
      timeline: [
        {
          id: "1",
          title: "Orden de compra creada",
          description: "Orden de compra recibida del sistema",
          actor: "Sistema",
          timestamp: "2024-01-15 09:00",
          type: "system"
        },
        {
          id: "2",
          title: "Documento procesado",
          description: "Extracción de datos completada",
          actor: "Sistema OCR",
          timestamp: "2024-01-15 09:05",
          type: "system"
        },
        {
          id: "3",
          title: "Validación iniciada",
          description: "Orden enviada a proceso de validación",
          actor: "Sistema",
          timestamp: "2024-01-15 09:15",
          type: "status_change"
        },
        {
          id: "4",
          title: "Validación de datos",
          description: "Verificación de información del cliente y productos",
          actor: "Sistema de validación",
          timestamp: "2024-01-15 09:30",
          type: "system"
        },
        {
          id: "5",
          title: "Verificación de inventario",
          description: "Stock disponible confirmado para todos los productos",
          actor: "Sistema de inventario",
          timestamp: "2024-01-15 10:00",
          type: "system"
        },
        {
          id: "6",
          title: "Validaciones completadas",
          description: "Todas las validaciones automáticas superadas",
          actor: "Sistema",
          timestamp: "2024-01-15 10:30",
          type: "status_change"
        },
        {
          id: "7",
          title: "Enviada a aprobación",
          description: "Orden requiere aprobación por múltiples áreas",
          actor: "Sistema",
          timestamp: "2024-01-15 10:45",
          type: "status_change"
        },
        {
          id: "8",
          title: "Aprobación de Cartera",
          description:
            "Cupo de crédito verificado y aprobado - Cliente con cupo disponible de $15.500.000",
          actor: "Miguel Martínez",
          timestamp: "2024-01-15 11:30",
          type: "approval"
        },
        {
          id: "9",
          title: "Aprobación Financiera",
          description: "Términos de pago y condiciones financieras aprobadas",
          actor: "Ana López",
          timestamp: "2024-01-15 12:00",
          type: "approval"
        },
        {
          id: "10",
          title: "Aprobación de KAM",
          description:
            "Orden aprobada por Key Account Manager - Condiciones comerciales verificadas",
          actor: "Carlos Pérez",
          timestamp: "2024-01-15 13:00",
          type: "approval"
        },
        {
          id: "11",
          title: "Aprobaciones completadas",
          description: "Todas las aprobaciones requeridas obtenidas exitosamente",
          actor: "Sistema",
          timestamp: "2024-01-15 13:15",
          type: "system"
        },
        {
          id: "12",
          title: "Enviada a facturación",
          description: "Orden lista para generar documentos de facturación",
          actor: "Sistema",
          timestamp: "2024-01-15 14:00",
          type: "status_change"
        },
        {
          id: "13",
          title: "Factura generada",
          description: "Facturas electrónicas generadas: VT-227638, VT-227947, VT-227948",
          actor: "Sistema de facturación",
          timestamp: "2024-01-16 09:00",
          type: "status_change"
        },
        {
          id: "14",
          title: "Factura enviada al cliente",
          description: "Documentos electrónicos enviados al correo del cliente",
          actor: "Sistema de facturación",
          timestamp: "2024-01-16 09:15",
          type: "system"
        },
        {
          id: "15",
          title: "Orden enviada a logística",
          description: "Orden enviada al centro de distribución para preparación",
          actor: "Sistema",
          timestamp: "2024-01-16 14:00",
          type: "status_change"
        },
        {
          id: "16",
          title: "Preparación de despacho",
          description: "Productos separados y empaquetados para envío",
          actor: "Laura Gómez",
          timestamp: "2024-01-17 08:00",
          type: "system"
        },
        {
          id: "17",
          title: "Despacho en ruta",
          description: "Orden en tránsito hacia destino - Guía de transporte #GT-2024-0156",
          actor: "Transportadora Express",
          timestamp: "2024-01-18 07:00",
          type: "status_change"
        },
        {
          id: "18",
          title: "En zona de entrega",
          description: "Vehículo de entrega llegó a la zona del cliente",
          actor: "Transportadora Express",
          timestamp: "2024-01-20 13:45",
          type: "system"
        },
        {
          id: "19",
          title: "Orden entregada",
          description: "Orden entregada y recibida exitosamente por el cliente",
          actor: "Transportadora Express",
          timestamp: "2024-01-20 14:30",
          type: "status_change"
        },
        {
          id: "20",
          title: "Confirmación de recepción",
          description: "Cliente confirmó recepción conforme de todos los productos",
          actor: "Comercializadora del Norte S.A.S",
          timestamp: "2024-01-20 14:45",
          type: "system"
        }
      ]
    },
    {
      autoId: 2,
      id: "202508304463N",
      numeroFactura: "F-2024-002",
      fechaFactura: "2024-01-14",
      fechaEntrega: "2024-01-19 10:00",
      direccion: "Carrera 45 #12-34",
      ciudad: "Medellín",
      observacion: "Llamar antes de entregar",
      comprador: "Tecnología Avanzada S.A",
      vendedor: "Suministros Industriales Ltda",
      cantidad: 75,
      monto: 1875000,
      productos: [
        {
          idProducto: "SERV-001",
          nombreProducto: "Mantenimiento equipos industriales",
          cantidad: 5,
          precioUnitario: 250000,
          iva: 47500,
          precioTotal: 1250000
        },
        {
          idProducto: "SERV-002",
          nombreProducto: "Instalación software especializado",
          cantidad: 25,
          precioUnitario: 25000,
          iva: 4750,
          precioTotal: 625000
        }
      ],
      alertas: ["Pendiente confirmación de pago"],
      estado: "En validación",
      fechaProcesamiento: "2024-01-14",
      archivoOriginal: "factura-002.pdf",
      pdfUrl: "http://example.com/pdf/202508304463N.pdf",
      timeline: [
        {
          id: "1",
          title: "Orden de compra recibida",
          description: "Documento cargado al sistema",
          actor: "Sistema",
          timestamp: "2024-01-14 14:00",
          type: "system"
        }
      ]
    },
    {
      autoId: 3,
      id: "202508301132N",
      numeroFactura: "F-2024-003",
      fechaFactura: "2024-01-13",
      fechaEntrega: "2024-01-18 16:00",
      direccion: "Avenida 68 #89-12",
      ciudad: "Cali",
      observacion: "Portería principal",
      comprador: "Retail Solutions S.A.S",
      vendedor: "Proveedores Unidos Ltda",
      cantidad: 200,
      monto: 4200000,
      productos: [
        {
          idProducto: "PROD-003",
          nombreProducto: "Tablet Samsung Galaxy Tab A8",
          cantidad: 15,
          precioUnitario: 220000,
          iva: 41800,
          precioTotal: 3300000
        },
        {
          idProducto: "PROD-004",
          nombreProducto: "Cargador USB-C rápido",
          cantidad: 30,
          precioUnitario: 30000,
          iva: 5700,
          precioTotal: 900000
        },
        {
          idProducto: "PROMO-002",
          nombreProducto: "Funda protectora gratis",
          cantidad: 15,
          precioUnitario: 0,
          iva: 0,
          precioTotal: 0
        },
        {
          idProducto: "PROMO-003",
          nombreProducto: "Cable USB promocional",
          cantidad: 10,
          precioUnitario: 0,
          iva: 0,
          precioTotal: 0
        }
      ],
      alertas: [],
      estado: "En validación",
      fechaProcesamiento: "2024-01-13",
      archivoOriginal: "factura-003.pdf",
      pdfUrl: "http://example.com/pdf/202508301132N.pdf",
      timeline: [
        {
          id: "1",
          title: "Orden de compra creada",
          actor: "Sistema",
          timestamp: "2024-01-13 09:00",
          type: "system"
        },
        {
          id: "2",
          title: "Iniciado proceso de validación",
          description: "Orden enviada al equipo de validación",
          actor: "Sistema",
          timestamp: "2024-01-13 09:15",
          type: "status_change"
        }
      ]
    },
    {
      autoId: 4,
      id: "202508302266N",
      numeroFactura: "F-2024-004",
      fechaFactura: "2024-01-12",
      fechaEntrega: "2024-01-17 09:30",
      direccion: "Calle 50 #23-45",
      ciudad: "Barranquilla",
      observacion: "Verificar productos al recibir",
      comprador: "Empresas Asociadas S.A",
      vendedor: "Distribuidora Central Ltda",
      cantidad: 85,
      monto: 3400000,
      productos: [
        {
          idProducto: "PROD-005",
          nombreProducto: "Monitor LED 24 pulgadas",
          cantidad: 20,
          precioUnitario: 150000,
          iva: 28500,
          precioTotal: 3000000
        },
        {
          idProducto: "PROD-006",
          nombreProducto: "Cable HDMI 2 metros",
          cantidad: 40,
          precioUnitario: 10000,
          iva: 1900,
          precioTotal: 400000
        }
      ],
      alertas: [],
      estado: "En aprobaciones",
      fechaProcesamiento: "2024-01-12",
      archivoOriginal: "factura-004.pdf",
      pdfUrl: "http://example.com/pdf/202508302266N.pdf",
      timeline: [
        {
          id: "1",
          title: "Orden de compra creada",
          actor: "Sistema",
          timestamp: "2024-01-12 10:00",
          type: "system"
        },
        {
          id: "2",
          title: "Validaciones completadas",
          description: "Todas las validaciones iniciales completadas",
          actor: "Sistema",
          timestamp: "2024-01-12 11:00",
          type: "status_change"
        },
        {
          id: "3",
          title: "Pendiente aprobación final",
          description: "Orden enviada para aprobación del KAM",
          actor: "Sistema",
          timestamp: "2024-01-12 12:00",
          type: "status_change"
        }
      ]
    },
    {
      autoId: 5,
      id: "202508307736N",
      numeroFactura: "F-2024-005",
      fechaFactura: "2024-01-11",
      fechaEntrega: "2024-01-16 11:00",
      direccion: "Carrera 15 #78-90",
      ciudad: "Cartagena",
      observacion: "Entrega urgente",
      comprador: "Soluciones Corporativas Ltda",
      vendedor: "Tecnología Avanzada S.A",
      cantidad: 120,
      monto: 2400000,
      productos: [
        {
          idProducto: "SERV-003",
          nombreProducto: "Consultoría tecnológica",
          cantidad: 40,
          precioUnitario: 50000,
          iva: 9500,
          precioTotal: 2000000
        },
        {
          idProducto: "SERV-004",
          nombreProducto: "Soporte técnico remoto",
          cantidad: 20,
          precioUnitario: 20000,
          iva: 3800,
          precioTotal: 400000
        }
      ],
      alertas: [],
      estado: "En facturación",
      fechaProcesamiento: "2024-01-11",
      archivoOriginal: "factura-005.pdf",
      pdfUrl: "http://example.com/pdf/202508307736N.pdf",
      timeline: [
        {
          id: "1",
          title: "Orden de compra creada",
          actor: "Sistema",
          timestamp: "2024-01-11 08:00",
          type: "system"
        },
        {
          id: "2",
          title: "Validaciones completadas",
          actor: "Sistema",
          timestamp: "2024-01-11 09:00",
          type: "status_change"
        },
        {
          id: "3",
          title: "Orden aprobada",
          description: "Aprobación completa por todos los niveles",
          actor: "Carlos Pérez",
          timestamp: "2024-01-11 10:00",
          type: "approval"
        },
        {
          id: "4",
          title: "Enviada a facturación",
          description: "Orden lista para generar factura",
          actor: "Sistema",
          timestamp: "2024-01-11 11:00",
          type: "status_change"
        }
      ]
    },
    {
      autoId: 6,
      id: "202508308899N",
      numeroFactura: "F-2024-006",
      fechaFactura: "2024-01-10",
      fechaEntrega: "2024-01-15 14:00",
      direccion: "Calle 80 #45-23",
      ciudad: "Bucaramanga",
      observacion: "Entrega en recepción",
      comprador: "Distribuidora del Sur Ltda",
      vendedor: "Proveedores Unidos Ltda",
      cantidad: 95,
      monto: 3200000,
      factura: ["VT-227949", "VT-228535"],
      productos: [
        {
          idProducto: "PROD-007",
          nombreProducto: "Impresora láser HP",
          cantidad: 8,
          precioUnitario: 350000,
          iva: 66500,
          precioTotal: 2800000
        },
        {
          idProducto: "PROD-008",
          nombreProducto: "Tóner negro",
          cantidad: 20,
          precioUnitario: 20000,
          iva: 3800,
          precioTotal: 400000
        }
      ],
      alertas: [],
      estado: "Facturado",
      fechaProcesamiento: "2024-01-10",
      archivoOriginal: "factura-006.pdf",
      pdfUrl: "http://example.com/pdf/202508308899N.pdf",
      timeline: [
        {
          id: "1",
          title: "Orden de compra creada",
          actor: "Sistema",
          timestamp: "2024-01-10 09:00",
          type: "system"
        },
        {
          id: "2",
          title: "Aprobaciones completadas",
          actor: "Carlos Pérez",
          timestamp: "2024-01-10 11:00",
          type: "approval"
        },
        {
          id: "3",
          title: "Factura generada",
          description: "Facturas: VT-227949, VT-228535",
          actor: "Sistema de facturación",
          timestamp: "2024-01-10 14:00",
          type: "status_change"
        }
      ]
    },
    {
      autoId: 7,
      id: "202508309922N",
      numeroFactura: "F-2024-007",
      fechaFactura: "2024-01-09",
      fechaEntrega: "2024-01-14 10:30",
      direccion: "Avenida 30 #12-45",
      ciudad: "Pereira",
      observacion: "Llamar al llegar",
      comprador: "Comercial del Eje S.A.S",
      vendedor: "Suministros Industriales Ltda",
      cantidad: 110,
      monto: 2900000,
      factura: ["VT-228536"],
      productos: [
        {
          idProducto: "PROD-009",
          nombreProducto: "Teclado mecánico",
          cantidad: 30,
          precioUnitario: 80000,
          iva: 15200,
          precioTotal: 2400000
        },
        {
          idProducto: "PROD-010",
          nombreProducto: "Mouse ergonómico",
          cantidad: 25,
          precioUnitario: 20000,
          iva: 3800,
          precioTotal: 500000
        }
      ],
      alertas: [],
      estado: "En despacho",
      fechaProcesamiento: "2024-01-09",
      archivoOriginal: "factura-007.pdf",
      pdfUrl: "http://example.com/pdf/202508309922N.pdf",
      timeline: [
        {
          id: "1",
          title: "Orden de compra creada",
          actor: "Sistema",
          timestamp: "2024-01-09 08:00",
          type: "system"
        },
        {
          id: "2",
          title: "Factura generada",
          description: "Factura: VT-228536",
          actor: "Sistema de facturación",
          timestamp: "2024-01-09 12:00",
          type: "status_change"
        },
        {
          id: "3",
          title: "Enviado a logística",
          description: "Orden en preparación para despacho",
          actor: "Laura Gómez",
          timestamp: "2024-01-09 14:00",
          type: "status_change"
        }
      ]
    },
    {
      autoId: 8,
      id: "202508310055N",
      numeroFactura: "F-2024-008",
      fechaFactura: "2024-01-08",
      fechaEntrega: "2024-01-13 15:00",
      direccion: "Carrera 70 #34-56",
      ciudad: "Manizales",
      observacion: "Verificar dirección",
      comprador: "Tecnología del Café S.A",
      vendedor: "Distribuidora Central Ltda",
      cantidad: 65,
      monto: 1950000,
      productos: [
        {
          idProducto: "PROD-011",
          nombreProducto: "Webcam HD",
          cantidad: 15,
          precioUnitario: 120000,
          iva: 22800,
          precioTotal: 1800000
        },
        {
          idProducto: "PROD-012",
          nombreProducto: "Micrófono USB",
          cantidad: 10,
          precioUnitario: 15000,
          iva: 2850,
          precioTotal: 150000
        }
      ],
      alertas: ["Dirección incorrecta en el documento"],
      estado: "Novedad",
      tipoNovedad: "No cumple especificaciones de entrega",
      fechaProcesamiento: "2024-01-08",
      archivoOriginal: "factura-008.pdf",
      pdfUrl: "http://example.com/pdf/202508310055N.pdf",
      timeline: [
        {
          id: "1",
          title: "Orden de compra creada",
          actor: "Sistema",
          timestamp: "2024-01-08 09:00",
          type: "system"
        },
        {
          id: "2",
          title: "Validación iniciada",
          actor: "Sistema",
          timestamp: "2024-01-08 09:30",
          type: "status_change"
        },
        {
          id: "3",
          title: "Novedad detectada",
          description:
            "No cumple especificaciones de entrega: Dirección incorrecta en el documento",
          actor: "Sistema de validación",
          timestamp: "2024-01-08 10:00",
          type: "system",
          metadata: { novedadType: "No cumple especificaciones de entrega" }
        }
      ]
    },
    {
      autoId: 9,
      id: "202508311188N",
      numeroFactura: "F-2024-009",
      fechaFactura: "2024-01-07",
      fechaEntrega: "2024-01-25 11:00",
      direccion: "Calle 100 #23-67",
      ciudad: "Santa Marta",
      observacion: "Producto agotado temporalmente",
      comprador: "Importadora Caribe Ltda",
      vendedor: "Proveedores Unidos Ltda",
      cantidad: 50,
      monto: 2500000,
      productos: [
        {
          idProducto: "PROD-013",
          nombreProducto: "Router WiFi 6",
          cantidad: 10,
          precioUnitario: 250000,
          iva: 47500,
          precioTotal: 2500000
        }
      ],
      alertas: ["Producto en back order - entrega retrasada"],
      estado: "Back order",
      fechaProcesamiento: "2024-01-07",
      archivoOriginal: "factura-009.pdf",
      pdfUrl: "http://example.com/pdf/202508311188N.pdf",
      timeline: [
        {
          id: "1",
          title: "Orden de compra creada",
          actor: "Sistema",
          timestamp: "2024-01-07 10:00",
          type: "system"
        },
        {
          id: "2",
          title: "Producto en back order",
          description: "Producto temporalmente agotado, entrega reprogramada",
          actor: "Sistema de inventario",
          timestamp: "2024-01-07 11:00",
          type: "status_change"
        }
      ]
    },
    {
      autoId: 10,
      id: "202508312233N",
      numeroFactura: "F-2024-010",
      fechaFactura: "2024-01-20",
      fechaEntrega: "2024-01-25 14:00",
      direccion: "Calle 45 #67-89",
      ciudad: "Cali",
      observacion: "Cliente sin cupo disponible",
      comprador: "Comercial Express Ltda",
      vendedor: "Distribuidora Central Ltda",
      cantidad: 80,
      monto: 3200000,
      productos: [
        {
          idProducto: "PROD-014",
          nombreProducto: "Proyector BenQ",
          cantidad: 5,
          precioUnitario: 600000,
          iva: 114000,
          precioTotal: 3000000
        },
        {
          idProducto: "PROD-015",
          nombreProducto: "Pantalla proyección",
          cantidad: 5,
          precioUnitario: 40000,
          iva: 7600,
          precioTotal: 200000
        }
      ],
      alertas: ["Cliente supera límite de crédito"],
      estado: "Novedad",
      tipoNovedad: "No tiene cupo",
      fechaProcesamiento: "2024-01-20",
      archivoOriginal: "factura-010.pdf",
      pdfUrl: "http://example.com/pdf/202508312233N.pdf",
      timeline: [
        {
          id: "1",
          title: "Orden de compra creada",
          actor: "Sistema",
          timestamp: "2024-01-20 09:00",
          type: "system"
        },
        {
          id: "2",
          title: "Novedad: No tiene cupo",
          description: "Cliente supera límite de crédito disponible",
          actor: "Sistema de cartera",
          timestamp: "2024-01-20 09:30",
          type: "system",
          metadata: { novedadType: "No tiene cupo" }
        }
      ]
    },
    {
      autoId: 11,
      id: "202508313344N",
      numeroFactura: "F-2024-011",
      fechaFactura: "2024-01-19",
      fechaEntrega: "2024-01-24 10:00",
      direccion: "Avenida 15 #34-56",
      ciudad: "Bogotá",
      observacion: "Stock insuficiente",
      comprador: "Tecnología Global S.A.S",
      vendedor: "Proveedores Unidos Ltda",
      cantidad: 200,
      monto: 8000000,
      productos: [
        {
          idProducto: "PROD-016",
          nombreProducto: "Servidor Dell PowerEdge",
          cantidad: 2,
          precioUnitario: 4000000,
          iva: 760000,
          precioTotal: 8000000
        }
      ],
      alertas: ["Stock insuficiente en bodega"],
      estado: "Novedad",
      tipoNovedad: "No tiene stock",
      fechaProcesamiento: "2024-01-19",
      archivoOriginal: "factura-011.pdf",
      pdfUrl: "http://example.com/pdf/202508313344N.pdf",
      timeline: [
        {
          id: "1",
          title: "Orden de compra creada",
          actor: "Sistema",
          timestamp: "2024-01-19 10:00",
          type: "system"
        },
        {
          id: "2",
          title: "Novedad: No tiene stock",
          description: "Stock insuficiente en bodega para completar la orden",
          actor: "Sistema de inventario",
          timestamp: "2024-01-19 10:30",
          type: "system",
          metadata: { novedadType: "No tiene stock" }
        }
      ]
    },
    {
      autoId: 12,
      id: "202508314455N",
      numeroFactura: "F-2024-012",
      fechaFactura: "2024-01-18",
      fechaEntrega: "2024-01-23 16:00",
      direccion: "Carrera 80 #12-34",
      ciudad: "Medellín",
      observacion: "Cantidad inusual solicitada",
      comprador: "Distribuidora Regional Ltda",
      vendedor: "Suministros Industriales Ltda",
      cantidad: 500,
      monto: 1500000,
      productos: [
        {
          idProducto: "PROD-017",
          nombreProducto: "Cable de red Cat6",
          cantidad: 500,
          precioUnitario: 3000,
          iva: 285000,
          precioTotal: 1500000
        }
      ],
      alertas: ["Cantidad solicitada supera promedio histórico en 300%"],
      estado: "Novedad",
      tipoNovedad: "Cantidad fuera de promedio",
      fechaProcesamiento: "2024-01-18",
      archivoOriginal: "factura-012.pdf",
      pdfUrl: "http://example.com/pdf/202508314455N.pdf",
      timeline: [
        {
          id: "1",
          title: "Orden de compra creada",
          actor: "Sistema",
          timestamp: "2024-01-18 11:00",
          type: "system"
        },
        {
          id: "2",
          title: "Novedad: Cantidad fuera de promedio",
          description: "Cantidad solicitada supera promedio histórico en 300%",
          actor: "Sistema de análisis",
          timestamp: "2024-01-18 11:30",
          type: "system",
          metadata: { novedadType: "Cantidad fuera de promedio" }
        }
      ]
    },
    {
      autoId: 13,
      id: "202508315566N",
      numeroFactura: "F-2024-013",
      fechaFactura: "2024-01-17",
      fechaEntrega: "2024-01-22 11:00",
      direccion: "Calle 90 #45-67, Bodega Nueva",
      ciudad: "Barranquilla",
      observacion: "Primera entrega en esta ubicación",
      comprador: "Comercializadora del Norte S.A.S",
      vendedor: "Distribuidora Central Ltda",
      cantidad: 120,
      monto: 2400000,
      productos: [
        {
          idProducto: "PROD-018",
          nombreProducto: "Switch de red 24 puertos",
          cantidad: 10,
          precioUnitario: 240000,
          iva: 45600,
          precioTotal: 2400000
        }
      ],
      alertas: ["Dirección de entrega no registrada previamente"],
      estado: "Novedad",
      tipoNovedad: "Nuevo punto de entrega",
      fechaProcesamiento: "2024-01-17",
      archivoOriginal: "factura-013.pdf",
      pdfUrl: "http://example.com/pdf/202508315566N.pdf",
      timeline: [
        {
          id: "1",
          title: "Orden de compra creada",
          actor: "Sistema",
          timestamp: "2024-01-17 09:00",
          type: "system"
        },
        {
          id: "2",
          title: "Novedad: Nuevo punto de entrega",
          description: "Primera entrega en esta ubicación, requiere validación",
          actor: "Sistema de logística",
          timestamp: "2024-01-17 09:30",
          type: "system",
          metadata: { novedadType: "Nuevo punto de entrega" }
        }
      ]
    },
    {
      autoId: 14,
      id: "202508316677N",
      numeroFactura: "F-2024-014",
      fechaFactura: "2024-01-16",
      fechaEntrega: "2024-01-21 14:00",
      direccion: "Avenida 50 #23-45",
      ciudad: "Cartagena",
      observacion: "Zona de difícil acceso",
      comprador: "Importadora Caribe Ltda",
      vendedor: "Proveedores Unidos Ltda",
      cantidad: 75,
      monto: 3750000,
      productos: [
        {
          idProducto: "PROD-019",
          nombreProducto: "UPS APC 1500VA",
          cantidad: 15,
          precioUnitario: 250000,
          iva: 47500,
          precioTotal: 3750000
        }
      ],
      alertas: ["Ubicación fuera del área de cobertura normal"],
      estado: "Novedad",
      tipoNovedad: "No es posible cumplir con la entrega",
      fechaProcesamiento: "2024-01-16",
      archivoOriginal: "factura-014.pdf",
      pdfUrl: "http://example.com/pdf/202508316677N.pdf",
      timeline: [
        {
          id: "1",
          title: "Orden de compra creada",
          actor: "Sistema",
          timestamp: "2024-01-16 10:00",
          type: "system"
        },
        {
          id: "2",
          title: "Novedad: No es posible cumplir con la entrega",
          description: "Ubicación fuera del área de cobertura normal",
          actor: "Sistema de logística",
          timestamp: "2024-01-16 10:30",
          type: "system",
          metadata: { novedadType: "No es posible cumplir con la entrega" }
        }
      ]
    },
    {
      autoId: 15,
      id: "202508317788N",
      numeroFactura: "F-2024-015",
      fechaFactura: "2024-01-15",
      fechaEntrega: "2024-01-20 09:00",
      direccion: "Carrera 70 #12-34",
      ciudad: "Pereira",
      observacion: "Precio no coincide con lista vigente",
      comprador: "Comercial del Eje S.A.S",
      vendedor: "Distribuidora Central Ltda",
      cantidad: 100,
      monto: 5000000,
      productos: [
        {
          idProducto: "PROD-020",
          nombreProducto: "Laptop HP ProBook",
          cantidad: 10,
          precioUnitario: 500000,
          iva: 95000,
          precioTotal: 5000000
        }
      ],
      alertas: ["Precio unitario difiere de lista de precios actual"],
      estado: "Novedad",
      tipoNovedad: "No coincide la lista de precios y/o productos",
      fechaProcesamiento: "2024-01-15",
      archivoOriginal: "factura-015.pdf",
      pdfUrl: "http://example.com/pdf/202508317788N.pdf",
      timeline: [
        {
          id: "1",
          title: "Orden de compra creada",
          actor: "Sistema",
          timestamp: "2024-01-15 08:00",
          type: "system"
        },
        {
          id: "2",
          title: "Novedad: No coincide la lista de precios y/o productos",
          description: "Precio unitario difiere de lista de precios actual",
          actor: "Sistema de precios",
          timestamp: "2024-01-15 08:30",
          type: "system",
          metadata: { novedadType: "No coincide la lista de precios y/o productos" }
        }
      ]
    }
  ],
  currentView: "dashboard",
  selectedInvoice: null,
  filterState: null,
  filterComprador: null,
  filterVendedor: null,
  filterDateRange: { start: null, end: null },
  selectedInvoiceIds: []
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "ADD_INVOICE":
      return {
        ...state,
        invoices: [action.payload, ...state.invoices]
      };
    case "UPDATE_INVOICE":
      return {
        ...state,
        invoices: state.invoices.map((invoice) =>
          invoice.id === action.payload.id ? action.payload : invoice
        )
      };
    case "SET_CURRENT_VIEW":
      return {
        ...state,
        currentView: action.payload
      };
    case "SET_SELECTED_INVOICE":
      return {
        ...state,
        selectedInvoice: action.payload
      };
    case "SET_FILTER_STATE":
      return {
        ...state,
        filterState: action.payload
      };
    case "SET_FILTER_COMPRADOR":
      return {
        ...state,
        filterComprador: action.payload
      };
    case "SET_FILTER_VENDEDOR":
      return {
        ...state,
        filterVendedor: action.payload
      };
    case "SET_FILTER_DATE_RANGE":
      return {
        ...state,
        filterDateRange: action.payload
      };
    case "DELETE_INVOICE":
      return {
        ...state,
        invoices: state.invoices.filter((invoice) => invoice.id !== action.payload)
      };
    case "TOGGLE_INVOICE_SELECTION":
      return {
        ...state,
        selectedInvoiceIds: state.selectedInvoiceIds.includes(action.payload)
          ? state.selectedInvoiceIds.filter((id) => id !== action.payload)
          : [...state.selectedInvoiceIds, action.payload]
      };
    case "SELECT_ALL_INVOICES":
      return {
        ...state,
        selectedInvoiceIds: action.payload
      };
    case "CLEAR_SELECTION":
      return {
        ...state,
        selectedInvoiceIds: []
      };
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  addInvoice: (invoice: InvoiceData) => void;
  updateInvoice: (invoice: InvoiceData) => void;
  selectInvoice: (invoice: InvoiceData) => void;
  goToDetail: (invoice: InvoiceData) => void;
  goToDashboard: () => void;
  setFilter: (state: string | null) => void;
  setCompradorFilter: (comprador: string | null) => void;
  setVendedorFilter: (vendedor: string | null) => void;
  setDateRangeFilter: (dateRange: { start: string | null; end: string | null }) => void;
  deleteInvoice: (id: string) => void;
  getFilteredInvoices: () => InvoiceData[];
  getInvoiceCounts: () => Record<string, number>;
  getUniqueCompradores: () => string[];
  getUniqueVendedores: () => string[];
  toggleInvoiceSelection: (id: string) => void;
  selectAllInvoices: (invoiceIds: string[]) => void;
  clearSelection: () => void;
  downloadSelectedInvoices: () => void;
  findInvoiceById: (id: string) => InvoiceData | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [state, dispatch] = useReducer(appReducer, initialState);

  const addInvoice = (invoice: InvoiceData) => {
    dispatch({ type: "ADD_INVOICE", payload: invoice });
  };

  const updateInvoice = (invoice: InvoiceData) => {
    dispatch({ type: "UPDATE_INVOICE", payload: invoice });
  };

  const selectInvoice = (invoice: InvoiceData) => {
    dispatch({ type: "SET_SELECTED_INVOICE", payload: invoice });
  };

  const goToDetail = (invoice: InvoiceData) => {
    dispatch({ type: "SET_SELECTED_INVOICE", payload: invoice });
    dispatch({ type: "SET_CURRENT_VIEW", payload: "detail" });
    router.push(`/purchase-orders/${invoice.id}`);
  };

  const goToDashboard = () => {
    dispatch({ type: "SET_CURRENT_VIEW", payload: "dashboard" });
    dispatch({ type: "SET_SELECTED_INVOICE", payload: null });
    router.push("/purchase-orders");
  };

  const setFilter = (filterState: string | null) => {
    dispatch({ type: "SET_FILTER_STATE", payload: filterState });
  };

  const setCompradorFilter = (comprador: string | null) => {
    dispatch({ type: "SET_FILTER_COMPRADOR", payload: comprador });
  };

  const setVendedorFilter = (vendedor: string | null) => {
    dispatch({ type: "SET_FILTER_VENDEDOR", payload: vendedor });
  };

  const setDateRangeFilter = (dateRange: { start: string | null; end: string | null }) => {
    dispatch({ type: "SET_FILTER_DATE_RANGE", payload: dateRange });
  };

  const deleteInvoice = (id: string) => {
    dispatch({ type: "DELETE_INVOICE", payload: id });
  };

  const toggleInvoiceSelection = (id: string) => {
    dispatch({ type: "TOGGLE_INVOICE_SELECTION", payload: id });
  };

  const selectAllInvoices = (invoiceIds: string[]) => {
    dispatch({ type: "SELECT_ALL_INVOICES", payload: invoiceIds });
  };

  const clearSelection = () => {
    dispatch({ type: "CLEAR_SELECTION" });
  };

  const downloadSelectedInvoices = () => {
    const selectedInvoices = state.invoices.filter((invoice) =>
      state.selectedInvoiceIds.includes(invoice.id)
    );

    const headers = [
      "Id factura",
      "Fecha Factura",
      "Fecha Entrega",
      "Dirección",
      "Ciudad",
      "Observación",
      "Comprador",
      "Vendedor",
      "Estado",
      "Cantidad",
      "Monto",
      "Productos promoción",
      "Factura",
      "Tipo Novedad"
    ];
    const csvContent = [
      headers.join(","),
      ...selectedInvoices.map((invoice) => {
        const productosPromocion = invoice.productos
          .filter((p) => p.precioUnitario === 0)
          .reduce((sum, p) => sum + p.cantidad, 0);
        return [
          invoice.id,
          invoice.fechaFactura,
          invoice.fechaEntrega || "",
          `"${invoice.direccion || ""}"`,
          `"${invoice.ciudad || ""}"`,
          `"${invoice.observacion || ""}"`,
          `"${invoice.comprador}"`,
          `"${invoice.vendedor}"`,
          invoice.estado,
          invoice.cantidad,
          invoice.monto,
          productosPromocion,
          invoice.factura ? invoice.factura.join("; ") : "",
          invoice.tipoNovedad || ""
        ].join(",");
      })
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `facturas_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getFilteredInvoices = () => {
    let filteredInvoices = state.invoices;

    if (state.filterState) {
      filteredInvoices = filteredInvoices.filter((invoice) => invoice.estado === state.filterState);
    }

    if (state.filterComprador) {
      filteredInvoices = filteredInvoices.filter((invoice) =>
        invoice.comprador.toLowerCase().includes(state.filterComprador!.toLowerCase())
      );
    }

    if (state.filterVendedor) {
      filteredInvoices = filteredInvoices.filter((invoice) =>
        invoice.vendedor.toLowerCase().includes(state.filterVendedor!.toLowerCase())
      );
    }

    if (state.filterDateRange.start || state.filterDateRange.end) {
      filteredInvoices = filteredInvoices.filter((invoice) => {
        const invoiceDate = new Date(invoice.fechaFactura);
        const startDate = state.filterDateRange.start
          ? new Date(state.filterDateRange.start)
          : null;
        const endDate = state.filterDateRange.end ? new Date(state.filterDateRange.end) : null;

        if (startDate && invoiceDate < startDate) return false;
        if (endDate && invoiceDate > endDate) return false;
        return true;
      });
    }

    return filteredInvoices;
  };

  const getInvoiceCounts = () => {
    const counts: Record<string, number> = {
      Novedad: 0,
      "En validación": 0,
      "En aprobaciones": 0,
      "En facturación": 0,
      Facturado: 0,
      "En despacho": 0,
      Entregado: 0,
      "Back order": 0
    };

    state.invoices.forEach((invoice) => {
      counts[invoice.estado] = (counts[invoice.estado] || 0) + 1;
    });

    return counts;
  };

  const getUniqueCompradores = () => {
    return Array.from(new Set(state.invoices.map((invoice) => invoice.comprador))).sort();
  };

  const getUniqueVendedores = () => {
    return Array.from(new Set(state.invoices.map((invoice) => invoice.vendedor))).sort();
  };

  const findInvoiceById = (id: string): InvoiceData | undefined => {
    return state.invoices.find((invoice) => invoice.id === id);
  };

  const value: AppContextType = {
    state,
    dispatch,
    addInvoice,
    updateInvoice,
    selectInvoice,
    goToDetail,
    goToDashboard,
    setFilter,
    setCompradorFilter,
    setVendedorFilter,
    setDateRangeFilter,
    deleteInvoice,
    getFilteredInvoices,
    getInvoiceCounts,
    getUniqueCompradores,
    getUniqueVendedores,
    toggleInvoiceSelection,
    selectAllInvoices,
    clearSelection,
    downloadSelectedInvoices,
    findInvoiceById
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}

export type { InvoiceData, TimelineEvent };
