/* Los tickets viven en el detalle de su grupo (walletModule/mocked-data), que es
   su único dueño. Aquí sólo se aplanan y se les cuelga el contexto del grupo:
   así la bandeja y el rail del modal no se pueden contradecir.

   Es el `contextoTicket` de la referencia, con la búsqueda ya resuelta. */
import { WALLET_GROUP_DETAILS } from "@/modules/walletModule/mocked-data";
import type { ITicketRow } from "./types";

export const TICKET_ROWS: ITicketRow[] = Object.values(WALLET_GROUP_DETAILS).flatMap((detalle) =>
  detalle.tickets.map((ticket) => ({
    ticket,
    clave: detalle.clave,
    cliente: detalle.cliente.nombre,
    monto: detalle.monto,
    novedadId: detalle.novedad?.id ?? null
  }))
);
