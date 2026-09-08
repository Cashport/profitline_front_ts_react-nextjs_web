/* ============================================================
   DATOS SIMULADOS — SE REEMPLAZAN POR EL API
   ------------------------------------------------------------
   Mantienen la forma que debe devolver el backend: al conectar el
   servicio sólo cambia el origen, no los componentes.
   ============================================================ */
import { WALLET_PEOPLE } from "@/modules/walletModule/mocked-data";
import { HOY, dias } from "@/modules/walletModule/utils/format";
import type { IWalletGroupDetail, IWalletPerson } from "@/modules/walletModule/types";
import type { INoveltyRow } from "./types";

const M = 1e6;

/** Las personas de cartera más el ejecutivo propio de esta bandeja. */
export const NOVELTY_PEOPLE: Record<string, IWalletPerson> = {
  ...WALLET_PEOPLE,
  malfonso: { id: "malfonso", nombre: "Miguel Alfonso", iniciales: "MA" }
};

/**
 * Seis novedades escogidas para que ninguna tarjeta quede en cero y el tablero
 * tenga cuatro columnas con contenido. La fecha de corte es el 31/08/2026.
 */
export const NOVELTY_ROWS: INoveltyRow[] = [
  {
    id: "NOV-1042",
    tipo: "acuerdo",
    estado: "esperando_aprob",
    cliente: { nombre: "OXXO COLOMBIA S.A.S.", nit: "843326788" },
    ejecutivo: NOVELTY_PEOPLE.cosorio,
    responsable: NOVELTY_PEOPLE.cosorio,
    accion: "Reprogramar con soporte",
    facturas: 1,
    monto: 32 * M,
    creada: new Date(2026, 6, 24),
    compromiso: new Date(2026, 7, 2),
    limite: new Date(2026, 7, 21),
    diasSinGestion: 15
  },
  {
    id: "NOV-1048",
    tipo: "cruce",
    estado: "en_gestion",
    cliente: { nombre: "KOBA COLOMBIA S.A.S. (D1)", nit: "894204193" },
    ejecutivo: NOVELTY_PEOPLE.cosorio,
    responsable: NOVELTY_PEOPLE.cosorio,
    accion: "Validar saldo en cero",
    facturas: 1,
    monto: 41766000,
    creada: new Date(2026, 6, 28),
    compromiso: new Date(2026, 7, 3),
    limite: new Date(2026, 7, 15),
    diasSinGestion: 27
  },
  {
    id: "NOV-1070",
    tipo: "acuerdo",
    estado: "en_gestion",
    cliente: { nombre: "ALKOSTO S.A.", nit: "860030777" },
    ejecutivo: NOVELTY_PEOPLE.gtorres,
    responsable: NOVELTY_PEOPLE.gtorres,
    accion: "Llamar antes del vencimiento",
    facturas: 2,
    monto: 201 * M,
    creada: new Date(2026, 7, 4),
    compromiso: new Date(2026, 8, 4),
    limite: new Date(2026, 8, 22),
    diasSinGestion: 21
  },
  {
    id: "NOV-1079",
    tipo: "nc_precio",
    estado: "esperando_aprob",
    cliente: { nombre: "DISTRIBUIDORA TROPICAL DEL CARIBE S.A.S.", nit: "900412855" },
    ejecutivo: NOVELTY_PEOPLE.malfonso,
    responsable: NOVELTY_PEOPLE.malfonso,
    accion: "Radicar novedad en formulario Back Office",
    facturas: 2,
    monto: 120 * M,
    creada: new Date(2026, 7, 6),
    compromiso: new Date(2026, 8, 12),
    limite: new Date(2026, 8, 2),
    diasSinGestion: 23
  },
  {
    id: "NOV-1081",
    tipo: "pago_ni",
    estado: "aprobada",
    cliente: { nombre: "COOPERATIVA CONSUMO MEDELLÍN", nit: "817497224" },
    ejecutivo: NOVELTY_PEOPLE.malfonso,
    responsable: NOVELTY_PEOPLE.malfonso,
    accion: "Solicitar detalle de pago al cliente",
    facturas: 2,
    monto: 76 * M,
    creada: new Date(2026, 7, 10),
    compromiso: new Date(2026, 8, 1),
    limite: new Date(2026, 8, 3),
    diasSinGestion: 6
  },
  {
    id: "NOV-1076",
    tipo: "refact",
    estado: "sin_asignar",
    cliente: { nombre: "SUPERMERCADOS LA 14 S.A.", nit: "890303025" },
    ejecutivo: NOVELTY_PEOPLE.gtorres,
    // Nadie la ha tomado: alimenta la tarjeta "Sin responsable" y la columna
    // "Sin asignar" del tablero.
    responsable: null,
    accion: "Solicitar anulación de la factura",
    facturas: 1,
    monto: 31 * M,
    creada: new Date(2026, 7, 8),
    compromiso: new Date(2026, 7, 14),
    limite: new Date(2026, 8, 4),
    diasSinGestion: null
  }
];

