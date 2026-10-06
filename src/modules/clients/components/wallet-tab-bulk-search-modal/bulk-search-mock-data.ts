import { BulkResultKind, IBulkAction, IBulkPayment } from "./types";

// La búsqueda ya usa el servicio; la acción masiva sigue con datos de ejemplo
// mientras no exista su endpoint

/** Estado que la acción deja fuera por defecto y que no cuenta como pendiente al aplicar pagos. */
export const PAID_STATUS = "Pagada";

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
