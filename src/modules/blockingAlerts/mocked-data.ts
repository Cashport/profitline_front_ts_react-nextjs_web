/* ============================================================
   DATOS SIMULADOS — SE REEMPLAZAN POR EL API
   ------------------------------------------------------------
   Ejemplo del prototipo de producto (corte 24/09/2026): siete clientes
   —cinco con sus puntos de venta— y ~65 tiendas generadas para que el
   listado pagine. Aquí se aplican las reglas de bloqueo (facturas de
   +60 días o cupo superado; alerta desde 45 días) y se arman los
   totales, porque en producción el backend los entrega ya calculados.
   ============================================================ */
import type {
  BlockingAlertStatus,
  IBlockingAlertBalance,
  IBlockingAlertCreditNote,
  IBlockingAlertDetail,
  IBlockingAlertPaidInvoice,
  IBlockingAlertPayment,
  IBlockingAlertRow,
  IBlockingAlertsResponse,
  IBlockingAlertsTotals
} from "@/types/blockingAlerts/IBlockingAlerts";

const CUTOFF_AT = "2026-09-24T08:00:00-05:00";
const TODAY = Date.UTC(2026, 8, 24);
const BLOCK_DAYS = 60;
const WARN_DAYS = 45;

const isoDaysAgo = (days: number) => new Date(TODAY - days * 864e5).toISOString().slice(0, 10);
const sum = <T>(items: T[], by: (item: T) => number) => items.reduce((s, x) => s + by(x), 0);

interface RawInvoice {
  number: string;
  days: number;
  amount: number;
  ship_to_name: string | null;
}

interface RawEntity {
  client_id: string;
  client_name: string;
  ship_to_code: string | null;
  name: string;
  contact_name: string;
  portfolio: number;
  /** Negativa: saldo a favor. */
  past_due: number;
  quota?: number;
  /** Bloqueado en el punto de venta (p. ej. por cupo) aunque no tenga facturas de +60 días. */
  blocked_days?: number;
  overdue: RawInvoice[];
  upcoming?: RawInvoice[];
  credit_notes: IBlockingAlertCreditNote[];
  available_payments: IBlockingAlertPayment[];
  pending_balances: IBlockingAlertBalance[];
  paid_invoices: IBlockingAlertPaidInvoice[];
  stores?: RawEntity[];
}

/** Reparte `total` en facturas con esos días de mora (negativos: por vencer). */
const split = (start: number, total: number, days: number[], fr: number[]): RawInvoice[] => {
  let acc = 0;
  return days.map((d, i) => {
    const amount = i < fr.length ? Math.round(total * fr[i]) : total - acc;
    acc += amount;
    return { number: `FE ${start + i * 587}`, days: d, amount, ship_to_name: null };
  });
};

const pendingBalance = (id: string, amount: number): IBlockingAlertBalance => ({
  id,
  date: "2026-09-22",
  status: "Pendiente soporte",
  amount
});

const empty = { credit_notes: [], available_payments: [], pending_balances: [], paid_invoices: [] };

