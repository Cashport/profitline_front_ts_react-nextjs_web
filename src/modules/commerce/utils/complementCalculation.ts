import { ISelectedCategories } from "../containers/create-order/create-order";
import {
  EVEN_QUANTITY_GROUP_PRODUCTS,
  EVEN_QUANTITY_PRODUCT,
  FULL_CANULA_CLIENT_IDS,
  SCULPTRA_MAIN_PRODUCT,
  SCULPTRA_PACK_PRODUCT,
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
  selectedCategories: ISelectedCategories[],
  clientId?: string
): ComplementRequirements => {
  let sculptraQty = 0;
  let restylaneTotalQty = 0;

  selectedCategories.forEach((category) => {
    category.products.forEach((p) => {
      if (matchesProductIdentifier(p, SCULPTRA_PACK_PRODUCT)) {
        // El pack requiere 4 cánulas + 8 aguas por unidad = 2× el ratio de Sculptra
        sculptraQty += p.quantity * 2;
        return;
      }
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
  const isFullCanulaClient = !!clientId && FULL_CANULA_CLIENT_IDS.includes(clientId);
  const canulasFromRestylane = isFullCanulaClient
    ? restylaneTotalQty // 1 cánula per Restylane unit
    : Math.floor(restylaneTotalQty / 2); // default: 1 cánula per 2 units

  return {
    requiredCanulas: canulasFromSculptra + canulasFromRestylane,
    requiredAgua: sculptraQty * 4,
    sculptraQty,
    restylaneTotalQty,
    hasMainProduct: sculptraQty > 0 || restylaneTotalQty > 0
  };
};
