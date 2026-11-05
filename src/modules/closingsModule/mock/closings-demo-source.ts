import { AGING_BUCKETS, type AgingBucket } from "@/types/closings/IClosings";

/* Generador de la maqueta (forma vieja de los datos). Solo lo usa el modo demo
   (closings-demo.ts), que lo convierte a la forma de la API. */

interface IClosingPortfolioRow {
  period: string;
  nit: string;
  client: string;
  channel: string;
  holding: string;
  manager: string;
  salesExecutive: string;
  collectionExecutive: string;
  coordinator: string;
  city: string;
  segment: string;
  balanceType: string;
  kind: "Factura" | "NC" | "Saldos";
  bucket: AgingBucket;
  amount: number;
  documents: number;
}

interface IClosingPaymentRow {
  period: string;
  nit: string;
  client: string;
  channel: string;
  paymentType: string;
  status: string;
  detail: string | null;
  amount: number;
}

interface IClosingComment {
  id: string;
  period: string;
  nit: string;
  client: string;
  text: string;
  author: string;
  createdAt: string;
}

interface IClosingInfo {
  period: string;
  cutoffDate: string;
  loadedAt: string;
  loadedBy: string;
  fileName: string;
  rows: number;
  status: "Publicado";
}

interface IClosingDataset {
  closings: IClosingInfo[];
  portfolio: IClosingPortfolioRow[];
  payments: IClosingPaymentRow[];
  comments: IClosingComment[];
}

/* Datos de prueba con la forma de la plantilla de cierre (hojas Cartera, Pagos y
   Comentarios). Nombres y montos inventados; las proporciones (canales, tramos, causales,
   estados de pago) siguen las de la plantilla real. El generador es determinístico (semilla
   fija) para que la maqueta muestre siempre lo mismo. Se borra cuando exista la carga real. */

const PERIODS = ["2026-05", "2026-06", "2026-07", "2026-08", "2026-09", "2026-10"];

// Canales (GERENCIA) con su peso en número de clientes y su mora típica.
const CHANNELS = [
  { name: "HOME MARKET", weight: 0.3, overdue: 0.19 },
  { name: "TERRITORIAL", weight: 0.27, overdue: 0.22 },
  { name: "ON PREMISE", weight: 0.22, overdue: 0.26 },
  { name: "MODELOS ALTERNATIVOS DE VENTA", weight: 0.08, overdue: 0.21 },
  { name: "INFORMAL", weight: 0.05, overdue: 0.3 },
  { name: "DISTRIBUIDORES MAYORISTA", weight: 0.05, overdue: 0.1 },
  { name: "Jurídico", weight: 0.03, overdue: 0.9 }
];

/** Peso de la cartera por canal, para que la mezcla se parezca a la de la plantilla. */
const CHANNEL_SIZE: Record<string, number> = {
  "HOME MARKET": 2.6,
  TERRITORIAL: 0.9,
  "ON PREMISE": 0.8,
  "MODELOS ALTERNATIVOS DE VENTA": 0.5,
  INFORMAL: 0.3,
  "DISTRIBUIDORES MAYORISTA": 0.6,
  Jurídico: 0.2
};

const PORTFOLIO_TARGET = 2.45e11;

// Gerente comercial y ejecutivos comerciales de cada canal.
const SALES_TEAM: Record<string, { manager: string; executives: string[] }> = {
  "HOME MARKET": {
    manager: "CAROLINA MESA",
    executives: ["VIVIANA ROJAS", "JAIRO PEÑA", "JOSE JULIAN NIÑO", "LAURA PALACIO"]
  },
  TERRITORIAL: {
    manager: "PAULA ARANGO",
    executives: ["GUSTAVO CANO", "DANIEL ZEA", "SOL CAROLINA TOBON", "NATACHA SERNA"]
  },
  "ON PREMISE": {
    manager: "SANTIAGO ZULUAGA",
    executives: ["ESTEBAN PARRA", "JUAN SEBASTIAN CASAS", "ANGIE BOTERO", "MAYRA BELTRAN"]
  },
  "MODELOS ALTERNATIVOS DE VENTA": {
    manager: "CAMILO RUEDA",
    executives: ["ANDRES SALAZAR", "SHAKIRA OSORNO"]
  },
  INFORMAL: { manager: "JORGE HENAO", executives: ["CESAR GALVIS", "WILLIAM RICO"] },
  "DISTRIBUIDORES MAYORISTA": { manager: "JORGE HENAO", executives: ["MAXIMO LOAIZA"] },
  Jurídico: { manager: "OSCAR SANTIAGO NIETO", executives: ["OSCAR SANTIAGO NIETO"] }
};

