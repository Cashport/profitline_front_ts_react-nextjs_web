export const DISCOUNTS_BASE = "/descuentos";
export const MARKET_ADMIN_DISCOUNTS_BASE = "/market-admin/bonusAndDiscounts";

// Keys of the tabs rendered by MarketAdminBonusAndDiscounts
export const MARKET_ADMIN_DISCOUNTS_TABS = {
  packages: "paquetes",
  rules: "reglas",
  bonuses: "bonificados"
} as const;

export type MarketAdminDiscountsTab =
  (typeof MARKET_ADMIN_DISCOUNTS_TABS)[keyof typeof MARKET_ADMIN_DISCOUNTS_TABS];

export const marketAdminDiscountsListPath = (tab: MarketAdminDiscountsTab) =>
  `${MARKET_ADMIN_DISCOUNTS_BASE}?tab=${tab}`;
