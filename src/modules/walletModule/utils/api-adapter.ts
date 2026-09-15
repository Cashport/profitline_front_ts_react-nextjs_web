/* Traduce la respuesta de /portfolio/matrix a los tipos que consumen los
   componentes de este módulo. Vive aparte para que el diseño no dependa de
   la forma exacta del API: si el contrato cambia, se toca sólo este archivo. */
import { EST_META, ORDEN_EST, TRAMOS } from "../constants";
import { HOY, diasEntre } from "./format";
import type {
  EstadoKey,
  IWalletAttachment,
  IWalletClientRow,
  IWalletDocument,
  IWalletGroupDetail,
  IWalletGroupRow,
  IWalletMatrixCell,
  IWalletPerson,
  IWalletSummary,
  IWalletTicket,
  IWalletTimelineEntry,
  TramoIndex,
  WalletSegments
} from "../types";
import type {
  AgingBucket,
  IWalletMatrix,
  IWalletMatrixGroup,
  IWalletMatrixGroups
} from "@/types/portfolios/IWalletMatrix";
import type { IIncidentDetail, IIncidentDocument } from "@/hooks/useNoveltyDetail";
import type { IIncidentAction } from "@/types/novelties/INovelties";

/** Los seis tramos, en el orden en el que se pintan las columnas. */
export const TRAMO_BUCKETS: AgingBucket[] = [
  "corriente",
  "1-30",
  "31-60",
  "61-90",
  "91-120",
  "+120"
];

/**
 * Estados del backend → estados de la pantalla.
 *
 * "Compensada" y "Pagada sin depurar" no existen como estado de factura en
 * el catálogo (`financial_records_status`): son conceptos derivados y su
 * regla de cálculo está pendiente de definición funcional. Hasta que se
 * defina, esas dos categorías quedan en cero y su cartera aparece bajo el
 * estado real del documento — nunca inventada.
 */
const ESTADO_BY_STATUS_KEY: Record<string, EstadoKey> = {
  CONCILIADO: "conciliado",
  CON_NOVEDAD: "novedad",
  SIN_CONCILIAR: "sin_conciliar",
  SALDO: "saldo",
  SALDO_FACTURA: "saldo",
  GLOSADO: "glosado",
  DEVOLUCION: "devolucion"
};

/** Cualquier estado sin categoría propia cae en "otros", nunca se descarta:
 *  si se descartara, la barra dejaría de sumar el total de la celda. */
export const toEstadoKey = (statusKey: string): EstadoKey =>
  ESTADO_BY_STATUS_KEY[statusKey] ?? "otros";

/** El API a veces manda el nombre del cliente en null; la UI siempre espera texto. */
const clientName = (nombre: string | null | undefined): string => nombre?.trim() || "Sin nombre";

const emptyCell = (): IWalletMatrixCell => {
  const cell = { total: 0, n: 0 } as IWalletMatrixCell;
  ORDEN_EST.forEach((e) => (cell[e] = 0));
  return cell;
};

const emptySegments = (): WalletSegments => {
  const seg = { total: 0, vencido: 0, n: 0 } as WalletSegments;
  ORDEN_EST.forEach((e) => (seg[e] = 0));
  return seg;
};

/** Resumen en cero, para el primer render antes de que llegue la foto. */
export const emptySummary = (): IWalletSummary => ({
  segments: emptySegments(),
  clientes: 0
});

/** Filas de la matriz: un cliente por fila, seis celdas por fila. */
export const toClientRows = (matrix: IWalletMatrix): IWalletClientRow[] =>
  matrix.rows.map((row) => ({
    id: row.clientId,
    nombre: clientName(row.clientName),
    nit: row.clientId,
    ejecutivo: row.responsibleName ?? "Sin asignar",
    tramos: TRAMO_BUCKETS.map((bucket) => {
      const source = row.cells?.[bucket];
      const cell = emptyCell();
      if (!source) return cell;

      cell.total = source.total;
      cell.n = source.count;
      source.statuses.forEach((s) => {
        cell[toEstadoKey(s.status)] += s.amount;
      });
      return cell;
    })
  }));