/**
 * Un único detalle para el modal: lo abren todas las filas y todas las tarjetas
 * del tablero. Está cargado a propósito — un ticket vencido y otro resuelto
 * fuera de fecha, adjuntos y los cinco tipos de entrada de bitácora — para que
 * el modal muestre todo lo que puede llegar a mostrar.
 */
export const NOVELTY_DETAIL: IWalletGroupDetail = {
  clave: "NOV-1048",
  tipo: "novedad",
  novedad: {
    id: "NOV-1048",
    tipoNom: "Cruce de saldos / legalización",
    estado: { nom: "En gestión", sev: "idle" },
    compromiso: new Date(2026, 7, 3),
    limite: new Date(2026, 7, 15),
    responsable: NOVELTY_PEOPLE.cosorio,
    cerrada: false
  },
  cliente: { nombre: "KOBA COLOMBIA S.A.S. (D1)", nit: "894204193" },
  ejecutivo: NOVELTY_PEOPLE.cosorio,
  monto: 41766000,
  tramos: [0, 0, 0, 41766000, 0, 0],
  facturas: [
    {
      id: "NOV-1048-1",
      doc: "FV-2026-02418",
      vence: dias(HOY, -75),
      dias: 75,
      tramo: 3,
      saldo: 41766000
    }
  ],
  tickets: [
    {
      id: "TK-2412",
      titulo: "Validar saldo en cero",
      comentario: "Confirmar en el módulo de aplicación que la factura queda saldada.",
      categoria: "Aplicación o cruce en SAP",
      responsable: NOVELTY_PEOPLE.cosorio,
      deadline: new Date(2026, 7, 3),
      estado: "abierto"
    },
    {
      id: "TK-2408",
      titulo: "Solicitar compensación en SAP",
      categoria: "Conciliación de saldos",
      responsable: NOVELTY_PEOPLE.backoffice,
      deadline: new Date(2026, 6, 28),
      estado: "resuelto",
      // Resuelto después del deadline: la tarjeta sale como "Fuera de fecha".
      resueltoEl: new Date(2026, 6, 30),
      adjuntos: [{ nombre: "relacion_facturas.xlsx", peso: "86 KB" }]
    }
  ],
  bitacora: [
    {
      id: "b1",
      fecha: new Date(2026, 6, 28),
      autor: NOVELTY_PEOPLE.cosorio,
      tipo: "evento",
      texto: "Novedad creada sobre 1 factura por $41.766.000.",
      adjuntos: [{ nombre: "correo_aprobacion.msg", peso: "58 KB" }]
    },
    {
      id: "b2",
      fecha: new Date(2026, 6, 28),
      autor: NOVELTY_PEOPLE.backoffice,
      tipo: "ticket",
      texto: "Solicitar compensación en SAP",
      ticketId: "TK-2408"
    },
    {
      id: "b3",
      fecha: new Date(2026, 6, 30),
      autor: NOVELTY_PEOPLE.backoffice,
      tipo: "ticket_ok",
      texto: "Resolvió: Solicitar compensación en SAP",
      ticketId: "TK-2408"
    },
    {
      id: "b4",
      fecha: new Date(2026, 6, 31),
      autor: null,
      tipo: "comentario",
      texto: "Tesorería confirma que el pago entró sin referencia de factura."
    },
    {
      id: "b5",
      fecha: new Date(2026, 7, 3),
      autor: NOVELTY_PEOPLE.cosorio,
      tipo: "ticket",
      texto: "Validar saldo en cero",
      ticketId: "TK-2412"
    },
    {
      id: "b6",
      fecha: new Date(2026, 7, 4),
      autor: NOVELTY_PEOPLE.cosorio,
      tipo: "adjunto",
      texto: "No contestan en el conmutador, se insiste por WhatsApp.",
      adjuntos: [{ nombre: "soporte_nota_credito.pdf", peso: "412 KB" }]
    }
  ],
  diasSinGestion: 27
};
