/* Filas de las tablas de la torre a partir de la respuesta del API: agrupar,
   filtrar las vistas y ordenar. Sólo presentación: las cifras ya vienen
   calculadas por cliente. */
import type {
  ITowerAgreement,
  ITowerClientRow,
  ITowerUnappliedPayment
} from "@/types/collectionTower/ICollectionTower";
import type { SortState } from "@/modules/walletModule/types";
import { DUE_SOON_DAYS, STATUS_ORDER } from "../constants";
import type { AgreementView, Grouping } from "../types";
import { CatalogIndex, coordinatorOf, managementOf } from "./filters";
import { plural } from "./format";

export const sumBy = <T>(rows: T[], f: (row: T) => number) =>
  rows.reduce((acc, row) => acc + f(row), 0);

/* ---------- orden ---------- */

/** Clic en un encabezado: invierte si ya ordenaba por esa columna; si no, usa su dirección por defecto. */
export const nextSort = (
  cur: SortState | null,
  col: string,
  defaultDir: SortState["dir"]
): SortState =>
  cur && cur.col === col ? { col, dir: cur.dir === "asc" ? "desc" : "asc" } : { col, dir: defaultDir };

const compare = (x: string | number, y: string | number) =>
  typeof x === "string" ? x.localeCompare(String(y)) : x - Number(y);

/** Ordena por una columna; sin orden (o sin columna) deja las filas como vienen. */
export const sortRows = <T>(
  rows: T[],
  sort: SortState | null,
  value: (row: T, col: string) => string | number,
  tieBreak?: (a: T, b: T) => number
): T[] => {
  if (!sort?.col) return rows;
  const dir = sort.dir === "asc" ? 1 : -1;
  return [...rows].sort(
    (a, b) => compare(value(a, sort.col), value(b, sort.col)) * dir || (tieBreak ? tieBreak(a, b) : 0)
  );
};

/* ---------- nombres ---------- */

export const clientName = (ix: CatalogIndex, clientId: string) =>
  ix.clients.get(clientId)?.name ?? clientId;

/** "Ejecutivo · Canal" de un cliente. */
export const clientSub = (ix: CatalogIndex, clientId: string) => {
  const c = ix.clients.get(clientId);
  if (!c) return "";
  const executive = ix.executives.get(c.executiveId)?.name ?? "Sin ejecutivo";
  return `${executive} · ${ix.channels.get(c.channelId)?.name ?? "Sin canal"}`;
};

export const coordinatorOfClient = (ix: CatalogIndex, clientId: string) =>
  coordinatorOf(ix, ix.clients.get(clientId)?.executiveId ?? "");

/** Llave del grupo de un cliente en la agrupación `by`. */
const groupKeyOf = (by: Grouping, clientId: string, ix: CatalogIndex) => {
  if (by === "client") return clientId;
  const c = ix.clients.get(clientId);
  if (!c) return "";
  if (by === "executive") return c.executiveId;
  if (by === "channel") return c.channelId;
  return coordinatorOf(ix, c.executiveId);
};

export const groupName = (by: Grouping, id: string, ix: CatalogIndex) => {
  const map =
    by === "client"
      ? ix.clients
      : by === "executive"
        ? ix.executives
        : by === "channel"
          ? ix.channels
          : ix.coordinators;
  return map.get(id)?.name ?? "Sin asignar";
};

/** Agrupa las filas de clientes por la dimensión, en el orden en que llegan. */
const groupClients = (clients: ITowerClientRow[], by: Grouping, ix: CatalogIndex) => {
  const groups = new Map<string, ITowerClientRow[]>();
  clients.forEach((r) => {
    const key = groupKeyOf(by, r.clientId, ix);
    const group = groups.get(key);
    if (group) group.push(r);
    else groups.set(key, [r]);
  });
  return [...groups];
};

/* ---------- Clientes frente a su meta ---------- */

export interface GoalRow {
  id: string;
  name: string;
  sub: string;
  /** Grupo de personas o canal (no cliente): el nombre va sin mayúsculas sostenidas. */
  person: boolean;
  collected: number;
  goal: number;
  forecast: number;
  pace: number;
  diff: number;
  compliance: number;
}

const goalGroupSub = (by: Grouping, id: string, n: number, ix: CatalogIndex) => {
  const context =
    by === "executive"
      ? `Coord. ${ix.coordinators.get(coordinatorOf(ix, id))?.name ?? "—"}`
      : by === "channel"
        ? "Canal"
        : (ix.managements.get(managementOf(ix, id))?.name ?? "—");
  return `${context} · ${plural(n, "cliente", "clientes")}`;
};

/** Filas de "frente a su meta". El ritmo de un grupo es el de sus clientes ponderado por la meta. */
export function goalRows(clients: ITowerClientRow[], by: Grouping, ix: CatalogIndex): GoalRow[] {
  return groupClients(clients, by, ix).map(([id, rows]) => {
    const collected = sumBy(rows, (r) => r.collected);
    const goal = sumBy(rows, (r) => r.goal);
    const pace =
      by === "client" ? rows[0].pace : goal ? sumBy(rows, (r) => r.pace * r.goal) / goal : 1;
    return {
      id,
      name: groupName(by, id, ix),
      sub: by === "client" ? clientSub(ix, id) : goalGroupSub(by, id, rows.length, ix),
      person: by !== "client",
      collected,
      goal,
      forecast: sumBy(rows, (r) => r.forecast),
      pace,
      diff: collected - goal,
      compliance: goal ? collected / goal : 0
    };
  });
}

/* ---------- Ejecutivos frente a su meta ---------- */

