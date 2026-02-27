"use client";

import type React from "react";
import { createContext, useContext, useReducer, type ReactNode } from "react";

interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  actor?: string;
  timestamp: string;
  type: "status_change" | "approval" | "rejection" | "comment" | "system";
  metadata?: Record<string, any>;
}

export type TipoNotaCredito = "Devolución" | "Acuerdo comercial";

export type EstadoSaldo =
  | "Pendiente NC"
  | "Pendiente"
  | "En revisión"
  | "Aprobado"
  | "Aplicado"
  | "Rechazado"
  | "Aplicado parcial";

export type EstadoCartera =
  | "Al día"
  | "Preventiva"
  | "Alerta incumplimiento"
  | "Alerta bloqueo"
  | "Crítica";

export interface NotaCreditoRef {
  numero: string;
  idDocumento: string; // Factura o documento AB de SAP
  fecha?: string;
  monto: number;
}

export interface SoporteArchivo {
  nombre: string;
  url: string;
  tipo?: string; // "pdf", "xlsx", "jpg", etc.
}

export interface FacturaRef {
  numero: string;
  fecha?: string;
  monto?: number;
}

export interface SaldoData {
  autoId: number;
  id: string;
  notasCredito?: NotaCreditoRef[]; // Puede tener varias NC o ninguna
  fechaEmision: string;
  fechaVencimiento?: string;
  cliente: string;
  estadoCartera: EstadoCartera; // Estado de cartera del cliente
  carteraTotal: number; // Total cartera del cliente
  carteraVencidaPct: number; // % de cartera vencida
  acuerdoPago?: {
    monto?: number;
    fecha?: string;
    vencido?: boolean;
  };
  kam: string; // Ejecutivo comercial (KAM)
  tipoNotaCredito: TipoNotaCredito;
  estado: EstadoSaldo;
  montoOriginal: number;
  montoDisponible: number;
  montoAplicado: number;
  facturas?: FacturaRef[]; // Puede tener varias facturas
  soportes?: SoporteArchivo[]; // Archivos de soporte (uno o varios)
  comentario?: string; // Comentario corto del saldo, ej: "Promoción noviembre #2625"
  motivo: string;
  observaciones?: string;
  boletoDevolución?: string; // URL del PDF del boleto de devolución
  timeline?: TimelineEvent[];
  aplicaciones?: Array<{
    id: string;
    facturaAplicada: string;
    fechaAplicacion: string;
    montoAplicado: number;
    usuario: string;
  }>;
}

interface SaldosState {
  saldos: SaldoData[];
  currentView: "dashboard" | "detail";
  selectedSaldo: SaldoData | null;
  filterState: string | null;
  filterTipo: TipoNotaCredito | null;
  filterCliente: string | null;
  filterKam: string | null;
  filterDateRange: { start: string | null; end: string | null };
  selectedSaldoIds: string[];
}

type SaldosAction =
  | { type: "ADD_SALDO"; payload: SaldoData }
  | { type: "UPDATE_SALDO"; payload: SaldoData }
  | { type: "SET_CURRENT_VIEW"; payload: "dashboard" | "detail" }
  | { type: "SET_SELECTED_SALDO"; payload: SaldoData | null }
  | { type: "SET_FILTER_STATE"; payload: string | null }
  | { type: "SET_FILTER_TIPO"; payload: TipoNotaCredito | null }
  | { type: "SET_FILTER_CLIENTE"; payload: string | null }
  | { type: "SET_FILTER_KAM"; payload: string | null }
  | { type: "SET_FILTER_DATE_RANGE"; payload: { start: string | null; end: string | null } }
  | { type: "DELETE_SALDO"; payload: string }
  | { type: "TOGGLE_SALDO_SELECTION"; payload: string }
  | { type: "SELECT_ALL_SALDOS"; payload: string[] }
  | { type: "CLEAR_SELECTION" };

