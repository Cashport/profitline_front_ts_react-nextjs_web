export interface DocumentType {
  id: number;
  value: string;
  label: string;
}
/* 1	NIT
2	Cedula
3	Pasaporte
4	Cedula de extranjeria */
export const DOCUMENT_TYPES: DocumentType[] = [
  { id: 1, value: "nit", label: "NIT" },
  { id: 2, value: "cc", label: "Cédula de Ciudadanía" },
  { id: 3, value: "pasaporte", label: "Pasaporte" },
  { id: 4, value: "ce", label: "Cédula de Extranjería" }
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
  { id: 1, value: "cupo", label: "Cupo" },
  { id: 2, value: "contado", label: "Contado" },
  { id: 3, value: "pasarela", label: "Pasarela" }
];

export const getPaymentTypeById = (id: number) =>
  PAYMENT_TYPES.find((type) => type.id === id);

export const getPaymentTypeByValue = (value: string) =>
  PAYMENT_TYPES.find((type) => type.value === value);