const CLIENTS: RawEntity[] = [
  {
    client_id: "c1",
    client_name: "ALMACENES EXITO S.A.",
    ship_to_code: null,
    name: "ALMACENES EXITO S.A.",
    contact_name: "Tesorería · Almacenes Éxito",
    portfolio: 39599858082,
    past_due: 7312777151,
    overdue: [],
    credit_notes: [
      { id: "NC-10231", type: "Devolución producto", date: "2026-09-18", amount: 120418900 },
      { id: "NC-10244", type: "Negociaciones comerciales", date: "2026-09-20", amount: 98400000 },
      { id: "NC-10252", type: "Averías", date: "2026-09-22", amount: 26500000 }
    ],
    available_payments: [
      { id: "PG-88412", date: "2026-09-23", amount: 184500000 },
      { id: "PG-88430", date: "2026-09-24", amount: 62300000 }
    ],
    pending_balances: [pendingBalance("48477", 69593696), pendingBalance("48478", 109486647)],
    paid_invoices: [
      { id: "FE 207902", number: "FE 207902", paid_at: "2026-09-19", amount: 412880300 },
      { id: "FE 208015", number: "FE 208015", paid_at: "2026-09-22", amount: 96340120 }
    ]
  },
  {
    client_id: "c2",
    client_name: "KOBA COLOMBIA SAS",
    ship_to_code: null,
    name: "KOBA COLOMBIA SAS",
    contact_name: "Cuentas por pagar · Koba",
    portfolio: 26909652658,
    past_due: 5050651810,
    overdue: [],
    credit_notes: [
      { id: "NC-10198", type: "Negociaciones comerciales", date: "2026-09-15", amount: 60250120 },
      { id: "NC-10236", type: "Averías", date: "2026-09-19", amount: 28200000 }
    ],
    available_payments: [{ id: "PG-88377", date: "2026-09-22", amount: 150000000 }],
    pending_balances: [],
    paid_invoices: [
      { id: "FE 209301", number: "FE 209301", paid_at: "2026-09-21", amount: 318455900 }
    ]
  },
  {
    client_id: "c3",
    client_name: "OXXO COLOMBIA SAS",
    ship_to_code: null,
    name: "OXXO COLOMBIA SAS",
    contact_name: "Tesorería · OXXO",
    portfolio: 23305904429,
    past_due: 4370468339,
    overdue: [],
    credit_notes: [
      { id: "NC-10210", type: "Devolución producto", date: "2026-09-17", amount: 61207330 }
    ],
    available_payments: [],
    pending_balances: [],
    paid_invoices: [
      { id: "FE 209744", number: "FE 209744", paid_at: "2026-09-23", amount: 145900000 }
    ]
  },
  {
    client_id: "c4",
    client_name: "JERONIMO MARTINS COLOMBIA SAS",
    ship_to_code: null,
    name: "JERONIMO MARTINS COLOMBIA SAS",
    contact_name: "Tesorería · Jerónimo Martins",
    portfolio: 18106541228,
    past_due: -2888860216,
    overdue: [],
    credit_notes: [
      { id: "NC-10175", type: "Negociaciones comerciales", date: "2026-09-12", amount: 90004500 },
      { id: "NC-10227", type: "Devolución producto", date: "2026-09-18", amount: 30000000 }
    ],
    available_payments: [{ id: "PG-88351", date: "2026-09-21", amount: 500000000 }],
    pending_balances: [],
    paid_invoices: []
  },
  {
    client_id: "c5",
    client_name: "OLIMPICA SA",
    ship_to_code: null,
    name: "OLIMPICA SA",
    contact_name: "Tesorería · Olímpica",
    quota: 15000000000,
    portfolio: 14013825930,
    past_due: 2035301044,
    overdue: [],
    credit_notes: [{ id: "NC-10240", type: "Averías", date: "2026-09-20", amount: 42915600 }],
    available_payments: [{ id: "PG-88420", date: "2026-09-23", amount: 40000000 }],
    pending_balances: [pendingBalance("48476", 38623382)],
    paid_invoices: [
      { id: "FE 207118", number: "FE 207118", paid_at: "2026-09-20", amount: 88210450 }
    ]
  },
  {
    client_id: "c6",
    client_name: "LA PERRADA DE PEDRO",
    ship_to_code: null,
    name: "LA PERRADA DE PEDRO",
    contact_name: "Pedro · propietario",
    portfolio: 4860000,
    past_due: 1940500,
    overdue: split(212002, 1940500, [67, 41], [0.55]),
    credit_notes: [],
    available_payments: [{ id: "PG-88441", date: "2026-09-24", amount: 350000 }],
    pending_balances: [pendingBalance("48479", -1027300)],
    paid_invoices: []
  },
  {
    client_id: "c7",
    client_name: "INVERSIONES VARUNA SAS",
    ship_to_code: null,
    name: "INVERSIONES VARUNA SAS",
    contact_name: "Administración · Varuna",
    portfolio: 12450300,
    past_due: 3215800,
    overdue: split(212340, 3215800, [49, 30, 12], [0.45, 0.33]),
    credit_notes: [
      { id: "NC-10255", type: "Devolución producto", date: "2026-09-23", amount: 180000 }
    ],
    available_payments: [],
    pending_balances: [pendingBalance("48480", -39901)],
    paid_invoices: []
  }
];

/** Generador con semilla: los datos de ejemplo son siempre los mismos. */
const seeded = (seed: number) => {
  let state = seed;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
};

