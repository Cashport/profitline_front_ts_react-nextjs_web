/* ============================================================
   DATOS SIMULADOS — SE REEMPLAZAN POR EL API
   ------------------------------------------------------------
   Mantienen la forma que debe devolver el backend: al conectar el
   servicio sólo cambia el origen, no los componentes.
   ============================================================ */
import { TRAMO_DIAS } from "./constants";
import { HOY, dias } from "./utils/format";
import {
  IWalletGroupDetail,
  IWalletInvoice,
  IWalletPerson,
  TramoIndex
} from "./types";

const M = 1e6;
const MM = 1e9;

/* La matriz, sus totales y los grupos de facturas ya no se simulan: llegan
   del endpoint /portfolio/matrix (ver utils/api-adapter.ts).

   Lo que sigue abajo SÍ sigue siendo simulado, porque todavía no existe
   endpoint que lo entregue: las personas y el detalle de gestión de un
   grupo (bitácora y tickets). Es una HU aparte. */

export const WALLET_PEOPLE: Record<string, IWalletPerson> = {
  cosorio: { id: "cosorio", nombre: "Cristina Osorio", iniciales: "CO" },
  gtorres: { id: "gtorres", nombre: "Germán Torres", iniciales: "GT" },
  mbermudez: { id: "mbermudez", nombre: "Mónica Bermúdez", iniciales: "MB" },
  backoffice: { id: "backoffice", nombre: "Back Office", iniciales: "BO" },
  comercial: { id: "comercial", nombre: "Comercial", iniciales: "CM" }
};

/**
 * Deriva las facturas de un grupo a partir de su reparto por tramo, para que
 * el conteo, el saldo y la barra del modal cuadren por construcción con la
 * fila de la tabla. Sin aleatoriedad: el resultado es siempre el mismo.
 */
function buildInvoices(
  clave: string,
  tramos: number[],
  nFacturas: number,
  docBase: number
): IWalletInvoice[] {
  const activos = tramos
    .map((monto, tramo) => ({ monto, tramo: tramo as TramoIndex }))
    .filter((t) => t.monto > 0);
  const total = activos.reduce((a, t) => a + t.monto, 0);

  // Un cupo por tramo con saldo; el resto se reparte por mayor resto proporcional.
  const cupos = activos.map(() => 1);
  const sobrantes = Math.max(0, nFacturas - activos.length);
  const cuota = activos.map((t) => (sobrantes * t.monto) / total);
  cuota.forEach((c, i) => (cupos[i] += Math.floor(c)));

  let falta = nFacturas - cupos.reduce((a, b) => a + b, 0);
  const porResto = cuota
    .map((c, i) => ({ i, resto: c - Math.floor(c) }))
    .sort((a, b) => b.resto - a.resto || a.i - b.i);
  for (let k = 0; falta > 0; k++, falta--) cupos[porResto[k % porResto.length].i]++;

  const facturas: IWalletInvoice[] = [];
  let n = docBase;

  activos.forEach(({ monto, tramo }, i) => {
    const partes = Array.from({ length: cupos[i] }, () => Math.round(monto / cupos[i]));
    partes[0] += monto - partes.reduce((a, b) => a + b, 0); // el redondeo cae en la primera

    const mora = TRAMO_DIAS[tramo];
    partes.forEach((saldo) => {
      n += 1;
      facturas.push({
        id: `${clave}-${n}`,
        doc: `FV-2026-${String(n).padStart(5, "0")}`,
        vence: dias(HOY, -mora),
        dias: mora,
        tramo,
        saldo
      });
    });
  });

  return facturas;
}