/**
 * Totales de las tarjetas superiores.
 *
 * Se arman con los totales que devuelve el API sobre el universo filtrado
 * COMPLETO, no sumando las filas de la página: si se sumara la página, las
 * tarjetas cambiarían al paginar.
 */
export const toSummary = (matrix: IWalletMatrix): IWalletSummary => {
  const segments = emptySegments();
  segments.total = matrix.totals.total;
  segments.n = matrix.totals.invoices;
  segments.vencido = TRAMO_BUCKETS.slice(1).reduce(
    (acc, bucket) => acc + (matrix.totals.byAging?.[bucket]?.total ?? 0),
    0
  );

  // El desglose por estado no viene agregado a nivel global, así que se
  // reconstruye desde las celdas de la página. Es el mismo criterio que ya
  // usaba el módulo con los datos simulados.
  matrix.rows.forEach((row) =>
    TRAMO_BUCKETS.forEach((bucket) =>
      row.cells?.[bucket]?.statuses.forEach((s) => {
        segments[toEstadoKey(s.status)] += s.amount;
      })
    )
  );

  return { segments, clientes: matrix.pagination.totalClients };
};

/**
 * Identidad de un grupo dentro de la pantalla.
 *
 * La misma función la usan la tabla y el modal: si dejaran de coincidir, el
 * modal no encontraría el grupo sobre el que se hizo clic.
 */
export const groupKey = (g: IWalletMatrixGroup): string =>
  `${g.statusKey}-${g.noveltyId ?? "sin-novedad"}-${g.clientId}`;

/** Grupos de facturas de la tabla inferior. */
export const toGroupRows = (groups: IWalletMatrixGroups): IWalletGroupRow[] =>
  groups.groups.map((g) => {
    const tipo = toEstadoKey(g.statusKey);
    const meta = EST_META[tipo];
    return {
      clave: groupKey(g),
      clienteId: g.clientId,
      tipo,
      novedadId: g.noveltyId ? String(g.noveltyId) : undefined,
      // Se prefiere el vocabulario del módulo sobre el nombre crudo del ERP,
      // que llega en mayúsculas ("CONCILIADO") y no es texto de interfaz.
      detalle: g.noveltyType ?? meta.corta,
      cliente: clientName(g.clientName),
      facturas: g.invoices,
      monto: g.total,
      tramos: g.byAging ?? TRAMOS.map(() => 0),
      responsable: g.responsibleName ?? null,
      diasSinGestion: null,
      compromiso: null,
      limite: null,
      estado: { nom: g.noveltyStatus ?? meta.chipTxt, sev: meta.chip }
    };
  });

/** Del API sólo llega el nombre, así que las iniciales se derivan aquí. */
export const toPerson = (nombre: string | null | undefined): IWalletPerson | null => {
  const limpio = nombre?.trim();
  if (!limpio) return null;

  const [uno, dos] = limpio.split(/\s+/);
  return {
    id: limpio,
    nombre: limpio,
    iniciales: `${uno?.[0] ?? ""}${dos?.[0] ?? ""}`.toUpperCase()
  };
};

/** Responsable de respaldo: el formulario de tickets necesita un `id`. */
const SIN_ASIGNAR: IWalletPerson = { id: "sin-asignar", nombre: "Sin asignar", iniciales: "—" };

/**
 * Detalle del modal de gestión a partir del grupo del API.
 *
 * Sólo lleva las cifras del grupo. El seguimiento no va aquí: el modal lo pide
 * al incidente (`/invoice/incident-detail`) con `novedad.incidentId`, y lo
 * publica por `/invoice/incident-comments`; las acciones las pide a
 * `/invoice/incident/:id/actions`. Facturas y tickets van vacíos: el modal no
 * los lee de aquí (el tab de facturas está deshabilitado; el conteo que se
 * muestra es `group.invoices`).
 *
 * `tramo` es el del drilldown. Si se pidió con `aging`, el API ya recortó el
 * grupo a ese tramo: monto, reparto y conteo son la parte que cae ahí, no el
 * grupo entero, y el modal lo rotula distinto.
 */