// Tiendas de ejemplo (tienda a tienda) para ver la paginación.
(function addShops() {
  const rnd = seeded(7);
  const A = [
    "TIENDA",
    "MINIMERCADO",
    "SUPERMERCADO",
    "AUTOSERVICIO",
    "DISTRIBUIDORA",
    "MERCA",
    "ESTANCO",
    "DEPÓSITO",
    "PANADERÍA",
    "CIGARRERÍA"
  ];
  const B = [
    "LA ESQUINA",
    "DON JOSÉ",
    "EL PORVENIR",
    "LOS ANDES",
    "SAN MARTÍN",
    "LA 14",
    "EL VECINO",
    "DOÑA ROSA",
    "LA CAMPIÑA",
    "EL TRIUNFO",
    "LA FE",
    "BUENAVISTA",
    "EL PARAÍSO",
    "LA ECONOMÍA",
    "SANTA LUCÍA",
    "EL RECREO",
    "LAS PALMAS",
    "LA MACARENA",
    "EL DIVINO NIÑO",
    "LA ORQUÍDEA"
  ];
  const C = ["S.A.S.", "SAS", "", "LTDA", "", "Y CÍA"];
  const pick = (list: string[]) => list[Math.floor(rnd() * list.length)];
  const used = new Set<string>();
  for (let n = 0; n < 65; n++) {
    let name: string;
    do {
      name = `${pick(A)} ${pick(B)} ${pick(C)}`.trim();
    } while (used.has(name));
    used.add(name);
    const portfolio = Math.round((2 + rnd() * 180) * 1e6);
    const share = rnd() < 0.18 ? 0 : 0.12 + rnd() * 0.5;
    const pastDue = Math.round(portfolio * share);
    const oldest = 8 + Math.floor(rnd() * 80);
    const days = pastDue
      ? [oldest, Math.max(3, oldest - 11 - Math.floor(rnd() * 15)), Math.max(1, oldest - 30)]
      : [];
    CLIENTS.push({
      client_id: `t${n + 1}`,
      client_name: name,
      ship_to_code: null,
      name,
      contact_name: `Propietario · ${name}`,
      portfolio,
      past_due: pastDue,
      overdue: pastDue ? split(220000 + n * 41, pastDue, days, [0.5, 0.3]) : [],
      ...empty
    });
  }
})();

const LOCATIONS = [
  "Laureles",
  "El Poblado",
  "Envigado",
  "Itagüí",
  "Bello",
  "Calle 80",
  "Chapinero",
  "Usaquén",
  "Suba",
  "Kennedy",
  "Calle 72",
  "Puerto Colombia",
  "Soledad",
  "Malambo",
  "El Prado",
  "Riomar",
  "Bocagrande",
  "Manga",
  "Rodadero",
  "Cali Norte",
  "Unicentro",
  "Chipichape",
  "Ciudad Jardín",
  "Palmira",
  "Jamundí",
  "Pereira Centro",
  "Dosquebradas",
  "Manizales",
  "Armenia",
  "Ibagué",
  "Neiva",
  "Villavicencio",
  "Tunja",
  "Cabecera",
  "Floridablanca",
  "Cúcuta",
  "Montería",
  "Sincelejo",
  "Valledupar",
  "Riohacha",
  "Pasto",
  "Popayán",
  "Fontibón",
  "Engativá",
  "Bosa",
  "Soacha",
  "Zipaquirá",
  "Chía",
  "Cajicá",
  "Mosquera",
  "Funza",
  "Facatativá",
  "Girardot",
  "Sabaneta",
  "La Estrella",
  "Rionegro"
];

interface StoreSpec {
  count: number;
  base: number;
  brands: string[];
  /** [días de mora, días bloqueado] de los puntos bloqueados en el ship-to. */
  flagged?: [number, number][];
  blocked?: number[];
  warning?: number[];
  current?: number[];
}

const STORE_SPEC: Record<string, StoreSpec> = {
  c1: {
    count: 42,
    base: 100100,
    brands: ["Éxito", "Éxito", "Carulla", "Surtimax", "Éxito Express"],
    blocked: [74, 66, 63],
    warning: [57, 52, 49, 47, 45],
    current: [38, 31, 27, 22, 18, 13]
  },
  c2: {
    count: 26,
    base: 200100,
    brands: ["D1"],
    flagged: [
      [58, 3],
      [56, 1]
    ],
    warning: [53, 50, 47, 46],
    current: [33, 25, 19, 8]
  },
  c3: {
    count: 30,
    base: 300100,
    brands: ["OXXO"],
    flagged: [[59, 2]],
    warning: [52, 48, 45],
    current: [38, 30, 21]
  },
  c4: { count: 24, base: 400100, brands: ["Ara"] },
  c5: {
    count: 38,
    base: 500100,
    brands: ["Olímpica", "Olímpica", "SAO"],
    flagged: [
      [52, 6],
      [49, 4],
      [44, 2],
      [40, 1]
    ],
    warning: [50, 47, 46, 45, 45],
    current: [37, 28, 22, 15, 9]
  }
};