const initialState: SaldosState = {
  saldos: [
    {
      autoId: 1,
      id: "SAL-2025-001",
      notasCredito: [
        { numero: "NC-2025-001", idDocumento: "F-2025-081", fecha: "2025-07-20", monto: 2850000 }
      ],
      soportes: [
        { nombre: "Boleto_devolucion_081.pdf", url: "#", tipo: "pdf" },
        { nombre: "Factura_F-2025-081.pdf", url: "#", tipo: "pdf" }
      ],
      fechaEmision: "2025-07-18",
      fechaVencimiento: "2026-01-18",
      cliente: "Comercializadora del Norte S.A.S",
      estadoCartera: "Al día",
      carteraTotal: 18500000,
      carteraVencidaPct: 0,
      kam: "Pedro Gómez",
      tipoNotaCredito: "Devolución",
      estado: "Aprobado",
      montoOriginal: 2850000,
      montoDisponible: 2850000,
      montoAplicado: 0,
      facturas: [{ numero: "F-2025-081", fecha: "2025-07-10", monto: 3500000 }],
      comentario: "Devolución Id-38763",
      motivo: "Devolución de productos defectuosos",
      observaciones: "Productos devueltos en buen estado de empaque",
      boletoDevolución: "https://example.com/boletos/BD-2025-001.pdf",
      timeline: [
        {
          id: "1",
          title: "Saldo registrado",
          description: "Solicitud de devolución recibida",
          actor: "Sistema",
          timestamp: "2025-07-18 09:00",
          type: "system"
        },
        {
          id: "2",
          title: "Productos recibidos en bodega",
          description: "Se verificó el estado de los productos devueltos",
          actor: "Juan Pérez - Bodega",
          timestamp: "2025-07-18 14:30",
          type: "status_change"
        },
        {
          id: "3",
          title: "Nota de crédito generada",
          description: "NC-2025-001 emitida",
          actor: "Sistema",
          timestamp: "2025-07-20 10:00",
          type: "approval"
        },
        {
          id: "4",
          title: "Nota de crédito aprobada",
          description: "Saldo disponible para aplicar",
          actor: "Carlos Martínez - Cartera",
          timestamp: "2025-07-20 15:00",
          type: "approval"
        }
      ]
    },
    {
      autoId: 2,
      id: "SAL-2025-002",
      notasCredito: [
        { numero: "NC-2025-002", idDocumento: "AB-2025-340", fecha: "2025-09-05", monto: 1500000 }
      ],
      soportes: [{ nombre: "Acuerdo_comercial_Q3.pdf", url: "#", tipo: "pdf" }],
      fechaEmision: "2025-09-03",
      fechaVencimiento: "2026-03-03",
      cliente: "Tecnología Avanzada S.A",
      estadoCartera: "Preventiva",
      carteraTotal: 32100000,
      carteraVencidaPct: 12,
      kam: "Ana Rodríguez",
      tipoNotaCredito: "Acuerdo comercial",
      estado: "Aplicado",
      montoOriginal: 1500000,
      montoDisponible: 0,
      montoAplicado: 1500000,
      facturas: [{ numero: "F-2025-142", fecha: "2025-08-28", monto: 4200000 }],
      comentario: "Promoción volumen Q3 #1042",
      motivo: "Descuento por volumen de compras Q3 2025",
      observaciones: "Acuerdo comercial según contrato #AC-2025-045",
      timeline: [
        {
          id: "1",
          title: "Saldo registrado",
          description: "Acuerdo comercial registrado",
          actor: "Sistema",
          timestamp: "2025-09-03 10:00",
          type: "system"
        },
        {
          id: "2",
          title: "Nota de crédito generada",
          description: "NC-2025-002 emitida",
          actor: "Sistema",
          timestamp: "2025-09-05 11:00",
          type: "approval"
        },
        {
          id: "3",
          title: "Saldo aplicado",
          description: "Aplicado a factura F-2025-160",
          actor: "Sistema",
          timestamp: "2025-09-15 09:00",
          type: "status_change"
        }
      ],
      aplicaciones: [
        {
          id: "APP-001",
          facturaAplicada: "F-2025-160",
          fechaAplicacion: "2025-09-15",
          montoAplicado: 1500000,
          usuario: "Ana García - Cartera"
        }
      ]
    },
    {
      autoId: 3,
      id: "SAL-2026-003",
      // Sin nota de crédito - reciente (dias)
      soportes: [
        { nombre: "Factura_F-2026-018.pdf", url: "#", tipo: "pdf" },
        { nombre: "Boleto_devolucion_018.pdf", url: "#", tipo: "pdf" }
      ],
      fechaEmision: "2026-02-05",
      cliente: "Retail Solutions S.A.S",
      estadoCartera: "Al día",
      carteraTotal: 12800000,
      carteraVencidaPct: 0,
      kam: "Pedro Gómez",
      tipoNotaCredito: "Devolución",
      estado: "Pendiente NC",
      montoOriginal: 4200000,
      montoDisponible: 4200000,
      montoAplicado: 0,
      facturas: [{ numero: "F-2026-018", fecha: "2026-01-28", monto: 4200000 }],
      comentario: "Devolución Id-41205",
      motivo: "Devolución por error en pedido",
      observaciones: "Cliente solicitó productos diferentes - Pendiente crear NC",
      boletoDevolución: "https://example.com/boletos/BD-2026-003.pdf",
      timeline: [
        {
          id: "1",
          title: "Saldo registrado",
          description: "Devolución recibida, pendiente generar NC",
          actor: "Sistema",
          timestamp: "2026-02-05 09:00",
          type: "system"
        }
      ]
    },
    {
      autoId: 4,
      id: "SAL-2026-004",
      // Sin nota de crédito - reciente (dias)
      fechaEmision: "2026-02-10",
      cliente: "Empresas Asociadas S.A",
      estadoCartera: "Alerta incumplimiento",
      carteraTotal: 25220000,
      carteraVencidaPct: 30,
      acuerdoPago: { monto: 15000000, fecha: "2026-02-22" },
      kam: "Carlos Mejía",
      tipoNotaCredito: "Acuerdo comercial",
      estado: "Pendiente NC",
      montoOriginal: 3400000,
      montoDisponible: 3400000,
      montoAplicado: 0,
      comentario: "Pronto pago febrero #2625",
      motivo: "Bonificación por pronto pago",
      observaciones: "Pendiente crear nota de crédito para legalizar",
      timeline: [
        {
          id: "1",
          title: "Saldo registrado",
          actor: "Sistema",
          timestamp: "2026-02-10 10:00",
          type: "system"
        },
        {
          id: "2",
          title: "Pendiente NC",
          description: "Esperando generación de nota de crédito",
          actor: "Cartera",
          timestamp: "2026-02-10 14:00",
          type: "status_change"
        }
      ]
    },
    {
      autoId: 5,
      id: "SAL-2025-005",
      notasCredito: [
        { numero: "NC-2025-005", idDocumento: "F-2025-195", fecha: "2025-10-12", monto: 1400000 },
        { numero: "NC-2025-005B", idDocumento: "AB-2025-410", fecha: "2025-10-14", monto: 1000000 }
      ],
      soportes: [
        { nombre: "Boleto_devolucion_195.pdf", url: "#", tipo: "pdf" },
        { nombre: "Fotos_mercancia.zip", url: "#", tipo: "zip" }
      ],
      fechaEmision: "2025-10-10",
      fechaVencimiento: "2026-04-10",
      cliente: "Soluciones Corporativas Ltda",
      estadoCartera: "Al día",
      carteraTotal: 9400000,
      carteraVencidaPct: 5,
      kam: "Ana Rodríguez",
      tipoNotaCredito: "Devolución",
      estado: "Aplicado parcial",
      montoOriginal: 2400000,
      montoDisponible: 900000,
      montoAplicado: 1500000,
      facturas: [
        { numero: "F-2025-195", fecha: "2025-10-02", monto: 1800000 },
        { numero: "F-2025-198", fecha: "2025-10-04", monto: 600000 }
      ],
      comentario: "Devolución parcial Id-39110",
      motivo: "Devolución parcial de mercancía",
      boletoDevolución: "https://example.com/boletos/BD-2025-005.pdf",
      timeline: [
        {
          id: "1",
          title: "Saldo registrado",
          actor: "Sistema",
          timestamp: "2025-10-10 08:00",
          type: "system"
        },
        {
          id: "2",
          title: "Nota de crédito generada",
          description: "NC-2025-005 emitida",
          actor: "Sistema",
          timestamp: "2025-10-12 10:00",
          type: "approval"
        },
        {
          id: "3",
          title: "Aplicación parcial",
          description: "Aplicado $1,500,000 a factura F-2025-210",
          actor: "Sistema",
          timestamp: "2025-10-20 11:00",
          type: "status_change"
        }
      ],
      aplicaciones: [
        {
          id: "APP-002",
          facturaAplicada: "F-2025-210",
          fechaAplicacion: "2025-10-20",
          montoAplicado: 1500000,
          usuario: "Ana García - Cartera"
        }
      ]
    },
    {
      autoId: 6,
      id: "SAL-2025-006",
      // Sin nota de crédito - rechazado
      fechaEmision: "2025-11-15",
      cliente: "Distribuidora del Sur Ltda",
      estadoCartera: "Alerta bloqueo",
      carteraTotal: 41300000,
      carteraVencidaPct: 45,
      acuerdoPago: { monto: 15000000, fecha: "2024-01-01", vencido: true },
      kam: "Pedro Gómez",
      tipoNotaCredito: "Acuerdo comercial",
      estado: "Rechazado",
      montoOriginal: 3200000,
      montoDisponible: 0,
      montoAplicado: 0,
      comentario: "Promoción noviembre #2625",
      motivo: "Descuento especial solicitado",
      observaciones: "No cumple condiciones del acuerdo comercial",
      timeline: [
        {
          id: "1",
          title: "Saldo registrado",
          actor: "Sistema",
          timestamp: "2025-11-15 09:00",
          type: "system"
        },
        {
          id: "2",
          title: "Rechazado",
          description: "No cumple condiciones para aplicar descuento",
          actor: "Pedro Gómez - KAM",
          timestamp: "2025-11-15 14:00",
          type: "rejection"
        }
      ]
    },
    {
      autoId: 7,
      id: "SAL-2025-007",
      notasCredito: [
        { numero: "NC-2025-007", idDocumento: "F-2025-280", fecha: "2025-12-05", monto: 2900000 }
      ],
      soportes: [{ nombre: "Informe_garantia_BX440.pdf", url: "#", tipo: "pdf" }],
      fechaEmision: "2025-12-03",
      fechaVencimiento: "2026-06-03",
      cliente: "Comercial del Eje S.A.S",
      estadoCartera: "Al día",
      carteraTotal: 15600000,
      carteraVencidaPct: 0,
      kam: "Carlos Mejía",
      tipoNotaCredito: "Devolución",
      estado: "Aprobado",
      montoOriginal: 2900000,
      montoDisponible: 2900000,
      montoAplicado: 0,
      facturas: [{ numero: "F-2025-280", fecha: "2025-11-28", monto: 2900000 }],
      comentario: "Garantía lote #BX-440",
      motivo: "Devolución por garantía",
      observaciones: "Productos con defectos de fábrica",
      boletoDevolución: "https://example.com/boletos/BD-2025-007.pdf",
      timeline: [
        {
          id: "1",
          title: "Saldo registrado",
          actor: "Sistema",
          timestamp: "2025-12-03 08:00",
          type: "system"
        },
        {
          id: "2",
          title: "Verificación de garantía",
          description: "Productos dentro del periodo de garantía",
          actor: "Calidad",
          timestamp: "2025-12-03 12:00",
          type: "system"
        },
        {
          id: "3",
          title: "Nota de crédito generada",
          description: "NC-2025-007 emitida",
          actor: "Sistema",
          timestamp: "2025-12-05 14:00",
          type: "approval"
        }
      ]
    },
    {
      autoId: 8,
      id: "SAL-2025-008",
      // Sin nota de crédito - en revisión
      fechaEmision: "2025-08-20",
      cliente: "Tecnología del Café S.A",
      estadoCartera: "Crítica",
      carteraTotal: 52800000,
      carteraVencidaPct: 62,
      acuerdoPago: { monto: 20000000, fecha: "2025-06-15", vencido: true },
      kam: "Ana Rodríguez",
      tipoNotaCredito: "Acuerdo comercial",
      estado: "En revisión",
      montoOriginal: 1950000,
      montoDisponible: 1950000,
      montoAplicado: 0,
      comentario: "Rappel metas 2025 #RM-88",
      motivo: "Rappel por cumplimiento de metas anuales",
      observaciones: "Cumplió 120% de la meta de compras 2025 - validando para crear NC",
      timeline: [
        {
          id: "1",
          title: "Saldo registrado",
          actor: "Sistema",
          timestamp: "2025-08-20 09:00",
          type: "system"
        },
        {
          id: "2",
          title: "En revisión",
          description: "Validando cumplimiento de metas comerciales",
          actor: "Sistema CRM",
          timestamp: "2025-08-20 10:00",
          type: "status_change"
        }
      ]
    },
    {
      autoId: 9,
      id: "SAL-2026-009",
      // Sin nota de crédito - reciente (dias)
      fechaEmision: "2026-01-28",
      cliente: "Importadora Caribe Ltda",
      estadoCartera: "Al día",
      carteraTotal: 7200000,
      carteraVencidaPct: 0,
      kam: "Pedro Gómez",
      tipoNotaCredito: "Devolución",
      estado: "Pendiente NC",
      montoOriginal: 2500000,
      montoDisponible: 2500000,
      montoAplicado: 0,
      facturas: [{ numero: "F-2026-012", fecha: "2026-01-22", monto: 2500000 }],
      comentario: "Devolución Id-42017",
      motivo: "Devolución por cambio de especificaciones",
      boletoDevolución: "https://example.com/boletos/BD-2026-009.pdf",
      timeline: [
        {
          id: "1",
          title: "Saldo registrado",
          actor: "Sistema",
          timestamp: "2026-01-28 10:00",
          type: "system"
        },
        {
          id: "2",
          title: "Productos recibidos",
          description: "Devolución verificada, pendiente crear NC",
          actor: "Bodega",
          timestamp: "2026-01-28 14:00",
          type: "status_change"
        }
      ]
    },
    {
      autoId: 10,
      id: "SAL-2025-010",
      notasCredito: [
        { numero: "NC-2025-010", idDocumento: "AB-2025-520", fecha: "2025-11-02", monto: 1800000 },
        { numero: "NC-2025-010B", idDocumento: "AB-2025-521", fecha: "2025-11-10", monto: 1400000 }
      ],
      soportes: [{ nombre: "Convenio_noviembre_2580.pdf", url: "#", tipo: "pdf" }],
      fechaEmision: "2025-11-01",
      fechaVencimiento: "2026-05-01",
      cliente: "Comercial Express Ltda",
      estadoCartera: "Preventiva",
      carteraTotal: 28900000,
      carteraVencidaPct: 8,
      acuerdoPago: { monto: 10000000, fecha: "2026-03-15" },
      kam: "Carlos Mejía",
      tipoNotaCredito: "Acuerdo comercial",
      estado: "Pendiente",
      montoOriginal: 3200000,
      montoDisponible: 3200000,
      montoAplicado: 0,
      comentario: "Promoción noviembre #2580",
      motivo: "Descuento promocional campaña noviembre",
      observaciones: "NC creada, pendiente aprobación de gerencia comercial",
      timeline: [
        {
          id: "1",
          title: "Saldo registrado",
          actor: "Sistema",
          timestamp: "2025-11-01 09:00",
          type: "system"
        },
        {
          id: "2",
          title: "Nota de crédito generada",
          description: "NC-2025-010 emitida, pendiente aprobación",
          actor: "Sistema",
          timestamp: "2025-11-02 10:00",
          type: "system"
        }
      ]
    },
    {
      autoId: 11,
      id: "SAL-2026-011",
      // Sin nota de crédito - reciente (dias)
      fechaEmision: "2026-02-12",
      cliente: "Mayorista del Centro S.A",
      estadoCartera: "Alerta incumplimiento",
      carteraTotal: 38700000,
      carteraVencidaPct: 25,
      kam: "Ana Rodríguez",
      tipoNotaCredito: "Devolución",
      estado: "Pendiente NC",
      montoOriginal: 5100000,
      montoDisponible: 5100000,
      montoAplicado: 0,
      facturas: [
        { numero: "F-2026-025", fecha: "2026-02-05", monto: 3200000 },
        { numero: "F-2026-027", fecha: "2026-02-06", monto: 1900000 }
      ],
      comentario: "Devolución masiva Id-42890",
      motivo: "Devolución masiva por fecha de vencimiento próxima",
      observaciones: "Productos recibidos en bodega, esperando autorización para emitir NC",
      boletoDevolución: "https://example.com/boletos/BD-2026-011.pdf",
      timeline: [
        {
          id: "1",
          title: "Saldo registrado",
          description: "Devolución masiva ingresada al sistema",
          actor: "Sistema",
          timestamp: "2026-02-12 08:00",
          type: "system"
        }
      ]
    },
    {
      autoId: 12,
      id: "SAL-2025-012",
      // Sin nota de crédito
      fechaEmision: "2025-10-25",
      cliente: "Supermercados Unidos S.A.S",
      estadoCartera: "Al día",
      carteraTotal: 11200000,
      carteraVencidaPct: 0,
      kam: "Pedro Gómez",
      tipoNotaCredito: "Acuerdo comercial",
      estado: "Pendiente NC",
      montoOriginal: 2750000,
      montoDisponible: 2750000,
      montoAplicado: 0,
      comentario: "Exhibición preferencial #EP-312",
      motivo: "Bonificación por exhibición preferencial",
      observaciones: "Esperando documentación completa para generar NC",
      timeline: [
        {
          id: "1",
          title: "Saldo registrado",
          actor: "Sistema",
          timestamp: "2025-10-25 11:00",
          type: "system"
        }
      ]
    }
  ],
  currentView: "dashboard",
  selectedSaldo: null,
  filterState: null,
  filterTipo: null,
  filterCliente: null,
  filterKam: null,
  filterDateRange: { start: null, end: null },
  selectedSaldoIds: []
};