const COLLECTION_EXECUTIVES = [
  "Cristina Ospina",
  "Edwin Gaitán",
  "Angelo Rosas",
  "Diego Hurtado",
  "Andrea Catalina Nieto",
  "Mileidys Mejía"
];
const COORDINATORS = ["Cristina Ospina", "Germán Torres", "Mónica Bernal", "Natalia Cortés"];
const CITIES = [
  "BOGOTA",
  "BOGOTA",
  "BOGOTA",
  "MEDELLIN",
  "CALI",
  "BARRANQUILLA",
  "IBAGUE",
  "CARTAGENA",
  "BUCARAMANGA"
];
const HOLDINGS = [
  "CADENA ANDINA",
  "TIENDAS DE BARRIO",
  "DROGUERIAS UNIDAS",
  "HOTELES Y CLUBES",
  "CAJAS DE COMPENSACION",
  "SIN HOLDING"
];

const CLIENT_PREFIX = [
  "Almacenes",
  "Supermercados",
  "Distribuidora",
  "Comercializadora",
  "Inversiones",
  "Drogas",
  "Farmacias",
  "Tiendas",
  "Grupo",
  "Hoteles",
  "Club",
  "Caja de Compensación",
  "Mercados",
  "Cadena",
  "Restaurantes",
  "Autoservicio",
  "Estaciones",
  "Cines",
  "Gastronomía",
  "Panaderías"
];
const CLIENT_CORE = [
  "Andina",
  "del Valle",
  "La Sabana",
  "Costa Norte",
  "El Dorado",
  "Santa Fe",
  "Los Andes",
  "Pacífico",
  "Altamira",
  "San José",
  "La Montaña",
  "Del Caribe",
  "Central",
  "La 14",
  "Oriente",
  "Bolívar",
  "Colonial",
  "Sinú",
  "Magdalena",
  "Nevado",
  "Aurora",
  "Primavera",
  "La Riviera",
  "El Prado",
  "Monserrate",
  "Chicamocha",
  "Tayrona",
  "Guadalupe"
];
const CLIENT_SUFFIX = ["S.A.S.", "S.A.", "Ltda.", "S.A.S.", "S.A.S."];

/** Saldos abiertos (Tipo = Saldos) por causal (Tipo saldo), con su peso relativo. */
const OPEN_BALANCE_TYPES = [
  { name: "Negociacion comercial", weight: 0.36 },
  { name: "Factura comercial", weight: 0.14 },
  { name: "Devoluciones", weight: 0.12 },
  { name: "Averias", weight: 0.09 },
  { name: "Menor/Mayor valor pagado", weight: 0.08 },
  { name: "Revisar", weight: 0.06 },
  { name: "Por clasificar", weight: 0.05 },
  { name: "Diferencia precio", weight: 0.04 },
  { name: "Por conciliar", weight: 0.03 },
  { name: "Descuento", weight: 0.02 },
  { name: "Dif minimas", weight: 0.01 }
];

/** Notas crédito en cartera (Tipo = NC) por Segmento. */
const NOTE_TYPES = [
  { name: "Negociaciones", weight: 0.72 },
  { name: "Devolución", weight: 0.12 },
  { name: "Averia", weight: 0.11 },
  { name: "Pendiente", weight: 0.05 }
];

const PAYMENT_TYPES = ["Consignación", "Consignación", "Consignación", "Wallet"];
const UNAPPLIED_DETAIL = [
  "Identificado Cashport",
  "Compensado - En proceso",
  "No están en Cashport",
  null
];

const COMMENT_TEMPLATES = [
  "Se compartieron {n} soportes de negociaciones comerciales por ${a} MM. Generaron {p} pagos y se enviaron las notas para contabilizar y liberar la facturación bloqueada.",
  "Cliente con compromiso de pago de ${a} MM para la primera semana del mes. Se mantiene seguimiento semanal.",
  "${a} MM en proceso de refacturación; el cliente dio ok y está pendiente el ok de finanzas.",
  "El pago de ${a} MM se aplicó en Cashport el 30, pero la compañía no alcanzó a compensarlo al cierre. Queda como recaudo no aplicado.",
  "Saldos vencidos corresponden a devoluciones en validación por ${a} MM. Se solicitaron imágenes al cliente.",
  "Cliente con esquema de pago los días 2 y 16 de cada mes. Se gestiona la cancelación total de los vencimientos en ambas fechas.",
  "Pendiente la emisión de una nota por ${a} MM para liberar facturas con más de 120 días.",
  "Cliente no muestra compromiso de pago con los saldos mayores a 31 días; espera autorización de su gerencia. Se escala a comercial.",
  "Diferencias en precio en la facturación de los últimos dos meses por ${a} MM. Se abrió caso con pricing.",
  "Radicación pendiente: el cliente exige radicar los 6 de cada mes. Se reprograma la radicación de {n} facturas."
];

