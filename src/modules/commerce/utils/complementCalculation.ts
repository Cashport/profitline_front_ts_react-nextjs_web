import { ISelectedCategories } from "../containers/create-order/create-order";
import {
  EVEN_QUANTITY_GROUP_PRODUCTS,
  EVEN_QUANTITY_PRODUCT,
  SCULPTRA_MAIN_PRODUCT,
  matchesProductIdentifier
} from "./constants/evenQuantityProducts";

export interface ComplementRequirements {
  requiredCanulas: number;
  requiredAgua: number;
  sculptraQty: number;
  restylaneTotalQty: number;
  hasMainProduct: boolean;
}

export const computeComplementRequirements = (
  selectedCategories: ISelectedCategories[]
): ComplementRequirements => {
  let sculptraQty = 0;
  let restylaneTotalQty = 0;

  selectedCategories.forEach((category) => {
    category.products.forEach((p) => {
      if (matchesProductIdentifier(p, SCULPTRA_MAIN_PRODUCT)) {
        sculptraQty += p.quantity;
        return;
      }
      if (matchesProductIdentifier(p, EVEN_QUANTITY_PRODUCT)) {
        restylaneTotalQty += p.quantity;
        return;
      }
      if (EVEN_QUANTITY_GROUP_PRODUCTS.some((id) => matchesProductIdentifier(p, id))) {
        restylaneTotalQty += p.quantity;
      }
    });
  });

  const canulasFromSculptra = sculptraQty * 2;
  const canulasFromRestylane = Math.floor(restylaneTotalQty / 2);

  return {
    requiredCanulas: canulasFromSculptra + canulasFromRestylane,
    requiredAgua: sculptraQty * 4,
    sculptraQty,
    restylaneTotalQty,
    hasMainProduct: sculptraQty > 0 || restylaneTotalQty > 0
  };
};