export interface ExecutiveRow {
  id: string;
  name: string;
  sub: string;
  collected: number;
  goal: number;
  forecast: number;
  /** Acuerdos vigentes: pendientes que vencen antes del cierre. */
  pending: number;
  broken: number;
  overdueAgreed: number;
  overduePaid: number;
  overdueCount: number;
}

const executiveSub = (by: Grouping, id: string, n: number, ix: CatalogIndex) => {
  if (by === "client") return clientSub(ix, id);
  const context =
    by === "executive"
      ? (ix.coordinators.get(coordinatorOf(ix, id))?.name ?? "—")
      : by === "coordinator"
        ? (ix.managements.get(managementOf(ix, id))?.name ?? "—")
        : "canal";
  return `${plural(n, "cliente", "clientes")} · ${context}`;
};

const sumExecutive = (
  id: string,
  name: string,
  sub: string,
  rows: ITowerClientRow[]
): ExecutiveRow => ({
  id,
  name,
  sub,
  collected: sumBy(rows, (r) => r.collected),
  goal: sumBy(rows, (r) => r.goal),
  forecast: sumBy(rows, (r) => r.forecast),
  pending: sumBy(rows, (r) => r.pendingAgreements),
  broken: sumBy(rows, (r) => r.brokenAgreements),
  overdueAgreed: sumBy(rows, (r) => r.overdueAgreed),
  overduePaid: sumBy(rows, (r) => r.overduePaid),
  overdueCount: sumBy(rows, (r) => r.overdueCount)
});

/** Filas de la tabla de ejecutivos, de mayor a menor forecast frente a la meta. */
export function executiveRows(
  clients: ITowerClientRow[],
  by: Grouping,
  ix: CatalogIndex
): ExecutiveRow[] {
  const ratio = (r: ExecutiveRow) => (r.goal ? r.forecast / r.goal : 0);
  return groupClients(clients, by, ix)
    .map(([id, rows]) =>
      sumExecutive(id, groupName(by, id, ix), executiveSub(by, id, rows.length, ix), rows)
    )
    .sort((a, b) => ratio(b) - ratio(a));
}

/** Fila de total de la tabla de ejecutivos. */
export const executiveTotal = (clients: ITowerClientRow[]) =>
  sumExecutive("total", "Total", "", clients);

/* ---------- Detalle de acuerdos ---------- */

const agreementAmount = (a: ITowerAgreement) => (a.status === "FULFILLED" ? a.agreed : a.balance);

/** Incumplidos → pendientes → cumplidos y, dentro de cada estado, por monto. */
const byPriority = (a: ITowerAgreement, b: ITowerAgreement) =>
  STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || agreementAmount(b) - agreementAmount(a);

/** Días que muestra la columna Atraso: el atraso, o lo que falta para vencer (en negativo). */
export const agreementDays = (a: ITowerAgreement) =>
  a.lateDays || (a.status === "PENDING" ? -a.daysToDue : 0);

/**
 * Lista del detalle. Con segmentos elegidos en el gráfico, la respuesta ya
 * viene acotada a ellos y se muestra completa, por prioridad, sin importar la vista.
 */
export function agreementRows(
  agreements: ITowerAgreement[],
  view: AgreementView,
  bySegments: boolean,
  sort: SortState | null,
  ix: CatalogIndex
): ITowerAgreement[] {
  let list: ITowerAgreement[];
  if (bySegments || view === "all") list = [...agreements].sort(byPriority);
  else if (view === "broken") {
    list = agreements.filter((a) => a.status === "BROKEN").sort((a, b) => b.balance - a.balance);
  } else if (view === "dueSoon") {
    list = agreements
      .filter((a) => a.status === "PENDING" && a.daysToDue <= DUE_SOON_DAYS)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  } else {
    list = agreements
      .filter((a) => a.status === "FULFILLED")
      .sort((a, b) => b.dueDate.localeCompare(a.dueDate));
  }
  return sortRows(list, sort, (a, col) => {
    if (col === "client") return clientName(ix, a.clientId);
    if (col === "dueDate") return a.dueDate;
    if (col === "days") return agreementDays(a);
    if (col === "balance") return a.balance;
    return STATUS_ORDER[a.status];
  });
}

/* ---------- PNA ---------- */

export const pendingDays = (p: ITowerUnappliedPayment) => Math.floor(p.pendingHours / 24);

/**
 * Lista de PNA con el filtro de antigüedad y el de coordinadores. Los
 * coordinadores elegidos que ya no tienen pagos en la vista no filtran.
 */
export function unappliedRows(
  payments: ITowerUnappliedPayment[],
  minDays: number | null,
  coordinators: string[],
  sort: SortState,
  ix: CatalogIndex
) {
  let list = payments.filter((p) => minDays === null || pendingDays(p) > minDays);
  const byCoordinator = new Map<string, ITowerUnappliedPayment[]>();
  list.forEach((p) => {
    const id = coordinatorOfClient(ix, p.clientId);
    const own = byCoordinator.get(id);
    if (own) own.push(p);
    else byCoordinator.set(id, [p]);
  });
  const active = coordinators.filter((id) => byCoordinator.has(id));
  if (active.length) list = list.filter((p) => active.includes(coordinatorOfClient(ix, p.clientId)));
  const rows = sortRows(
    list,
    sort,
    (p, col) => {
      if (col === "id") return p.id;
      if (col === "client") return clientName(ix, p.clientId);
      if (col === "paidAt") return new Date(p.paidAt).getTime();
      if (col === "days") return p.pendingHours;
      return p.amount;
    },
    (a, b) => b.amount - a.amount
  );
  return { rows, byCoordinator, active };
}
