import { getTranslator } from "@/i18n/translator";

export type ApprovalEntityStatus =
  | "BORRADOR"
  | "EN_APROBACION"
  | "APROBADA"
  | "RECHAZADA"
  | "CANCELADA"
  | "NO_APLICA";

// Fixed ids of approval_entity_status seeded by the backend.
export const APPROVAL_ENTITY_STATUS_BY_ID: Record<number, ApprovalEntityStatus> = {
  1: "BORRADOR",
  2: "EN_APROBACION",
  3: "APROBADA",
  4: "RECHAZADA",
  5: "CANCELADA",
  6: "NO_APLICA"
};

const APPROVAL_ENTITY_STATUS_KEYS: Record<ApprovalEntityStatus, string> = {
  BORRADOR: "draft",
  EN_APROBACION: "inApproval",
  APROBADA: "approved",
  RECHAZADA: "rejected",
  CANCELADA: "canceled",
  NO_APLICA: "notApplicable"
};

// Etiquetas visibles: cada propiedad es un getter que traduce al leerla (idioma activo).
export const APPROVAL_ENTITY_STATUS_LABELS = Object.defineProperties(
  {} as Record<ApprovalEntityStatus, string>,
  Object.fromEntries(
    Object.entries(APPROVAL_ENTITY_STATUS_KEYS).map(([status, key]) => [
      status,
      {
        enumerable: true,
        get: () =>
          (getTranslator("shared") as unknown as (k: string) => string)(
            `constants.approvalEntityStatus.${key}`
          )
      }
    ])
  )
);

export const APPROVAL_ENTITY_STATUS_STYLES: Record<ApprovalEntityStatus, string> = {
  BORRADOR: "bg-[#F0F0F0] text-[#666666]",
  EN_APROBACION: "bg-[#FFF5DB] text-[#9A6B00]",
  APROBADA: "bg-[#E8F9E8] text-[#1A7A1A]",
  RECHAZADA: "bg-[#FDECEC] text-[#C0262D]",
  CANCELADA: "bg-[#F0F0F0] text-[#999999]",
  NO_APLICA: "bg-[#F0F0F0] text-[#666666]"
};

export const getApprovalEntityStatus = (id?: number | null): ApprovalEntityStatus | null =>
  id == null ? null : APPROVAL_ENTITY_STATUS_BY_ID[Number(id)] ?? null;

export const getApprovalEntityStatusLabel = (id?: number | null) => {
  const status = getApprovalEntityStatus(id);
  return status ? APPROVAL_ENTITY_STATUS_LABELS[status] : "";
};
