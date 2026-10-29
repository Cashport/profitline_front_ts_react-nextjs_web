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

export const APPROVAL_ENTITY_STATUS_LABELS: Record<ApprovalEntityStatus, string> = {
  BORRADOR: "Borrador",
  EN_APROBACION: "En aprobación",
  APROBADA: "Aprobada",
  RECHAZADA: "Rechazada",
  CANCELADA: "Cancelada",
  NO_APLICA: "No aplica"
};

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
