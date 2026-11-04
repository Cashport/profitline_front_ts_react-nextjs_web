import { getTranslator } from "@/i18n/translator";

// Las etiquetas se resuelven al leerlas (getter) para usar siempre el idioma activo;
// `value` e `id` son los valores que viajan al backend y no se traducen.
const label = (key: string) => () =>
  (getTranslator("shared") as unknown as (k: string) => string)(key);

export interface DocumentType {
  id: number;
  value: string;
  label: string;
}
/* 1	NIT
2	Cedula
3	Pasaporte
4	Cedula de extranjeria */
function withLabel<T extends { id: number; value: string }>(item: T, key: string) {
  return Object.defineProperty(item, "label", {
    get: label(key),
    enumerable: true
  }) as T & { label: string };
}

export const DOCUMENT_TYPES: DocumentType[] = [
  withLabel({ id: 1, value: "nit" }, "constants.documentTypes.nit"),
  withLabel({ id: 2, value: "cc" }, "constants.documentTypes.cc"),
  withLabel({ id: 3, value: "pasaporte" }, "constants.documentTypes.passport"),
  withLabel({ id: 4, value: "ce" }, "constants.documentTypes.foreignId")
];

// Helper para obtener el ID por value
export const getDocumentTypeId = (value: string): number | undefined => {
  return DOCUMENT_TYPES.find((type) => type.value === value)?.id;
};

// Helper para obtener el value por ID
export const getDocumentTypeValue = (id: number): string | undefined => {
  return DOCUMENT_TYPES.find((type) => type.id === id)?.value;
};

// Helper para obtener el label por ID
export const getDocumentTypeLabel = (id: number): string | undefined => {
  return DOCUMENT_TYPES.find((type) => type.id === id)?.label;
};

export interface PaymentType {
  id: number;
  value: string;
  label: string;
}

export const PAYMENT_TYPES: PaymentType[] = [
  withLabel({ id: 1, value: "cupo" }, "constants.paymentTypes.credit"),
  withLabel({ id: 2, value: "contado" }, "constants.paymentTypes.cash"),
  withLabel({ id: 3, value: "pasarela" }, "constants.paymentTypes.gateway")
];

export const getPaymentTypeById = (id: number) => PAYMENT_TYPES.find((type) => type.id === id);

export const getPaymentTypeByValue = (value: string) =>
  PAYMENT_TYPES.find((type) => type.value === value);
