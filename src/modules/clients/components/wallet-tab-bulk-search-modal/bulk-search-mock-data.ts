import { BulkResultKind, IBulkAction, IBulkPayment, IBulkSearchRow } from "./types";

// Datos de ejemplo mientras no exista el endpoint de búsqueda masiva

export const MOCK_STATUS_COLORS: Record<string, string> = {
  Saldo: "#3a3a3a",
  Pagada: "#ff7a1a",
  Novedad: "#f5317f",
  "Facturado mes actual": "#8c8c8c"
};

export const MOCK_PAID_STATUS = "Pagada";

// Porcentaje de las facturas encontradas que cae en cada estado
const MOCK_STATUS_WEIGHTS: [string, number][] = [
  ["Saldo", 55],
  ["Pagada", 18],
  ["Novedad", 7],
  ["Facturado mes actual", 20]
];

const MOCK_OTHER_CLIENTS = ["Farmatodo", "Cafam", "Colsubsidio", "Pasteur", "Locatel"];

export const RESULT_META: Record<
  BulkResultKind,
  { label: string; plural: string; bg: string; color: string; dot: string }
> = {
  found: {
    label: "Encontrada",
    plural: "Encontradas",
    bg: "#eef7d6",
    color: "#4a6b00",
    dot: "#7cb518"
  },
  missing: {
    label: "No encontrada",
    plural: "No encontradas",
    bg: "#fdecec",
    color: "#c4321c",
    dot: "#e5484d"
  },
  other: {
    label: "De otro cliente",
    plural: "De otro cliente",
    bg: "#fff4e0",
    color: "#ad6800",
    dot: "#f5a524"
  },
  dup: { label: "Duplicada", plural: "Duplicadas", bg: "#f0f0f0", color: "#6b6b6b", dot: "#b0b0b0" }
};

export const BULK_ACTIONS: IBulkAction[] = [
  {
    key: "estado",
    label: "Cambiar estado",
    description: "Mueve las facturas a un nuevo estado",
    verb: "Cambiar estado de"
  },
  {
    key: "pago",
    label: "Aplicar pago",
    description: "Cruza un pago recibido contra las facturas",
    verb: "Aplicar pago a"
  },
  {
    key: "novedad",
    label: "Registrar novedad",
    description: "Glosa, devolución o faltante",
    verb: "Registrar novedad en"
  },
  {
    key: "radicar",
    label: "Radicar facturas",
    description: "Marca como radicadas ante el cliente",
    verb: "Radicar"
  },
  {
    key: "estado_cta",
    label: "Enviar estado de cuenta",
    description: "Envía el detalle al contacto de cartera",
    verb: "Enviar estado de cuenta de"
  }
];

export const MOCK_NEW_STATUSES = [
  "Radicada",
  "En revisión",
  "Aprobada para pago",
  "Glosada",
  "Castigada"
];

export const MOCK_NOVELTY_TYPES = ["Glosa", "Devolución", "Faltante", "Diferencia de precio"];

export const MOCK_PAYMENTS: IBulkPayment[] = [
  { id: "PG-88121", bank: "Bancolombia", date: "Recibido 22/09/2026", amount: 4850000000 },
  { id: "PG-88107", bank: "Davivienda", date: "Recibido 19/09/2026", amount: 1275400000 },
  { id: "PG-88094", bank: "BBVA", date: "Recibido 15/09/2026", amount: 312900000 }
];

// Hash FNV-1a: el mismo id siempre da el mismo resultado
const hashId = (id: string) => {
  let hash = 2166136261;
  for (let i = 0; i < id.length; i++) {
    hash ^= id.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

// Lista de ejemplo con algunos repetidos y algunos ids que no existen
export const sampleIds = (count: number) => {
  const ids: string[] = [];
  for (let i = 0; i < count; i++) {
    if (i % 211 === 7) ids.push(ids[i - 3]);
    else if (i % 67 === 5) ids.push(`VT-9${String(40000 + i).slice(-5)}`);
    else ids.push(`VT-${226000 + i}`);
  }
  return ids;
};

// Simula el cruce con la cartera: sólo existen los VT-2xxxxx y `matchRate` % de ellos se encuentra
export const classifyIds = (ids: string[], matchRate = 94) => {
  const seen = new Set<string>();

  return ids.map((id, key): IBulkSearchRow => {
    if (seen.has(id)) return { key, id, result: "dup" };
    seen.add(id);

    const hash = hashId(id);
    const roll = hash % 100;
    if (!/^VT-2\d{5}$/.test(id)) return { key, id, result: "missing" };
    if (roll < 2) {
      return {
        key,
        id,
        result: "other",
        otherClient: MOCK_OTHER_CLIENTS[(hash >>> 8) % MOCK_OTHER_CLIENTS.length]
      };
    }
    if (roll < 2 + (100 - matchRate)) return { key, id, result: "missing" };

    let weight = (hash >>> 9) % 100;
    let status = MOCK_STATUS_WEIGHTS[0][0];
    for (const [name, percentage] of MOCK_STATUS_WEIGHTS) {
      if (weight < percentage) {
        status = name;
        break;
      }
      weight -= percentage;
    }
    const base = ((hash >>> 3) % 1000) / 1000;

    return {
      key,
      id,
      result: "found",
      status,
      amount: Math.round((base * base * 120e6 + 280000) / 100) * 100,
      dueDays: (hash >>> 13) % 140
    };
  });
};