const AUTHORS = ["Miguel Martínez", "Natalia Cortés", "Cristina Ospina", "Edwin Gaitán"];

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20261102);
const pick = <T>(items: T[]) => items[Math.floor(rand() * items.length)];
const pickWeighted = <T extends { weight: number }>(items: T[]) => {
  let r = rand() * items.reduce((acc, i) => acc + i.weight, 0);
  for (const item of items) {
    r -= item.weight;
    if (r <= 0) return item;
  }
  return items[items.length - 1];
};

interface MockClient {
  nit: string;
  name: string;
  channel: (typeof CHANNELS)[number];
  holding: string;
  manager: string;
  salesExecutive: string;
  collectionExecutive: string;
  coordinator: string;
  city: string;
  segment: string;
  /** Cartera promedio del cliente. */
  size: number;
  /** Propensión a vencer (multiplica la del canal). */
  risk: number;
  /** Tendencia de la mora mes a mes (-1 mejora, +1 empeora). */
  drift: number;
}

const buildClients = (): MockClient[] => {
  const used = new Set<string>();
  const clients: MockClient[] = [];
  for (let i = 0; i < 160; i++) {
    let name = "";
    do {
      name = `${pick(CLIENT_PREFIX)} ${pick(CLIENT_CORE)} ${pick(CLIENT_SUFFIX)}`.toUpperCase();
    } while (used.has(name));
    used.add(name);
    const channel = pickWeighted(CHANNELS);
    const team = SALES_TEAM[channel.name];
    clients.push({
      nit: String(800000000 + Math.floor(rand() * 199999999)),
      name,
      channel,
      holding: pick(HOLDINGS),
      manager: team.manager,
      salesExecutive: pick(team.executives),
      collectionExecutive: pick(COLLECTION_EXECUTIVES),
      coordinator: pick(COORDINATORS),
      city: pick(CITIES),
      segment: rand() < 0.9 ? "FT Crédito formal" : "FT crédito informal o contado",
      // Pocos clientes grandes y una cola larga, como en la cartera real.
      size: (Math.pow(rand(), 5) + 0.004) * CHANNEL_SIZE[channel.name],
      risk: 0.35 + rand() * 1.4,
      drift: rand() * 2 - 1
    });
  }
  // Escala a una cartera total parecida a la de la plantilla (~245 mil M).
  const scale = PORTFOLIO_TARGET / clients.reduce((acc, c) => acc + c.size, 0);
  clients.forEach((c) => (c.size *= scale));
  return clients;
};

/** Reparto del vencido por tramo: la mayor parte en 0-30 y una cola que envejece. */
const OVERDUE_SHAPE: Record<Exclude<AgingBucket, "Corriente">, number> = {
  "0-30": 0.72,
  "31-60": 0.12,
  "61-90": 0.06,
  "91-120": 0.04,
  "+120": 0.1
};