// Puntos de venta de los clientes grandes: se reparten la cartera y lo vencido del cliente.
(function addStores() {
  const rnd = seeded(11);
  let fe = 300000;
  const invoices = (total: number, days: number[], fr: number[], store: string): RawInvoice[] => {
    let acc = 0;
    return days.map((d, i) => {
      const amount = i < days.length - 1 ? Math.round(total * fr[i]) : total - acc;
      acc += amount;
      fe += 37 + Math.floor(rnd() * 360);
      return { number: `FE ${fe}`, days: d, amount, ship_to_name: store };
    });
  };

  CLIENTS.forEach((client) => {
    const spec = STORE_SPEC[client.client_id];
    if (!spec) return;
    const locs = LOCATIONS.slice();
    for (let i = locs.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [locs[i], locs[j]] = [locs[j], locs[i]];
    }
    const overdue: { days: number; weight: number; blockedDays?: number; amount: number }[] = [
      ...(spec.flagged ?? []).map(([days, blockedDays]) => ({
        days,
        blockedDays,
        weight: 3,
        amount: 0
      })),
      ...(spec.blocked ?? []).map((days) => ({ days, weight: 3, amount: 0 })),
      ...(spec.warning ?? []).map((days) => ({ days, weight: 2, amount: 0 })),
      ...(spec.current ?? []).map((days) => ({ days, weight: 1, amount: 0 }))
    ];
    const totalPastDue = Math.max(0, client.past_due);
    overdue.forEach((o) => (o.weight *= 0.6 + rnd() * 0.8));
    const weights = sum(overdue, (o) => o.weight);
    let accPastDue = 0;
    overdue.forEach((o, i) => {
      o.amount =
        i < overdue.length - 1
          ? Math.round((totalPastDue * o.weight) / weights)
          : totalPastDue - accPastDue;
      accPastDue += o.amount;
    });
    const shares = Array.from({ length: spec.count }, () => 0.35 + rnd() * 1.6);
    const sharesSum = sum(shares, (s) => s);
    const mins = shares.map((_, i) => (overdue[i] ? Math.ceil(overdue[i].amount * 1.25) : 0));
    const free = client.portfolio - sum(mins, (m) => m);
    let accPortfolio = 0;
    client.stores = shares.map((share, i) => {
      const portfolio =
        i < spec.count - 1
          ? mins[i] + Math.round((free * share) / sharesSum)
          : client.portfolio - accPortfolio;
      accPortfolio += portfolio;
      const o = overdue[i];
      const name = `${spec.brands[Math.floor(rnd() * spec.brands.length)]} ${locs[i % locs.length]}`;
      const shipTo = String(spec.base + 1 + i * 7 + Math.floor(rnd() * 5));
      const storeOverdue =
        o && o.amount > 0
          ? invoices(
              o.amount,
              o.days > 20 ? [o.days, Math.max(3, o.days - 9 - Math.floor(rnd() * 14))] : [o.days],
              [0.6],
              name
            )
          : [];
      const upcoming = invoices(
        portfolio - (o?.amount ?? 0),
        rnd() < 0.5 ? [-7] : [-4, -18],
        [0.55],
        name
      );
      return {
        client_id: client.client_id,
        client_name: client.client_name,
        ship_to_code: shipTo,
        name,
        contact_name: `Administración · ${name}`,
        portfolio,
        past_due: o?.amount ?? 0,
        blocked_days: o?.blockedDays,
        overdue: storeOverdue,
        upcoming,
        ...empty
      };
    });
    client.overdue = client.stores.flatMap((s) => s.overdue);
    client.upcoming = client.stores.flatMap((s) => s.upcoming ?? []);
  });
})();

