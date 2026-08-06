import dayjs from "dayjs";

import { CONCEPTOS } from "./constants";
import { IInvoiceClaimRow } from "./types";

/**
 * Placeholder rows shown while the claims endpoint is not wired into the table yet.
 * One row per estado of interest: en disputa, contestada y lista para pago.
 */
export const getMockedClaims = (invoiceIdErp: string): IInvoiceClaimRow[] => [
  {
    id: `${invoiceIdErp}-G01`,
    concepto: CONCEPTOS[0].label,
    codigo: CONCEPTOS[0].codigo,
    monto: 1250000,
    estado: "En disputa",
    fechaGlosa: dayjs().subtract(20, "day"),
    fechaContestacion: null,
    observacion: "En análisis por auditoría médica"
  },
  {
    id: `${invoiceIdErp}-G02`,
    concepto: CONCEPTOS[1].label,
    codigo: CONCEPTOS[1].codigo,
    monto: 480000,
    estado: "Contestada",
    fechaGlosa: dayjs().subtract(15, "day"),
    fechaContestacion: dayjs().subtract(6, "day"),
    observacion: "Respuesta enviada al pagador"
  },
  {
    id: `${invoiceIdErp}-G03`,
    concepto: CONCEPTOS[4].label,
    codigo: CONCEPTOS[4].codigo,
    monto: 320000,
    estado: "Lista para pago",
    fechaGlosa: dayjs().subtract(12, "day"),
    fechaContestacion: dayjs().subtract(3, "day"),
    observacion: "Sin novedades"
  }
];