const buildDataset = (): IClosingDataset => {
  const clients = buildClients();
  const portfolio: IClosingPortfolioRow[] = [];
  const payments: IClosingPaymentRow[] = [];
  const comments: IClosingComment[] = [];

  PERIODS.forEach((period, pIdx) => {
    const seasonal = 1 + 0.05 * Math.sin(pIdx * 1.3);
    clients.forEach((c) => {
      const base = {
        period,
        nit: c.nit,
        client: c.name,
        channel: c.channel.name,
        holding: c.holding,
        manager: c.manager,
        salesExecutive: c.salesExecutive,
        collectionExecutive: c.collectionExecutive,
        coordinator: c.coordinator,
        city: c.city,
        segment: c.segment
      };
      const total = c.size * seasonal * (0.88 + rand() * 0.24);
      const overdueShare = Math.min(
        0.98,
        Math.max(
          0.01,
          c.channel.overdue * c.risk * (1 + c.drift * 0.07 * (pIdx - 2.5)) * (0.8 + rand() * 0.4)
        )
      );
      const invoicesTotal = total * (0.95 + rand() * 0.03);
      const overdueAmount = invoicesTotal * overdueShare;

      portfolio.push({
        ...base,
        balanceType: "Factura",
        kind: "Factura",
        bucket: "Corriente",
        amount: invoicesTotal - overdueAmount,
        documents: Math.max(1, Math.round((invoicesTotal - overdueAmount) / 2.4e7))
      });
      (Object.keys(OVERDUE_SHAPE) as Array<keyof typeof OVERDUE_SHAPE>).forEach((bucket) => {
        const amount = overdueAmount * OVERDUE_SHAPE[bucket] * (0.5 + rand());
        if (amount < 2e5 || (bucket === "+120" && rand() < 0.5)) return;
        portfolio.push({
          ...base,
          balanceType: "Factura",
          kind: "Factura",
          bucket,
          amount,
          documents: Math.max(1, Math.round(amount / 1.8e7))
        });
      });

      // Saldos abiertos: partidas por clasificar o cruzar (negociaciones, devoluciones…).
      const openCount = rand() < 0.5 ? 1 + Math.floor(rand() * 3) : 0;
      for (let k = 0; k < openCount; k++) {
        const type = pickWeighted(OPEN_BALANCE_TYPES);
        const amount = total * (0.002 + rand() * 0.02);
        portfolio.push({
          ...base,
          balanceType: type.name,
          kind: "Saldos",
          bucket: pick(AGING_BUCKETS.slice(0, 5)),
          amount,
          documents: 1 + Math.floor(rand() * 6)
        });
      }

      // Notas crédito en cartera (negativas).
      if (rand() < 0.45) {
        const type = pickWeighted(NOTE_TYPES);
        portfolio.push({
          ...base,
          balanceType: type.name,
          kind: "NC",
          bucket: rand() < 0.7 ? "Corriente" : pick(AGING_BUCKETS.slice(1)),
          amount: -total * (0.004 + rand() * 0.03),
          documents: 1 + Math.floor(rand() * 4)
        });
      }

      // Recaudo del mes: proporcional a la cartera, con meses buenos y malos por cliente.
      const collected = total * (0.3 + rand() * 0.5) * (c.channel.name === "Jurídico" ? 0.05 : 1);
      if (rand() < 0.93) {
        // Pagos que Cashport ya tenía pero la compañía no alcanzó a compensar al cierre.
        const unapplied = rand() < 0.1 ? collected * (0.002 + rand() * 0.02) : 0;
        payments.push({
          period,
          nit: c.nit,
          client: c.name,
          channel: c.channel.name,
          paymentType: pick(PAYMENT_TYPES),
          status: "Compensado",
          detail: null,
          amount: collected - unapplied
        });
        if (unapplied) {
          payments.push({
            period,
            nit: c.nit,
            client: c.name,
            channel: c.channel.name,
            paymentType: "Consignación",
            status: rand() < 0.85 ? "Pendiente compensacion" : "Revision doble abono",
            detail: pick(UNAPPLIED_DETAIL),
            amount: unapplied
          });
        }
      }

      // Comentarios: más probables en clientes grandes o con mora alta.
      const commentChance = (c.size > 5e9 ? 0.55 : 0.07) + (overdueShare > 0.3 ? 0.25 : 0);
      if (rand() < commentChance) {
        const text = pick(COMMENT_TEMPLATES)
          .replace("{n}", String(5 + Math.floor(rand() * 80)))
          .replace("{p}", String(1 + Math.floor(rand() * 4)))
          .replace(
            "{a}",
            String(Math.max(1, Math.round((overdueAmount / 1e6) * (0.2 + rand() * 0.6))))
          );
        const day = String(3 + Math.floor(rand() * 4)).padStart(2, "0");
        const minute = String(Math.floor(rand() * 60)).padStart(2, "0");
        const [y, m] = period.split("-").map(Number);
        const next = `${m === 12 ? y + 1 : y}-${String((m % 12) + 1).padStart(2, "0")}`;
        comments.push({
          id: `${period}-${c.nit}`,
          period,
          nit: c.nit,
          client: c.name,
          text,
          author: pick(AUTHORS),
          createdAt: `${next}-${day}T10:${minute}:00`
        });
      }
    });
  });

  const closings: IClosingInfo[] = PERIODS.map((period) => {
    const [y, m] = period.split("-").map(Number);
    const last = new Date(y, m, 0).getDate();
    const next = `${m === 12 ? y + 1 : y}-${String((m % 12) + 1).padStart(2, "0")}`;
    return {
      period,
      cutoffDate: `${period}-${last}`,
      loadedAt: `${next}-02T17:40:00`,
      loadedBy: "Miguel Martínez",
      fileName: `Cartera_cierre_${period}.xlsx`,
      rows: portfolio.filter((r) => r.period === period).reduce((acc, r) => acc + r.documents, 0),
      status: "Publicado" as const
    };
  }).reverse();

  return { closings, portfolio, payments, comments };
};

export const DEMO_DATASET: IClosingDataset = buildDataset();
