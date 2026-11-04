import { Bag, CalendarBlank, UsersThree } from "phosphor-react";

export const discountTypesByOrder = [1, 2, 3, 4];

export const typesWithOutMinByOrder = [1, 2];

export const typesWithMinByOrder = [3, 4];

export const discountTypesByClient = [5, 6];

export const discountTypeByAnnual = [7];

// nameKey / labelKey: claves en discounts.categories / discounts.types; se traducen al renderizar.
export type DiscountCategoryKey = "byOrder" | "byClient" | "annual";
export type DiscountTypeLabelKey =
  | "quantity"
  | "amount"
  | "crossSelling"
  | "crossFiller"
  | "firstPurchase"
  | "allPurchases"
  | "annualPlan";

const discountCategories: {
  [key: string]: {
    id: number;
    nameKey: DiscountCategoryKey;
    discountType: number[];
    Icon: () => any;
  };
} = {
  byOrder: {
    id: 1,
    nameKey: "byOrder",
    discountType: discountTypesByOrder,
    Icon: () => <Bag size={32} />
  },
  byClient: {
    id: 2,
    nameKey: "byClient",
    discountType: discountTypesByClient,
    Icon: () => <UsersThree size={32} />
  },
  annual: {
    id: 3,
    nameKey: "annual",
    discountType: discountTypeByAnnual,
    Icon: () => <CalendarBlank size={32} />
  }
};

/** options[*].value is conected with discountCategories[*].discountType */
export const options: { labelKey: DiscountTypeLabelKey; value: number }[] = [
  { labelKey: "quantity", value: 1 },
  { labelKey: "amount", value: 2 },
  { labelKey: "crossSelling", value: 3 },
  { labelKey: "crossFiller", value: 4 },
  { labelKey: "firstPurchase", value: 5 },
  { labelKey: "allPurchases", value: 6 },
  { labelKey: "annualPlan", value: 7 }
];

export const getOptionsByType = (type: number) => {
  return options.filter((op) =>
    Object.values(discountCategories)
      .find((t) => t.id === type)
      ?.discountType.includes(op.value)
  );
};

export default discountCategories;
