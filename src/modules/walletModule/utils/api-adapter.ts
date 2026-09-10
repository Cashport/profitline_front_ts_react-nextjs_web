/* Traduce la respuesta de /portfolio/matrix a los tipos que consumen los
   componentes de este módulo. Vive aparte para que el diseño no dependa de
   la forma exacta del API: si el contrato cambia, se toca sólo este archivo. */
import { EST_META, ORDEN_EST, TRAMOS } from "../constants";
import type {
  EstadoKey,
  IWalletClientRow,
  IWalletGroupDetail,
  IWalletGroupRow,
  IWalletInvoice,
  IWalletMatrixCell,
  IWalletPerson,
  IWalletSummary,
  TramoIndex,
  WalletSegments
} from "../types";
import type {
  AgingBucket,
  IWalletMatrix,
  IWalletMatrixGroup,
  IWalletMatrixGroups
} from "@/types/portfolios/IWalletMatrix";

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
    nombre: row.clientName,
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
      cliente: g.clientName,
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
 * La bitácora y los tickets van vacíos a propósito: no hay endpoint todavía.
 * Antes salían de los datos simulados, y por eso el modal dejó de abrir al
 * conectar la cartera — las claves del API no existen en ese mapa.
 *
 * Las facturas tampoco tienen endpoint y por eso llegan de fuera: el conteo
 * que se muestra es `group.invoices`, no la longitud de esa lista.
 *
 * `tramo` es el del drilldown. Si se pidió con `aging`, el API ya recortó el
 * grupo a ese tramo: monto, reparto y conteo son la parte que cae ahí, no el
 * grupo entero, y el modal lo rotula distinto.
 */
export const toGroupDetail = (
  group: IWalletMatrixGroup,
  facturas: IWalletInvoice[],
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
            tipoNom: group.noveltyType ?? meta.nom,
            estado: { nom: group.noveltyStatus ?? meta.chipTxt, sev: meta.chip },
            // El endpoint de grupos no manda compromiso ni fecha límite.
            compromiso: null,
            limite: null,
            responsable,
            cerrada: false
          },
    cliente: { nombre: group.clientName, nit: group.clientId },
    ejecutivo: responsable ?? SIN_ASIGNAR,
    monto: group.total,
    tramos: group.byAging ?? TRAMOS.map(() => 0),
    tramo,
    totalFacturas: group.invoices,
    facturas,
    bitacora: [],
    tickets: [],
    diasSinGestion: null
  };
};