function saldosReducer(state: SaldosState, action: SaldosAction): SaldosState {
  switch (action.type) {
    case "ADD_SALDO":
      return {
        ...state,
        saldos: [action.payload, ...state.saldos]
      };
    case "UPDATE_SALDO":
      return {
        ...state,
        saldos: state.saldos.map((saldo) =>
          saldo.id === action.payload.id ? action.payload : saldo
        )
      };
    case "SET_CURRENT_VIEW":
      return {
        ...state,
        currentView: action.payload
      };
    case "SET_SELECTED_SALDO":
      return {
        ...state,
        selectedSaldo: action.payload
      };
    case "SET_FILTER_STATE":
      return {
        ...state,
        filterState: action.payload
      };
    case "SET_FILTER_TIPO":
      return {
        ...state,
        filterTipo: action.payload
      };
    case "SET_FILTER_CLIENTE":
      return {
        ...state,
        filterCliente: action.payload
      };
    case "SET_FILTER_KAM":
      return {
        ...state,
        filterKam: action.payload
      };
    case "SET_FILTER_DATE_RANGE":
      return {
        ...state,
        filterDateRange: action.payload
      };
    case "DELETE_SALDO":
      return {
        ...state,
        saldos: state.saldos.filter((saldo) => saldo.id !== action.payload)
      };
    case "TOGGLE_SALDO_SELECTION":
      return {
        ...state,
        selectedSaldoIds: state.selectedSaldoIds.includes(action.payload)
          ? state.selectedSaldoIds.filter((id) => id !== action.payload)
          : [...state.selectedSaldoIds, action.payload]
      };
    case "SELECT_ALL_SALDOS":
      return {
        ...state,
        selectedSaldoIds: action.payload
      };
    case "CLEAR_SELECTION":
      return {
        ...state,
        selectedSaldoIds: []
      };
    default:
      return state;
  }
}

