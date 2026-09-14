/* ============================================================
   DATOS SIMULADOS — SE REEMPLAZAN POR EL API
   ------------------------------------------------------------
   Sólo queda el detalle del modal: la bandeja ya lee del API.
   ============================================================ */
import { WALLET_PEOPLE } from "@/modules/walletModule/mocked-data";
import { HOY, dias } from "@/modules/walletModule/utils/format";
import type { IWalletGroupDetail, IWalletPerson } from "@/modules/walletModule/types";

/** Las personas de cartera más el ejecutivo propio de esta bandeja. */
export const NOVELTY_PEOPLE: Record<string, IWalletPerson> = {
  ...WALLET_PEOPLE,
  malfonso: { id: "malfonso", nombre: "Miguel Alfonso", iniciales: "MA" }
};

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
  totalFacturas: 1,
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