export const toGroupDetail = (
  group: IWalletMatrixGroup,
  tramo: TramoIndex | null = null
): IWalletGroupDetail => {
  const tipo = toEstadoKey(group.statusKey);
  const meta = EST_META[tipo];
  const responsable = toPerson(group.responsibleName);

  return {
    clave: groupKey(group),
    tipo,
    novedad:
      group.noveltyId === null
        ? undefined
        : {
            id: `NOV-${group.noveltyId}`,
            incidentId: group.noveltyId,
            tipoNom: group.noveltyType ?? meta.nom,
            estado: { nom: group.noveltyStatus ?? meta.chipTxt, sev: meta.chip },
            // El endpoint de grupos no manda compromiso ni fecha límite.
            compromiso: null,
            limite: null,
            responsable,
            cerrada: false
          },
    cliente: { nombre: clientName(group.clientName), nit: group.clientId },
    ejecutivo: responsable ?? SIN_ASIGNAR,
    monto: group.total,
    tramos: group.byAging ?? TRAMOS.map(() => 0),
    tramo,
    totalFacturas: group.invoices,
    documentos: [],
    bitacora: [],
    tickets: [],
    diasSinGestion: null
  };
};

/**
 * Fecha del API → Date local. Un "YYYY-MM-DD" suelto se arma por partes:
 * `new Date("2026-09-20")` es medianoche UTC y en Colombia se pintaría el 19.
 */
export const parseApiDate = (value: string | null | undefined): Date | null => {
  if (!value) return null;
  const soloFecha = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (soloFecha) {
    const [, y, m, d] = soloFecha;
    return new Date(Number(y), Number(m) - 1, Number(d));
  }
  const fecha = new Date(value);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
};

const toDocument = (doc: IIncidentDocument): IWalletDocument => ({
  id: String(doc.incident_document_id ?? doc.document_id),
  doc: doc.id_erp ?? `#${doc.document_id}`,
  tipo: doc.document_type,
  saldoInicial: doc.initial_amount,
  saldo: doc.actual_amount,
  activa: doc.active,
  inactivaMotivo: doc.inactive_reason,
  inactivaEl: parseApiDate(doc.date_inactivated)
});

/**
 * Detalle del modal a partir del incidente (/invoice/incident-detail).
 *
 * Es la fuente de verdad cuando el grupo es una novedad: cliente, estado,
 * responsable, fechas, saldo y conteo salen de aquí, no de la fila. `base` es
 * el detalle armado desde la fila de cartera (si se abrió desde ahí) y sólo
 * aporta lo que el incidente no trae: la clave y el reparto por tramo. Los
 * tickets van vacíos: el modal los pide aparte (ver `toTickets`). `tramo` va
 * en null porque las cifras son de la novedad entera, no del recorte del
 * drilldown.
 */