interface SaldosContextType {
  state: SaldosState;
  dispatch: React.Dispatch<SaldosAction>;
  addSaldo: (saldo: SaldoData) => void;
  updateSaldo: (saldo: SaldoData) => void;
  selectSaldo: (saldo: SaldoData) => void;
  goToDetail: (saldo: SaldoData) => void;
  goToDashboard: () => void;
  setFilter: (state: string | null) => void;
  setTipoFilter: (tipo: TipoNotaCredito | null) => void;
  setClienteFilter: (cliente: string | null) => void;
  setKamFilter: (kam: string | null) => void;
  setDateRangeFilter: (dateRange: { start: string | null; end: string | null }) => void;
  deleteSaldo: (id: string) => void;
  getFilteredSaldos: () => SaldoData[];
  getSaldoCounts: () => Record<string, number>;
  getTipoCounts: () => Record<string, number>;
  getUniqueClientes: () => string[];
  getUniqueKams: () => string[];
  toggleSaldoSelection: (id: string) => void;
  selectAllSaldos: (saldoIds: string[]) => void;
  clearSelection: () => void;
  downloadSelectedSaldos: () => void;
}

const SaldosContext = createContext<SaldosContextType | undefined>(undefined);

export function SaldosProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(saldosReducer, initialState);

  const addSaldo = (saldo: SaldoData) => {
    dispatch({ type: "ADD_SALDO", payload: saldo });
  };

  const updateSaldo = (saldo: SaldoData) => {
    dispatch({ type: "UPDATE_SALDO", payload: saldo });
  };

  const selectSaldo = (saldo: SaldoData) => {
    dispatch({ type: "SET_SELECTED_SALDO", payload: saldo });
  };

  const goToDetail = (saldo: SaldoData) => {
    dispatch({ type: "SET_SELECTED_SALDO", payload: saldo });
    dispatch({ type: "SET_CURRENT_VIEW", payload: "detail" });
  };

  const goToDashboard = () => {
    dispatch({ type: "SET_CURRENT_VIEW", payload: "dashboard" });
    dispatch({ type: "SET_SELECTED_SALDO", payload: null });
  };

  const setFilter = (filterState: string | null) => {
    dispatch({ type: "SET_FILTER_STATE", payload: filterState });
  };

  const setTipoFilter = (tipo: TipoNotaCredito | null) => {
    dispatch({ type: "SET_FILTER_TIPO", payload: tipo });
  };

  const setClienteFilter = (cliente: string | null) => {
    dispatch({ type: "SET_FILTER_CLIENTE", payload: cliente });
  };

  const setKamFilter = (kam: string | null) => {
    dispatch({ type: "SET_FILTER_KAM", payload: kam });
  };

  const setDateRangeFilter = (dateRange: { start: string | null; end: string | null }) => {
    dispatch({ type: "SET_FILTER_DATE_RANGE", payload: dateRange });
  };

  const deleteSaldo = (id: string) => {
    dispatch({ type: "DELETE_SALDO", payload: id });
  };

  const toggleSaldoSelection = (id: string) => {
    dispatch({ type: "TOGGLE_SALDO_SELECTION", payload: id });
  };

  const selectAllSaldos = (saldoIds: string[]) => {
    dispatch({ type: "SELECT_ALL_SALDOS", payload: saldoIds });
  };

  const clearSelection = () => {
    dispatch({ type: "CLEAR_SELECTION" });
  };

  const downloadSelectedSaldos = () => {
    const selectedSaldos = state.saldos.filter((saldo) =>
      state.selectedSaldoIds.includes(saldo.id)
    );

    const headers = [
      "ID",
      "Notas de Crédito",
      "Fecha Emisión",
      "Fecha Vencimiento",
      "Cliente",
      "KAM",
      "Tipo",
      "Estado",
      "Saldo Inicial",
      "Pendiente",
      "Monto Aplicado",
      "Facturas",
      "Motivo"
    ];
    const csvContent = [
      headers.join(","),
      ...selectedSaldos.map((saldo) => {
        const ncs = saldo.notasCredito?.map((nc) => nc.numero).join("; ") || "";
        const facturas = saldo.facturas?.map((f) => f.numero).join("; ") || "";
        return [
          saldo.id,
          `"${ncs}"`,
          saldo.fechaEmision,
          saldo.fechaVencimiento || "",
          `"${saldo.cliente}"`,
          `"${saldo.kam}"`,
          saldo.tipoNotaCredito,
          saldo.estado,
          saldo.montoOriginal,
          saldo.montoDisponible,
          saldo.montoAplicado,
          `"${facturas}"`,
          `"${saldo.motivo}"`
        ].join(",");
      })
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `saldos_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getFilteredSaldos = () => {
    let filteredSaldos = state.saldos;

    if (state.filterState) {
      filteredSaldos = filteredSaldos.filter((saldo) => saldo.estado === state.filterState);
    }

    if (state.filterTipo) {
      filteredSaldos = filteredSaldos.filter((saldo) => saldo.tipoNotaCredito === state.filterTipo);
    }

    if (state.filterCliente) {
      filteredSaldos = filteredSaldos.filter((saldo) =>
        saldo.cliente.toLowerCase().includes(state.filterCliente!.toLowerCase())
      );
    }

    if (state.filterKam) {
      filteredSaldos = filteredSaldos.filter((saldo) => saldo.kam === state.filterKam);
    }

    if (state.filterDateRange.start || state.filterDateRange.end) {
      filteredSaldos = filteredSaldos.filter((saldo) => {
        const saldoDate = new Date(saldo.fechaEmision);
        const startDate = state.filterDateRange.start
          ? new Date(state.filterDateRange.start)
          : null;
        const endDate = state.filterDateRange.end ? new Date(state.filterDateRange.end) : null;

        if (startDate && saldoDate < startDate) return false;
        if (endDate && saldoDate > endDate) return false;
        return true;
      });
    }

    return filteredSaldos;
  };

  const getSaldoCounts = () => {
    const counts: Record<string, number> = {
      "Pendiente NC": 0,
      Pendiente: 0,
      "En revisión": 0,
      Aprobado: 0,
      Aplicado: 0,
      Rechazado: 0,
      "Aplicado parcial": 0
    };

    state.saldos.forEach((saldo) => {
      if (counts[saldo.estado] !== undefined) {
        counts[saldo.estado]++;
      }
    });

    return counts;
  };

  const getTipoCounts = () => {
    const counts: Record<string, number> = {
      Devolución: 0,
      "Acuerdo comercial": 0
    };

    state.saldos.forEach((saldo) => {
      if (counts[saldo.tipoNotaCredito] !== undefined) {
        counts[saldo.tipoNotaCredito]++;
      }
    });

    return counts;
  };

  const getUniqueClientes = () => {
    const clientes = new Set(state.saldos.map((saldo) => saldo.cliente));
    return Array.from(clientes).sort();
  };

  const getUniqueKams = () => {
    const kams = new Set(state.saldos.map((saldo) => saldo.kam));
    return Array.from(kams).sort();
  };

  return (
    <SaldosContext.Provider
      value={{
        state,
        dispatch,
        addSaldo,
        updateSaldo,
        selectSaldo,
        goToDetail,
        goToDashboard,
        setFilter,
        setTipoFilter,
        setClienteFilter,
        setKamFilter,
        setDateRangeFilter,
        deleteSaldo,
        getFilteredSaldos,
        getSaldoCounts,
        getTipoCounts,
        getUniqueClientes,
        getUniqueKams,
        toggleSaldoSelection,
        selectAllSaldos,
        clearSelection,
        downloadSelectedSaldos
      }}
    >
      {children}
    </SaldosContext.Provider>
  );
}

export function useSaldos() {
  const context = useContext(SaldosContext);
  if (context === undefined) {
    throw new Error("useSaldos must be used within a SaldosProvider");
  }
  return context;
}
