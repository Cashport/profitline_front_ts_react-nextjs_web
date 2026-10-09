export enum ApprovalType {
  NEW_CLIENT = "NEW_CLIENT",
  DISCOUNT_REQUEST = "DISCOUNT_REQUEST",
  COMPRA_MATERIAL = "COMPRA_MATERIAL",
  PURCHASE_ORDER = "PURCHASE_ORDER",
  ANNUAL_DISCOUNT_NEGOTIATION = "ANNUAL_DISCOUNT_NEGOTIATION",
  MANAGER_BONIFICATION_NEGOTIATION = "MANAGER_BONIFICATION_NEGOTIATION",
  DISCOUNT_PACKAGE_NEGOTIATION = "DISCOUNT_PACKAGE_NEGOTIATION",
  PROMOTION_NEGOTIATION = "PROMOTION_NEGOTIATION"
}

export const APPROVAL_TYPE_LABELS: Record<ApprovalType, string> = {
  [ApprovalType.NEW_CLIENT]: "Nuevo Cliente",
  [ApprovalType.DISCOUNT_REQUEST]: "Solicitud de Descuento",
  [ApprovalType.COMPRA_MATERIAL]: "Compra de Material",
  [ApprovalType.PURCHASE_ORDER]: "Orden de Compra",
  [ApprovalType.ANNUAL_DISCOUNT_NEGOTIATION]: "Descuento negociación del cliente",
  [ApprovalType.MANAGER_BONIFICATION_NEGOTIATION]: "Bonificación negociacion del cliente",
  [ApprovalType.DISCOUNT_PACKAGE_NEGOTIATION]: "Paquete de descuentos",
  [ApprovalType.PROMOTION_NEGOTIATION]: "Promociones"
};

export enum ApprovalStepStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED"
}

export const APPROVAL_STEP_STATUS_LABELS: Record<ApprovalStepStatus, string> = {
  [ApprovalStepStatus.PENDING]: "Pendiente",
  [ApprovalStepStatus.IN_PROGRESS]: "En Progreso",
  [ApprovalStepStatus.APPROVED]: "Aprobado",
  [ApprovalStepStatus.REJECTED]: "Rechazado",
  [ApprovalStepStatus.CANCELLED]: "Cancelado"
};

export const APPROVAL_STEP_STATUS_COLORS: Record<
  ApprovalStepStatus,
  { color: string; backgroundColor: string }
> = {
  [ApprovalStepStatus.PENDING]: { color: "#D97706", backgroundColor: "#FFEDD5" }, // Orange
  [ApprovalStepStatus.IN_PROGRESS]: { color: "#2563EB", backgroundColor: "#DBEAFE" }, // Blue
  [ApprovalStepStatus.APPROVED]: { color: "#16A34A", backgroundColor: "#D1FAE5" }, // Green
  [ApprovalStepStatus.REJECTED]: { color: "#DC2626", backgroundColor: "#FEE2E2" }, // Red
  [ApprovalStepStatus.CANCELLED]: { color: "#6B7280", backgroundColor: "#F3F4F6" } // Gray
};