/** Estado, días y tramos de un cliente o punto de venta: lo que calcula el backend. */
const toRow = (e: RawEntity): IBlockingAlertRow => {
  const oldest = Math.max(0, ...e.overdue.map((i) => i.days));
  const overQuota = e.quota ? Math.max(0, e.portfolio - e.quota) : 0;
  let status: BlockingAlertStatus = "ok";
  if (e.past_due > 0) {
    if (oldest > BLOCK_DAYS || overQuota > 0 || e.blocked_days) status = "blocked";
    else if (oldest >= WARN_DAYS) status = "warning";
  }
  const pastDue = Math.max(0, e.past_due);
  const pastDue60 = sum(
    e.overdue.filter((i) => i.days > BLOCK_DAYS),
    (i) => i.amount
  );
  return {
    client_id: e.client_id,
    client_name: e.client_name,
    ship_to_code: e.ship_to_code,
    name: e.name,
    status,
    blocked_days: status === "blocked" ? e.blocked_days ?? Math.max(1, oldest - BLOCK_DAYS) : null,
    days_to_block: status === "warning" ? BLOCK_DAYS - oldest : null,
    oldest_overdue_days: oldest,
    portfolio: e.portfolio,
    current: e.portfolio - pastDue,
    past_due: e.past_due,
    past_due_1_60: pastDue - pastDue60,
    past_due_60_plus: pastDue60,
    points_of_sale_count: null
  };
};

const DETAILS = new Map<string, IBlockingAlertDetail>();
const detailKey = (clientId: string, shipToCode?: string | null) =>
  shipToCode ? `${clientId}/${shipToCode}` : clientId;

const toDetail = (e: RawEntity, row: IBlockingAlertRow, idx: number): IBlockingAlertDetail => {
  const upcoming =
    e.upcoming ?? split(215100 + idx * 97, row.current, [-6, -13, -21, -28], [0.31, 0.27, 0.23]);
  return {
    ...row,
    contact_name: e.contact_name,
    invoices: [...e.overdue.sort((a, b) => b.days - a.days), ...upcoming].map((i) => ({
      id: i.number,
      number: i.number,
      ship_to_name: e.ship_to_code ? null : i.ship_to_name,
      due_date: isoDaysAgo(i.days),
      days_overdue: i.days,
      amount: i.amount
    })),
    credit_notes: e.credit_notes,
    available_payments: e.available_payments,
    pending_balances: e.pending_balances,
    paid_invoices: e.paid_invoices,
    points_of_sale: []
  };
};

const totalsOf = (rows: IBlockingAlertRow[]): IBlockingAlertsTotals => ({
  count: rows.length,
  alerts: rows.filter((r) => r.status !== "ok").length,
  portfolio: sum(rows, (r) => r.portfolio),
  current: sum(rows, (r) => r.current),
  past_due: sum(rows, (r) => Math.max(0, r.past_due)),
  past_due_1_60: sum(rows, (r) => r.past_due_1_60),
  past_due_60_plus: sum(rows, (r) => r.past_due_60_plus)
});

const RESPONSE: IBlockingAlertsResponse = (() => {
  let mirrorShipTo = 910001;
  const clients: IBlockingAlertRow[] = [];
  const pointsOfSale: IBlockingAlertRow[] = [];
  CLIENTS.forEach((client, idx) => {
    const row = toRow(client);
    const detail = toDetail(client, row, idx);
    // Un cliente sin puntos de venta registrados tiene uno solo, con su misma cartera.
    const stores: RawEntity[] = client.stores ?? [
      { ...client, ship_to_code: String((mirrorShipTo += 3)) }
    ];
    const storeRows = stores.map((store) => {
      const storeRow = toRow(store);
      const storeDetail = client.stores
        ? toDetail(store, storeRow, idx)
        : { ...detail, ...storeRow, invoices: detail.invoices };
      DETAILS.set(detailKey(client.client_id, store.ship_to_code), storeDetail);
      return storeRow;
    });
    row.points_of_sale_count = {
      total: storeRows.length,
      blocked: storeRows.filter((s) => s.status === "blocked").length,
      warning: storeRows.filter((s) => s.status === "warning").length
    };
    DETAILS.set(detailKey(client.client_id), { ...detail, ...row, points_of_sale: storeRows });
    clients.push(row);
    pointsOfSale.push(...storeRows);
  });
  return {
    cutoff_at: CUTOFF_AT,
    totals: { clients: totalsOf(clients), points_of_sale: totalsOf(pointsOfSale) },
    clients,
    points_of_sale: pointsOfSale
  };
})();

export const getBlockingAlertsMock = async (): Promise<IBlockingAlertsResponse> => RESPONSE;

export const getBlockingAlertDetailMock = async (
  clientId: string,
  shipToCode?: string
): Promise<IBlockingAlertDetail> => {
  const detail = DETAILS.get(detailKey(clientId, shipToCode));
  if (!detail) throw new Error("No encontramos este cliente o punto de venta.");
  return detail;
};
