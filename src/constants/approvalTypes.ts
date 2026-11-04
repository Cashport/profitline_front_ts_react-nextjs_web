import { getTranslator } from "@/i18n/translator";

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

const APPROVAL_TYPE_KEYS: Record<ApprovalType, string> = {
  [ApprovalType.NEW_CLIENT]: "newCustomer",
  [ApprovalType.DISCOUNT_REQUEST]: "discountRequest",
  [ApprovalType.COMPRA_MATERIAL]: "materialPurchase",
  [ApprovalType.PURCHASE_ORDER]: "purchaseOrder",
  [ApprovalType.ANNUAL_DISCOUNT_NEGOTIATION]: "annualDiscountNegotiation",
  [ApprovalType.MANAGER_BONIFICATION_NEGOTIATION]: "freeGoodsNegotiation",
  [ApprovalType.DISCOUNT_PACKAGE_NEGOTIATION]: "discountPackage",
  [ApprovalType.PROMOTION_NEGOTIATION]: "promotions"
};

// Etiquetas visibles: cada propiedad es un getter que traduce al leerla (idioma activo).
const translatedLabels = <K extends string>(keys: Record<K, string>, prefix: string) =>
  Object.defineProperties(
    {} as Record<K, string>,
    Object.fromEntries(
      Object.entries(keys).map(([code, key]) => [
        code,
        {
          enumerable: true,
          get: () =>
            (getTranslator("shared") as unknown as (k: string) => string)(`${prefix}.${key}`)
        }
      ])
    )
  );

export const APPROVAL_TYPE_LABELS = translatedLabels(APPROVAL_TYPE_KEYS, "constants.approvalTypes");

export enum ApprovalStepStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED"
}

const APPROVAL_STEP_STATUS_KEYS: Record<ApprovalStepStatus, string> = {
  [ApprovalStepStatus.PENDING]: "pending",
  [ApprovalStepStatus.IN_PROGRESS]: "inProgress",
  [ApprovalStepStatus.APPROVED]: "approved",
  [ApprovalStepStatus.REJECTED]: "rejected",
  [ApprovalStepStatus.CANCELLED]: "canceled"
};

export const APPROVAL_STEP_STATUS_LABELS = translatedLabels(
  APPROVAL_STEP_STATUS_KEYS,
  "constants.approvalStepStatus"
);

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