export const WALLET_GROUP_DETAILS: Record<string, IWalletGroupDetail> = {
  "NOV-1041": {
    clave: "NOV-1041",
    tipo: "novedad",
    novedad: {
      id: "NOV-1041",
      tipoNom: "Nota crédito comercial",
      estado: { nom: "En gestión", sev: "idle" },
      compromiso: new Date(2026, 8, 12),
      limite: new Date(2026, 8, 26),
      responsable: WALLET_PEOPLE.cosorio,
      cerrada: false
    },
    cliente: { nombre: "OXXO COLOMBIA S.A.S.", nit: "843326788" },
    ejecutivo: WALLET_PEOPLE.cosorio,
    monto: 412 * M,
    tramos: [0, 168 * M, 121 * M, 49 * M, 74 * M, 0],
    facturas: buildInvoices("NOV-1041", [0, 168 * M, 121 * M, 49 * M, 74 * M, 0], 7, 1040),
    bitacora: [
      {
        id: "b1",
        fecha: new Date(2026, 7, 18),
        autor: WALLET_PEOPLE.cosorio,
        tipo: "comentario",
        texto: "Se solicita nota crédito comercial por diferencia en el descuento pactado."
      },
      {
        id: "b2",
        fecha: new Date(2026, 7, 24),
        autor: WALLET_PEOPLE.cosorio,
        tipo: "adjunto",
        texto: "Se adjunta el acuerdo comercial firmado.",
        adjuntos: [{ nombre: "acuerdo-comercial-oxxo.pdf", peso: "318 KB" }]
      },
      {
        id: "b3",
        fecha: dias(HOY, -2),
        autor: WALLET_PEOPLE.cosorio,
        tipo: "ticket",
        texto: "Solicitó la aprobación de la nota crédito a Comercial.",
        ticketId: "TK-4410"
      }
    ],
    tickets: [
      {
        id: "TK-4410",
        titulo: "Aprobación de la NC por Comercial",
        comentario: "El descuento pactado está en la cláusula 4 del acuerdo.",
        categoria: "Aprobación comercial o RGM",
        responsable: WALLET_PEOPLE.comercial,
        deadline: dias(HOY, 3),
        estado: "abierto"
      },
      {
        id: "TK-4402",
        titulo: "Confirmar el valor de la NC con el KAM",
        categoria: "Llamada al cliente",
        responsable: WALLET_PEOPLE.cosorio,
        deadline: dias(HOY, -11),
        estado: "resuelto",
        resueltoEl: dias(HOY, -12)
      }
    ],
    diasSinGestion: 2
  },

  "NOV-1042": {
    clave: "NOV-1042",
    tipo: "novedad",
    novedad: {
      id: "NOV-1042",
      tipoNom: "Factura rechazada / sin radicar",
      estado: { nom: "Esperando aprobación", sev: "warn" },
      compromiso: new Date(2026, 7, 28),
      limite: new Date(2026, 8, 5),
      responsable: WALLET_PEOPLE.backoffice,
      cerrada: false
    },
    cliente: { nombre: "KOBA COLOMBIA S.A.S. (D1)", nit: "894204193" },
    ejecutivo: WALLET_PEOPLE.cosorio,
    monto: 268 * M,
    tramos: [0, 0, 94 * M, 71 * M, 61 * M, 42 * M],
    facturas: buildInvoices("NOV-1042", [0, 0, 94 * M, 71 * M, 61 * M, 42 * M], 4, 2070),
    bitacora: [
      {
        id: "b1",
        fecha: new Date(2026, 7, 12),
        autor: WALLET_PEOPLE.backoffice,
        tipo: "comentario",
        texto: "El cliente rechaza la radicación: faltan los soportes de entrega."
      },
      {
        id: "b2",
        fecha: dias(HOY, -9),
        autor: WALLET_PEOPLE.backoffice,
        tipo: "ticket",
        texto: "Abrió el ticket de reradicación.",
        ticketId: "TK-4381"
      }
    ],
    tickets: [
      {
        id: "TK-4381",
        titulo: "Reradicar las 4 facturas en el portal del cliente",
        comentario: "Adjuntar las remisiones firmadas junto con cada factura.",
        categoria: "Radicación o reradicación",
        responsable: WALLET_PEOPLE.backoffice,
        deadline: dias(HOY, -3),
        estado: "abierto",
        adjuntos: [{ nombre: "remisiones-koba.zip", peso: "1,2 MB" }]
      }
    ],
    diasSinGestion: 9
  },

  "C003|sin_conciliar": {
    clave: "C003|sin_conciliar",
    tipo: "sin_conciliar",
    cliente: { nombre: "ALMACENES ÉXITO S.A.", nit: "846874074" },
    ejecutivo: WALLET_PEOPLE.mbermudez,
    monto: 336 * M,
    tramos: [98 * M, 84 * M, 61 * M, 39 * M, 28 * M, 26 * M],
    facturas: buildInvoices(
      "C003|sin_conciliar",
      [98 * M, 84 * M, 61 * M, 39 * M, 28 * M, 26 * M],
      12,
      3110
    ),
    bitacora: [],
    tickets: [],
    diasSinGestion: null
  },

  "C004|conciliado": {
    clave: "C004|conciliado",
    tipo: "conciliado",
    cliente: { nombre: "ARCOS DORADOS COLOMBIA S.A.S.", nit: "810162228" },
    ejecutivo: WALLET_PEOPLE.gtorres,
    monto: 1.18 * MM,
    tramos: [742 * M, 216 * M, 94 * M, 0, 78 * M, 50 * M],
    facturas: buildInvoices(
      "C004|conciliado",
      [742 * M, 216 * M, 94 * M, 0, 78 * M, 50 * M],
      21,
      4180
    ),
    bitacora: [
      {
        id: "b1",
        fecha: new Date(2026, 7, 8),
        autor: WALLET_PEOPLE.gtorres,
        tipo: "comentario",
        texto: "Tesorería confirma que entra en el ciclo de pago del 15."
      },
      {
        id: "b2",
        fecha: dias(HOY, -4),
        autor: WALLET_PEOPLE.gtorres,
        tipo: "comentario",
        texto: "Se envía estado de cuenta al área de pagos del cliente."
      }
    ],
    tickets: [],
    diasSinGestion: 4
  }
};
