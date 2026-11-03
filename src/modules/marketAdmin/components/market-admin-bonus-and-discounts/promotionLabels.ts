import type { Messages } from "@/i18n/types";

/** Clave en marketAdmin.promotionTypes para cada tipo de promoción del backend. */
export const PROMOTION_TYPE_LABEL_KEYS: Record<
  "AMOUNT" | "SKU",
  keyof Messages["marketAdmin"]["promotionTypes"]
> = {
  AMOUNT: "amount",
  SKU: "combination"
};