export const toIncidentGroupDetail = (
  incident: IIncidentDetail,
  base?: IWalletGroupDetail | null
): IWalletGroupDetail => {
  const responsable = toPerson(incident.assigned_to_name ?? incident.responsible_user);
  const ultimaGestion = parseApiDate(incident.last_management_at);

  return {
    clave: base?.clave ?? `NOV-${incident.incident_id}`,
    tipo: "novedad",
    novedad: {
      id: `NOV-${incident.incident_id}`,
      incidentId: incident.incident_id,
      tipoNom: incident.incident_name,
      estado: {
        id: incident.novelty_status_id ?? undefined,
        nom: incident.novelty_status_name ?? incident.status_name,
        sev: EST_META.novedad.chip,
        color: incident.novelty_status_color ?? undefined
      },
      compromiso: parseApiDate(incident.next_ticket_date),
      limite: parseApiDate(incident.limit_date),
      responsable,
      cerrada: incident.is_closed
    },
    cliente: { nombre: clientName(incident.client), nit: incident.client_id },
    ejecutivo: responsable ?? SIN_ASIGNAR,
    monto: incident.actual_amount,
    tramos: base?.tramos ?? TRAMOS.map(() => 0),
    tramo: null,
    totalFacturas: incident.actual_count,
    documentos: (incident.documents ?? []).map(toDocument),
    bitacora: [],
    tickets: [],
    diasSinGestion: ultimaGestion ? Math.max(0, diasEntre(ultimaGestion, HOY)) : null
  };
};

/**
 * Acción de la novedad (/invoice/incident/:id/actions) → ticket del modal.
 *
 * `id` es el código visible y `actionId` el numérico del API. Sólo OPEN está
 * documentado como estado abierto: cualquier otro se lee como resuelto.
 */
export const toTicket = (action: IIncidentAction): IWalletTicket => ({
  id: action.ticket_code,
  actionId: action.id,
  titulo: action.title,
  comentario: action.description?.trim() || undefined,
  responsable: toPerson(action.assigned_to_name) ?? SIN_ASIGNAR,
  deadline: parseApiDate(action.due_date),
  estado: action.status === "OPEN" ? "abierto" : "resuelto",
  resueltoEl: parseApiDate(action.resolved_at) ?? undefined,
  comentarioResolucion: action.resolution_comment?.trim() || undefined
});

export const toTickets = (actions: IIncidentAction[] = []): IWalletTicket[] =>
  actions.map(toTicket);

/** Los adjuntos de un evento llegan sin tipar: URL suelta u objeto con nombre. */
const toAttachment = (file: unknown): IWalletAttachment => {
  const obj = typeof file === "string" ? null : (file as { name?: string; url?: string } | null);
  const url = typeof file === "string" ? file : obj?.url;
  const raw = obj?.name ?? url ?? "";
  const nombre = decodeURIComponent(raw.split("/").pop()?.split("?")[0] || "") || "adjunto";
  return { nombre, peso: "", url: url || undefined };
};

/**
 * Bitácora del modal a partir del incidente.
 *
 * Abre con la creación de la novedad (evidencia y adjuntos con los que se
 * abrió) y sigue con los eventos, de más viejo a más nuevo porque el
 * seguimiento se lee de abajo hacia arriba: lo último queda siempre a la vista.
 */
export const toTimelineEntries = (incident: IIncidentDetail): IWalletTimelineEntry[] => {
  const evidencia = (incident.evidence_files ?? []).map(toAttachment);
  const creacion: IWalletTimelineEntry = {
    id: "ev-creacion",
    fecha: parseApiDate(incident.date) ?? new Date(0),
    autor: toPerson(incident.responsible_user),
    tipo: "evento",
    texto: incident.evidence_comments?.trim() || "Novedad creada",
    adjuntos: evidencia.length ? evidencia : undefined
  };

  const eventos = [...(incident.events ?? [])]
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .map((ev, i): IWalletTimelineEntry => {
      const adjuntos = (ev.files ?? []).map(toAttachment);
      const esDecision = !!(ev.approved_by || ev.rejected_by);
      const texto =
        ev.comments?.trim() || (ev.approved_by ? "Aprobó la novedad" : "Rechazó la novedad");

      return {
        id: `ev-${i}`,
        fecha: new Date(ev.created_at),
        autor: toPerson(ev.created_by || ev.approved_by || ev.rejected_by),
        tipo: esDecision ? "evento" : adjuntos.length ? "adjunto" : "comentario",
        texto,
        adjuntos: adjuntos.length ? adjuntos : undefined
      };
    });

  return [creacion, ...eventos];
};
